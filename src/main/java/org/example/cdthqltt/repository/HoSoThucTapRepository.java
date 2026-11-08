package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.HoSoThucTap;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface HoSoThucTapRepository extends JpaRepository<HoSoThucTap, Long> {

    Optional<HoSoThucTap> findBySinhVienIdAndDotId(Long sinhVienId, Long dotId);

    boolean existsBySinhVienIdAndDotId(Long sinhVienId, Long dotId);

    List<HoSoThucTap> findBySinhVienIdOrderByIdDesc(Long sinhVienId);

    List<HoSoThucTap> findByDotIdOrderById(Long dotId);

    List<HoSoThucTap> findByDotIdAndTrangThaiOrderById(Long dotId, TrangThaiHoSo trangThai);

    boolean existsByDonViId(Long donViId);

    /** Đếm động số SV cán bộ đang hướng dẫn trong đợt (CBR-03) — không lưu cột đếm. */
    @Query("""
            select count(h) from HoSoThucTap h
            where h.canBoDvhd.id = :canBoId and h.dot.id = :dotId and h.trangThai in :trangThai
            """)
    long demTheoCanBo(@Param("canBoId") Long canBoId, @Param("dotId") Long dotId,
                      @Param("trangThai") Collection<TrangThaiHoSo> trangThai);

    @Query("""
            select h from HoSoThucTap h
            where h.canBoDvhd.id = :canBoId
              and (:dotId is null or h.dot.id = :dotId)
              and (:trangThai is null or h.trangThai = :trangThai)
            order by h.id desc
            """)
    List<HoSoThucTap> theoCanBo(@Param("canBoId") Long canBoId, @Param("dotId") Long dotId,
                                @Param("trangThai") TrangThaiHoSo trangThai);

    @Query("""
            select h from HoSoThucTap h
            where exists (select p from PhanCongGvhd p where p.hoSo = h and p.giangVien.id = :giangVienId)
              and (:dotId is null or h.dot.id = :dotId)
              and (:trangThai is null or h.trangThai = :trangThai)
            order by h.id desc
            """)
    List<HoSoThucTap> theoGiangVien(@Param("giangVienId") Long giangVienId, @Param("dotId") Long dotId,
                                    @Param("trangThai") TrangThaiHoSo trangThai);

    @Query("""
            select h from HoSoThucTap h
            where (:dotId is null or h.dot.id = :dotId)
              and (:trangThai is null or h.trangThai = :trangThai)
            order by h.id desc
            """)
    List<HoSoThucTap> timKiem(@Param("dotId") Long dotId, @Param("trangThai") TrangThaiHoSo trangThai);

    /** Hồ sơ đã được cán bộ xác nhận nhưng chưa có GVHD — danh sách chờ phân công (UC05). */
    @Query("""
            select h from HoSoThucTap h
            where h.dot.id = :dotId and h.trangThai = org.example.cdthqltt.entity.enums.TrangThaiHoSo.CHO_GVHD
              and not exists (select p from PhanCongGvhd p where p.hoSo = h)
            order by h.id
            """)
    List<HoSoThucTap> choPhanCong(@Param("dotId") Long dotId);
}
