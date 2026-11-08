package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.repository.CauHoiDanhGiaRepository;
import org.example.cdthqltt.repository.ChangDanhGiaRepository;
import org.example.cdthqltt.repository.ChuanDauRaRepository;
import org.example.cdthqltt.repository.MucRubricRepository;
import org.example.cdthqltt.service.scoring.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Nạp cấu hình chấm điểm của một đợt (chặng, CLO, rubric, câu hỏi) từ CSDL và đổi sang dữ liệu đầu vào
 * Java thuần của {@link ScoringService} — mọi con số đều đọc từ bảng, không viết cứng (Đ26).
 */
@Service
@RequiredArgsConstructor
public class CauHinhTinhDiemService {

    private final ChangDanhGiaRepository changRepo;
    private final ChuanDauRaRepository cloRepo;
    private final MucRubricRepository mucRepo;
    private final CauHoiDanhGiaRepository cauHoiRepo;

    /** Cấu hình đã đổi sang record của bộ máy tính điểm. {@code bangMucHp} lấy theo rubric CLO đầu tiên. */
    public record CauHinhDot(List<CauHinhChang> chang, List<CauHinhClo> clo, List<KhoangMuc> bangMucHp) {

        public Optional<CauHinhClo> clo(String maClo) {
            return clo.stream().filter(c -> c.maClo().equals(maClo)).findFirst();
        }
    }

    @Transactional(readOnly = true)
    public CauHinhDot napChoDot(Long dotId) {
        List<CauHinhChang> chang = changRepo.findByDotIdOrderByThuTu(dotId).stream()
                .map(c -> new CauHinhChang(c.getThuTu(), c.getTen(), c.getTrongSoW()))
                .toList();
        Map<String, List<KhoangMuc>> mucTheoClo = mucRepo.theoDot(dotId).stream()
                .collect(Collectors.groupingBy(m -> m.getChuanDauRa().getMaClo(), LinkedHashMap::new,
                        Collectors.mapping(KhoangMuc::tu, Collectors.toList())));
        Map<String, Set<Integer>> changTheoClo = cauHoiRepo.theoDot(dotId).stream()
                .collect(Collectors.groupingBy(q -> q.getChuanDauRa().getMaClo(),
                        Collectors.mapping(q -> q.getChang().getThuTu(), Collectors.toSet())));
        List<CauHinhClo> clo = cloRepo.findByDotIdOrderByMaClo(dotId).stream()
                .map(c -> new CauHinhClo(c.getMaClo(), c.getTrongSoAlpha(), c.getTyLeDvhd(), c.getTyLeGvhd(),
                        changTheoClo.getOrDefault(c.getMaClo(), Set.of()),
                        mucTheoClo.getOrDefault(c.getMaClo(), List.of())))
                .toList();
        List<KhoangMuc> bangMucHp = clo.isEmpty() ? List.of() : clo.get(0).bangMuc();
        return new CauHinhDot(chang, clo, bangMucHp);
    }

    /**
     * Đổi phiếu đã nộp sang {@link PhieuDiem}. {@code nguoiVangMatId}: người dùng vắng mặt ở Tổ chặng 2 —
     * chỉ áp cho phiếu chặng có thứ tự {@code thuTuChangTo}.
     */
    public List<PhieuDiem> doiPhieu(List<PhieuDanhGia> phieu, Set<Long> nguoiVangMatId, int thuTuChangTo) {
        return phieu.stream().map(p -> {
            Map<String, java.math.BigDecimal> diem = new LinkedHashMap<>();
            for (DiemCloChiTiet d : p.getDiemClos()) {
                if (d.getDiem() != null) {
                    diem.put(d.getChuanDauRa().getMaClo(), d.getDiem());
                }
            }
            int thuTu = p.getChang().getThuTu();
            boolean vang = thuTu == thuTuChangTo && nguoiVangMatId.contains(p.getNguoiCham().getId());
            return new PhieuDiem(thuTu, p.getNhomNguoiCham(), p.getNguoiCham().getId(), vang, diem);
        }).toList();
    }
}
