package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.DonViHuongDan;
import org.example.cdthqltt.entity.enums.TrangThaiPheDuyet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DonViHuongDanRepository extends JpaRepository<DonViHuongDan, Long> {

    boolean existsByMaDvhd(String maDvhd);

    @Query("""
            select d from DonViHuongDan d
            where d.daXoa = false
              and (:trangThai is null or d.trangThaiPheDuyet = :trangThai)
              and (:tuKhoa is null or lower(d.ten) like lower(concat('%', :tuKhoa, '%'))
                   or lower(d.maDvhd) like lower(concat('%', :tuKhoa, '%'))
                   or lower(d.linhVuc) like lower(concat('%', :tuKhoa, '%')))
            order by d.ten
            """)
    List<DonViHuongDan> timKiem(@Param("trangThai") TrangThaiPheDuyet trangThai, @Param("tuKhoa") String tuKhoa);
}
