package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.ThanhVienToDanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ThanhVienToDanhGiaRepository extends JpaRepository<ThanhVienToDanhGia, Long> {

    List<ThanhVienToDanhGia> findByToDanhGiaIdOrderById(Long toDanhGiaId);

    Optional<ThanhVienToDanhGia> findByToDanhGiaIdAndNguoiDungId(Long toDanhGiaId, Long nguoiDungId);

    /** Thành viên (không vắng) của tổ chứa hồ sơ — dùng kiểm quyền chấm chặng 2. */
    @Query("""
            select tv from ThanhVienToDanhGia tv
            where tv.toDanhGia.id in (select x.toDanhGia.id from ToDanhGiaHoSo x where x.hoSo.id = :hoSoId)
            order by tv.id
            """)
    List<ThanhVienToDanhGia> theoHoSo(@Param("hoSoId") Long hoSoId);
}
