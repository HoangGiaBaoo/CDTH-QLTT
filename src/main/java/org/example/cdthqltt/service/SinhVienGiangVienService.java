package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.common.PageResponse;
import org.example.cdthqltt.dto.user.*;
import org.example.cdthqltt.entity.DotThucTap;
import org.example.cdthqltt.entity.GiangVien;
import org.example.cdthqltt.entity.SinhVien;
import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;
import org.example.cdthqltt.repository.DotThucTapRepository;
import org.example.cdthqltt.repository.GiangVienRepository;
import org.example.cdthqltt.repository.PhanCongGvhdRepository;
import org.example.cdthqltt.repository.SinhVienRepository;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/** Hồ sơ sinh viên, giảng viên (#11–#16). */
@Service
@RequiredArgsConstructor
public class SinhVienGiangVienService {

    private final SinhVienRepository sinhVienRepo;
    private final GiangVienRepository giangVienRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final DotThucTapRepository dotRepo;
    private final NhatKyHeThongService nhatKyService;

    /** #11 — lớp 2: GV chỉ SV mình là GVHD, cán bộ chỉ SV mình hướng dẫn. */
    @Transactional(readOnly = true)
    public PageResponse<SinhVienResponse> danhSachSinhVien(String tuKhoa, String lop, int page, int size) {
        CurrentUser u = SecurityUtils.currentUser();
        String tk = rong(tuKhoa);
        String l = rong(lop);
        List<SinhVien> ds = switch (u.vaiTro()) {
            case ADMIN -> sinhVienRepo.timKiem(tk, l);
            case GIANG_VIEN -> sinhVienRepo.cuaGiangVien(u.giangVienId(), tk, l);
            case CAN_BO_DVHD -> sinhVienRepo.cuaCanBo(u.canBoDvhdId(), tk, l);
            case SINH_VIEN -> throw BusinessException.khongCoQuyen();
        };
        return PageResponse.of(ds.stream().map(NguoiDungMapper::toSinhVien).toList(), page, size);
    }

    /** #12 */
    @Transactional(readOnly = true)
    public SinhVienResponse chiTietSinhVien(Long id) {
        CurrentUser u = SecurityUtils.currentUser();
        boolean duocXem = switch (u.vaiTro()) {
            case ADMIN -> true;
            case SINH_VIEN -> id.equals(u.sinhVienId());
            case GIANG_VIEN -> sinhVienRepo.giangVienXemDuoc(id, u.nguoiDungId());
            case CAN_BO_DVHD -> sinhVienRepo.canBoXemDuoc(id, u.nguoiDungId());
        };
        // Kiểm quyền trước khi kiểm tồn tại để không lộ id nào có thật.
        if (!duocXem) {
            throw BusinessException.khongCoQuyen();
        }
        return NguoiDungMapper.toSinhVien(laySinhVien(id));
    }

    /** #13 — đổi chương trình đào tạo làm đổi ngưỡng đạt CLO1, CLO2 nên ghi nhật ký. */
    @Transactional
    public SinhVienResponse capNhatSinhVien(Long id, CapNhatSinhVienRequest req) {
        SinhVien sv = laySinhVien(id);
        String maSv = req.maSv().trim();
        if (sinhVienRepo.existsByMaSvAndIdNot(maSv, id)) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Mã sinh viên " + maSv + " đã tồn tại");
        }
        ChuongTrinhDaoTao cu = sv.getChuongTrinhDaoTao();
        sv.setMaSv(maSv);
        sv.setLop(rong(req.lop()));
        sv.setKhoaHoc(rong(req.khoaHoc()));
        sv.setNganh(rong(req.nganh()));
        sv.setKhoaVien(rong(req.khoaVien()));
        sv.setChuongTrinhDaoTao(req.chuongTrinhDaoTao());
        if (cu != req.chuongTrinhDaoTao()) {
            nhatKyService.ghiVet("DOI_CHUONG_TRINH_DAO_TAO", "sinh_vien", sv.getId(), cu, req.chuongTrinhDaoTao());
        }
        return NguoiDungMapper.toSinhVien(sv);
    }

    /** #14 — kèm số SV đang hướng dẫn trong đợt đang chạy gần nhất / hạn mức. */
    @Transactional(readOnly = true)
    public List<GiangVienResponse> danhSachGiangVien(String tuKhoa, String boMon) {
        Long dotId = dotRepo.findByTrangThaiInOrderByNgayBatDauDesc(NguoiDungService.DOT_DANG_CHAY).stream()
                .findFirst().map(DotThucTap::getId).orElse(null);
        return giangVienRepo.timKiem(rong(tuKhoa), rong(boMon)).stream()
                .map(g -> NguoiDungMapper.toGiangVien(g, dotId == null ? 0L : phanCongRepo.demTheoGiangVien(g.getId(), dotId)))
                .toList();
    }

    /** #15 — GIANG_VIEN chỉ xem của mình. */
    @Transactional(readOnly = true)
    public GiangVienResponse chiTietGiangVien(Long id) {
        CurrentUser u = SecurityUtils.currentUser();
        if (u.laGiangVien() && !id.equals(u.giangVienId())) {
            throw BusinessException.khongCoQuyen();
        }
        return NguoiDungMapper.toGiangVien(layGiangVien(id), null);
    }

    /** #16 — CBR-04: hạn mức 5–10; không hạ dưới số SV đang hướng dẫn trong đợt đang chạy. */
    @Transactional
    public GiangVienResponse capNhatGiangVien(Long id, CapNhatGiangVienRequest req) {
        GiangVien gv = layGiangVien(id);
        Integer hanMucCu = gv.getSoSvToiDa();
        if (!req.soSvToiDa().equals(hanMucCu)) {
            for (DotThucTap dot : dotRepo.findByTrangThaiInOrderByNgayBatDauDesc(NguoiDungService.DOT_DANG_CHAY)) {
                long dangHuongDan = phanCongRepo.demTheoGiangVien(gv.getId(), dot.getId());
                if (req.soSvToiDa() < dangHuongDan) {
                    throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Giảng viên đang hướng dẫn "
                            + dangHuongDan + " sinh viên trong đợt " + dot.getMaDot()
                            + ", không thể đặt hạn mức thấp hơn (Điều 6 khoản 2 điểm b)");
                }
            }
            nhatKyService.ghiVet("DOI_HAN_MUC_GIANG_VIEN", "giang_vien", gv.getId(),
                    Map.of("soSvToiDa", hanMucCu), Map.of("soSvToiDa", req.soSvToiDa()));
        }
        gv.setBoMon(rong(req.boMon()));
        gv.setKhoaVien(rong(req.khoaVien()));
        gv.setHocHamHocVi(rong(req.hocHamHocVi()));
        gv.setSoSvToiDa(req.soSvToiDa());
        return NguoiDungMapper.toGiangVien(gv, null);
    }

    private SinhVien laySinhVien(Long id) {
        return sinhVienRepo.findById(id).orElseThrow(() -> BusinessException.khongTimThay("sinh viên"));
    }

    private GiangVien layGiangVien(Long id) {
        return giangVienRepo.findById(id).orElseThrow(() -> BusinessException.khongTimThay("giảng viên"));
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
