package org.example.cdthqltt.service;

import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.NhomNguoiCham;
import org.example.cdthqltt.repository.PhanCongGvhdRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Thành phần Tổ đánh giá (CBR-14, Đ10 k3a) xét theo từng sinh viên như mẫu TTTN-05 (3 bản mỗi SV): người chấm của
 * một SV là mọi giảng viên trong tổ cộng cán bộ đã hướng dẫn chính SV đó. Không Spring context, không MySQL.
 */
class ToDanhGiaThanhPhanTest {

    private final Map<Long, Long> gvhdCuaHoSo = new HashMap<>();
    private ToDanhGiaService service;
    private long idTiepTheo = 1;

    private NguoiDung lan, tung, minh, quang, duc;

    @BeforeEach
    void datDuLieu() {
        PhanCongGvhdRepository phanCongRepo = mock(PhanCongGvhdRepository.class);
        when(phanCongRepo.findByHoSoId(anyLong())).thenAnswer(inv -> Optional.ofNullable(gvhdCuaHoSo.get(inv.<Long>getArgument(0)))
                .map(this::phanCong));
        service = new ToDanhGiaService(null, null, null, null, null, phanCongRepo, null, null, null);
        lan = nguoi("Trần Thị Lan");
        tung = nguoi("Phạm Hữu Tùng");
        minh = nguoi("Lê Quang Minh");
        quang = nguoi("Đinh Văn Quang");
        duc = nguoi("Tạ Minh Đức");
    }

    @Test
    void haiGiangVienChamCaNhomSinhVienNhieuDonVi() {
        // Một tổ 2 GV cho SV của hai đơn vị: mỗi SV có GVHD + 1 ủy viên + cán bộ của mình = 3 người ⇒ đạt.
        HoSoThucTap xuan = hoSo("Xuân", lan, quang);
        HoSoThucTap vinh = hoSo("Vinh", tung, duc);
        List<String> loi = service.kiemThanhPhan(
                List.of(tv(lan, NhomNguoiCham.GVHD), tv(tung, NhomNguoiCham.GVHD), tv(quang, NhomNguoiCham.DVHD), tv(duc, NhomNguoiCham.DVHD)),
                List.of(xuan, vinh));
        assertThat(loi).isEmpty();
    }

    @Test
    void baGiangVienLamMoiSinhVienCoSoNguoiChamChan() {
        // 3 GV + cán bộ của SV = 4 người chấm mỗi SV ⇒ chặn, dù tổng thành viên của tổ (4) không phải điều đang xét.
        HoSoThucTap xuan = hoSo("Xuân", lan, quang);
        List<String> loi = service.kiemThanhPhan(
                List.of(tv(lan, NhomNguoiCham.GVHD), tv(tung, NhomNguoiCham.GVHD), tv(minh, NhomNguoiCham.GVHD), tv(quang, NhomNguoiCham.DVHD)),
                List.of(xuan));
        assertThat(motLoi(loi)).contains("4 người", "số lẻ");
    }

    @Test
    void canBoKhongHuongDanSinhVienNaoTrongToBiChan() {
        // cb.duc không hướng dẫn SV nào trong tổ ⇒ không có căn cứ chấm, không được ngồi tổ.
        HoSoThucTap xuan = hoSo("Xuân", lan, quang);
        List<String> loi = service.kiemThanhPhan(
                List.of(tv(lan, NhomNguoiCham.GVHD), tv(tung, NhomNguoiCham.GVHD), tv(quang, NhomNguoiCham.DVHD), tv(duc, NhomNguoiCham.DVHD)),
                List.of(xuan));
        assertThat(motLoi(loi)).contains("Tạ Minh Đức", "không hướng dẫn sinh viên nào");
    }

    @Test
    void sinhVienThieuCanBoCuaMinhBiChan() {
        HoSoThucTap xuan = hoSo("Xuân", lan, quang);
        HoSoThucTap vinh = hoSo("Vinh", lan, duc);
        List<String> loi = service.kiemThanhPhan(
                List.of(tv(lan, NhomNguoiCham.GVHD), tv(tung, NhomNguoiCham.GVHD), tv(quang, NhomNguoiCham.DVHD)),
                List.of(xuan, vinh));
        assertThat(motLoi(loi)).contains("cán bộ ĐVHD đã hướng dẫn sinh viên Vinh");
    }

    @Test
    void chiMotGiangVienBiChan() {
        HoSoThucTap xuan = hoSo("Xuân", lan, quang);
        List<String> loi = service.kiemThanhPhan(List.of(tv(lan, NhomNguoiCham.GVHD), tv(quang, NhomNguoiCham.DVHD)), List.of(xuan));
        assertThat(motLoi(loi)).contains("ít nhất một giảng viên khác");
    }

    @Test
    void giangVienVangMatKhongDuocTinh() {
        // gv.tung vắng ⇒ còn 1 GV ⇒ chặn; thêm gv.minh thay thế ⇒ lại đủ 3 người mỗi SV.
        HoSoThucTap xuan = hoSo("Xuân", lan, quang);
        ThanhVienToDanhGia vang = tv(tung, NhomNguoiCham.GVHD);
        vang.setVangMat(true);
        List<ThanhVienToDanhGia> to = new ArrayList<>(List.of(tv(lan, NhomNguoiCham.GVHD), vang, tv(quang, NhomNguoiCham.DVHD)));
        assertThat(service.kiemThanhPhan(to, List.of(xuan))).isNotEmpty();
        to.add(tv(minh, NhomNguoiCham.GVHD));
        assertThat(service.kiemThanhPhan(to, List.of(xuan))).isEmpty();
    }

    @Test
    void canBoChiChamSinhVienMinhHuongDan() {
        HoSoThucTap xuan = hoSo("Xuân", lan, quang);
        assertThat(ToDanhGiaService.chamHoSo(tv(quang, NhomNguoiCham.DVHD), xuan)).isTrue();
        assertThat(ToDanhGiaService.chamHoSo(tv(duc, NhomNguoiCham.DVHD), xuan)).isFalse();
        assertThat(ToDanhGiaService.chamHoSo(tv(tung, NhomNguoiCham.GVHD), xuan)).isTrue();
    }

    // ------------------------------------------------------------------

    private static String motLoi(List<String> loi) {
        assertThat(loi).hasSize(1);
        return loi.get(0);
    }

    private NguoiDung nguoi(String hoTen) {
        NguoiDung nd = new NguoiDung();
        nd.setId(idTiepTheo++);
        nd.setHoTen(hoTen);
        return nd;
    }

    private HoSoThucTap hoSo(String ten, NguoiDung gvhd, NguoiDung canBo) {
        SinhVien sv = new SinhVien();
        sv.setNguoiDung(nguoi(ten));
        CanBoDvhd cb = new CanBoDvhd();
        cb.setId(idTiepTheo++);
        cb.setNguoiDung(canBo);
        HoSoThucTap h = new HoSoThucTap();
        h.setId(idTiepTheo++);
        h.setSinhVien(sv);
        h.setCanBoDvhd(cb);
        gvhdCuaHoSo.put(h.getId(), gvhd.getId());
        return h;
    }

    private PhanCongGvhd phanCong(Long nguoiDungId) {
        NguoiDung nd = new NguoiDung();
        nd.setId(nguoiDungId);
        GiangVien gv = new GiangVien();
        gv.setNguoiDung(nd);
        PhanCongGvhd p = new PhanCongGvhd();
        p.setGiangVien(gv);
        return p;
    }

    private static ThanhVienToDanhGia tv(NguoiDung nd, NhomNguoiCham nhom) {
        ThanhVienToDanhGia tv = new ThanhVienToDanhGia();
        tv.setNguoiDung(nd);
        tv.setNhomNguoiCham(nhom);
        tv.setVangMat(false);
        return tv;
    }
}
