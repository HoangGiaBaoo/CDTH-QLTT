package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.SinhVien;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SinhVienRepository extends JpaRepository<SinhVien, Long> {

    Optional<SinhVien> findByNguoiDungId(Long nguoiDungId);

    Optional<SinhVien> findByMaSv(String maSv);

    boolean existsByMaSv(String maSv);

    boolean existsByMaSvAndIdNot(String maSv, Long id);

    @EntityGraph(attributePaths = "nguoiDung")
    @Query("""
            select s from SinhVien s
            where (:tuKhoa is null or lower(s.maSv) like lower(concat('%', :tuKhoa, '%'))
                   or lower(s.nguoiDung.hoTen) like lower(concat('%', :tuKhoa, '%')))
              and (:lop is null or s.lop = :lop)
            order by s.maSv
            """)
    List<SinhVien> timKiem(@Param("tuKhoa") String tuKhoa, @Param("lop") String lop);

    /** Sinh viên mà giảng viên đang/đã là GVHD (#11 — GIANG_VIEN chỉ thấy SV mình phụ trách). */
    @EntityGraph(attributePaths = "nguoiDung")
    @Query("""
            select distinct s from SinhVien s
            where exists (select p from PhanCongGvhd p where p.hoSo.sinhVien = s and p.giangVien.id = :giangVienId)
              and (:tuKhoa is null or lower(s.maSv) like lower(concat('%', :tuKhoa, '%'))
                   or lower(s.nguoiDung.hoTen) like lower(concat('%', :tuKhoa, '%')))
              and (:lop is null or s.lop = :lop)
            order by s.maSv
            """)
    List<SinhVien> cuaGiangVien(@Param("giangVienId") Long giangVienId, @Param("tuKhoa") String tuKhoa,
                                @Param("lop") String lop);

    /** Sinh viên cán bộ ĐVHD đang/đã hướng dẫn (#11 — CAN_BO_DVHD chỉ thấy SV mình hướng dẫn). */
    @EntityGraph(attributePaths = "nguoiDung")
    @Query("""
            select distinct s from SinhVien s
            where exists (select h from HoSoThucTap h where h.sinhVien = s and h.canBoDvhd.id = :canBoId)
              and (:tuKhoa is null or lower(s.maSv) like lower(concat('%', :tuKhoa, '%'))
                   or lower(s.nguoiDung.hoTen) like lower(concat('%', :tuKhoa, '%')))
              and (:lop is null or s.lop = :lop)
            order by s.maSv
            """)
    List<SinhVien> cuaCanBo(@Param("canBoId") Long canBoId, @Param("tuKhoa") String tuKhoa, @Param("lop") String lop);

    /** GV xem được SV khi là GVHD, hoặc là thành viên Tổ đánh giá chứa hồ sơ của SV (chặng 2). */
    @Query("""
            select count(s) > 0 from SinhVien s
            where s.id = :sinhVienId and (
                exists (select p from PhanCongGvhd p where p.hoSo.sinhVien = s and p.giangVien.nguoiDung.id = :nguoiDungId)
                or exists (select tv from ThanhVienToDanhGia tv
                           where tv.nguoiDung.id = :nguoiDungId
                             and tv.toDanhGia.id in (select x.toDanhGia.id from ToDanhGiaHoSo x where x.hoSo.sinhVien = s)))
            """)
    boolean giangVienXemDuoc(@Param("sinhVienId") Long sinhVienId, @Param("nguoiDungId") Long nguoiDungId);

    @Query("""
            select count(s) > 0 from SinhVien s
            where s.id = :sinhVienId and (
                exists (select h from HoSoThucTap h where h.sinhVien = s and h.canBoDvhd.nguoiDung.id = :nguoiDungId)
                or exists (select tv from ThanhVienToDanhGia tv
                           where tv.nguoiDung.id = :nguoiDungId
                             and tv.toDanhGia.id in (select x.toDanhGia.id from ToDanhGiaHoSo x where x.hoSo.sinhVien = s)))
            """)
    boolean canBoXemDuoc(@Param("sinhVienId") Long sinhVienId, @Param("nguoiDungId") Long nguoiDungId);
}
