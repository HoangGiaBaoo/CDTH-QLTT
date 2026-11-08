package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.evidence.DoiChieuResponse;
import org.example.cdthqltt.dto.evidence.KetQuaDoiChieu;
import org.example.cdthqltt.dto.evidence.MinhChungResponse;
import org.example.cdthqltt.entity.BaoCaoThucTap;
import org.example.cdthqltt.entity.HoSoThucTap;
import org.example.cdthqltt.entity.LoaiMinhChungBatBuoc;
import org.example.cdthqltt.entity.MinhChung;
import org.example.cdthqltt.entity.enums.LoaiPhanHoi;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.entity.enums.TrangThaiPhieu;
import org.example.cdthqltt.repository.*;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.example.cdthqltt.service.storage.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/** UC07 — minh chứng và bảng đối chiếu danh mục bắt buộc (BR-07.6, CBR-16, CBR-24). */
@Service
@RequiredArgsConstructor
public class MinhChungService {

    /** SV chỉ tải lên / xóa minh chứng khi hồ sơ còn trong quá trình thực tập hoặc chờ đánh giá. */
    private static final Set<TrangThaiHoSo> DUOC_TAI_LEN = EnumSet.of(TrangThaiHoSo.DANG_THUC_TAP, TrangThaiHoSo.CHO_DANH_GIA);

    private final MinhChungRepository minhChungRepo;
    private final LoaiMinhChungBatBuocRepository danhMucRepo;
    private final BaoCaoThucTapRepository baoCaoRepo;
    private final PhanHoiRepository phanHoiRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final PhieuDanhGiaRepository phieuRepo;
    private final HoSoThucTapService hoSoService;
    private final KeHoachService keHoachService;
    private final TienDoService tienDoService;
    private final FileStorageService storage;
    private final NhatKyHeThongService nhatKyService;

    /** Hợp đồng cho UC10 điều kiện (d): không kiểm quyền (người gọi đã kiểm). */
    @Transactional(readOnly = true)
    public KetQuaDoiChieu doiChieu(Long hoSoId) {
        DoiChieuResponse bang = lapBangDoiChieu(hoSoService.layVaKiemQuyen(hoSoId, SecurityUtils.currentUser()));
        return new KetQuaDoiChieu(bang.du(), bang.loaiConThieu());
    }

    /** Như {@link #doiChieu} nhưng nhận hồ sơ đã nạp — dùng khi tính điểm hàng loạt. */
    @Transactional(readOnly = true)
    public KetQuaDoiChieu doiChieu(HoSoThucTap h) {
        DoiChieuResponse bang = lapBangDoiChieu(h);
        return new KetQuaDoiChieu(bang.du(), bang.loaiConThieu());
    }

    /** #64 */
    @Transactional(readOnly = true)
    public List<MinhChungResponse> danhSach(Long hoSoId, String loai, Integer tuan) {
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        return minhChungRepo.findByHoSoIdOrderByNgayTaiLenDesc(h.getId()).stream()
                .filter(m -> loai == null || loai.equals(m.getLoaiMinhChung()))
                .filter(m -> tuan == null || tuan.equals(m.getTuan()))
                .map(MinhChungResponse::tu)
                .toList();
    }

    /** #65 */
    @Transactional(readOnly = true)
    public DoiChieuResponse bangDoiChieu(Long hoSoId) {
        return lapBangDoiChieu(hoSoService.layVaKiemQuyen(hoSoId, SecurityUtils.currentUser()));
    }

    /** #66 — kiểm đuôi + content-type + 20 MB trong FileStorageService (CBR-24, UC07 5a). */
    @Transactional
    public MinhChungResponse taiLen(Long hoSoId, String loaiMinhChung, Integer tuan, MultipartFile tep) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, u);
        kiemConSuaDuoc(h);
        if (loaiMinhChung == null || !LoaiMinhChungDanhMuc.hopLe(loaiMinhChung)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Loại minh chứng không hợp lệ");
        }
        if (LoaiMinhChungDanhMuc.HE_THONG.contains(loaiMinhChung)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Loại \"" + LoaiMinhChungDanhMuc.tenHienThi(loaiMinhChung)
                    + "\" được hệ thống tự ghi nhận, không cần tải lên");
        }
        if (tuan != null && (tuan < 1 || tuan > h.getDot().getSoTuan())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Tuần phải từ 1 đến " + h.getDot().getSoTuan());
        }
        FileStorageService.TepDaLuu luu = storage.luu(tep, h.getId(), FileStorageService.DUOI_MINH_CHUNG);
        MinhChung m = new MinhChung();
        m.setHoSo(h);
        m.setLoaiMinhChung(loaiMinhChung);
        m.setTuan(tuan);
        m.setTenFile(luu.tenFile());
        m.setDuongDan(luu.duongDan());
        m.setKichThuoc(luu.kichThuoc());
        m.setNguoiTaiLenId(u.nguoiDungId());
        minhChungRepo.save(m);
        return MinhChungResponse.tu(m);
    }

    /** #67 — chỉ qua endpoint có kiểm quyền; thư mục uploads không phục vụ tĩnh. */
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> taiVe(Long minhChungId) {
        MinhChung m = layVaKiemQuyen(minhChungId);
        return storage.taiVe(m.getDuongDan(), m.getTenFile());
    }

    /** #68 — UC07 8a: đã chốt điểm (minh chứng bị khóa) ⇒ RESOURCE_LOCKED. */
    @Transactional
    public void xoa(Long minhChungId) {
        MinhChung m = layVaKiemQuyen(minhChungId);
        if (Boolean.TRUE.equals(m.getDaKhoa())) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ đã chốt điểm, không xóa được minh chứng");
        }
        kiemConSuaDuoc(m.getHoSo());
        nhatKyService.ghiVet("XOA_MINH_CHUNG", "minh_chung", m.getId(),
                Map.of("loai", m.getLoaiMinhChung(), "tenFile", m.getTenFile()), null);
        minhChungRepo.delete(m);
        storage.xoa(m.getDuongDan());
    }

    // ------------------------------------------------------------------

    private DoiChieuResponse lapBangDoiChieu(HoSoThucTap h) {
        List<LoaiMinhChungBatBuoc> batBuoc = danhMucRepo.findByHinhThucThucTapAndBatBuocTrue(h.getHinhThucThucTap());
        Map<String, Long> soTepTheoLoai = new HashMap<>();
        minhChungRepo.findByHoSoIdOrderByNgayTaiLenDesc(h.getId())
                .forEach(m -> soTepTheoLoai.merge(m.getLoaiMinhChung(), 1L, Long::sum));

        List<DoiChieuResponse.Dong> dong = new ArrayList<>();
        List<String> thieu = new ArrayList<>();
        for (LoaiMinhChungBatBuoc lmc : batBuoc) {
            String ma = lmc.getLoaiMinhChung();
            int soTep = soTepTheoLoai.getOrDefault(ma, 0L).intValue();
            boolean co = LoaiMinhChungDanhMuc.HE_THONG.contains(ma) ? coTuHeThong(h, ma) : soTep > 0;
            dong.add(new DoiChieuResponse.Dong(ma, LoaiMinhChungDanhMuc.tenHienThi(ma), LoaiMinhChungDanhMuc.nguon(ma), co, soTep));
            if (!co) {
                thieu.add(LoaiMinhChungDanhMuc.tenHienThi(ma));
            }
        }
        return new DoiChieuResponse(h.getId(), h.getHinhThucThucTap().name(), thieu.isEmpty(), dong, thieu);
    }

    /** Minh chứng do hệ thống sinh: đối chiếu thẳng từ dữ liệu nghiệp vụ, không bắt SV tải lại. */
    private boolean coTuHeThong(HoSoThucTap h, String ma) {
        Long id = h.getId();
        return switch (ma) {
            // Phiếu đăng ký TTTN-01 có xác nhận ĐVHD: hồ sơ đã qua bước cán bộ xác nhận.
            case LoaiMinhChungDanhMuc.PHIEU_DANG_KY -> h.getNgayGui() != null
                    && h.getTrangThai() != TrangThaiHoSo.NHAP && h.getTrangThai() != TrangThaiHoSo.CHO_DVHD;
            case LoaiMinhChungDanhMuc.NHAT_KY -> tienDoService.coNhatKy(id);
            case LoaiMinhChungDanhMuc.KE_HOACH_HOC_TAP -> keHoachService.daKhoa(id);
            case LoaiMinhChungDanhMuc.BAO_CAO_THUC_TAP -> baoCaoRepo.findTopByHoSoIdOrderByPhienBanDesc(id)
                    .filter(BaoCaoThucTap::daDuXacNhan).isPresent();
            case LoaiMinhChungDanhMuc.PHAN_HOI_08A -> phanHoiRepo.existsByHoSoIdAndLoai(id, LoaiPhanHoi.TTTN_08A);
            case LoaiMinhChungDanhMuc.PHAN_HOI_08B -> phanHoiRepo.existsByHoSoIdAndLoai(id, LoaiPhanHoi.TTTN_08B);
            // Nhận xét của GVHD nằm trong phiếu đánh giá đã nộp (nhận xét chung bắt buộc khi nộp).
            case LoaiMinhChungDanhMuc.NHAN_XET_GVHD -> phanCongRepo.findByHoSoId(id)
                    .map(p -> phieuRepo.coPhieuCuaNguoiCham(id, p.getGiangVien().getNguoiDung().getId(), TrangThaiPhieu.DA_NOP))
                    .orElse(false);
            default -> false;
        };
    }

    private MinhChung layVaKiemQuyen(Long minhChungId) {
        CurrentUser u = SecurityUtils.currentUser();
        MinhChung m = minhChungRepo.findById(minhChungId).orElse(null);
        if (m == null) {
            throw u.laAdmin() ? BusinessException.khongTimThay("minh chứng") : BusinessException.khongCoQuyen();
        }
        hoSoService.layVaKiemQuyen(m.getHoSo().getId(), u);
        return m;
    }

    private static void kiemConSuaDuoc(HoSoThucTap h) {
        if (!DUOC_TAI_LEN.contains(h.getTrangThai())) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED,
                    "Chỉ thao tác minh chứng khi hồ sơ đang thực tập hoặc chờ đánh giá");
        }
    }
}
