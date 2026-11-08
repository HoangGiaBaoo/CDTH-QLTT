package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.ToDanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ToDanhGiaRepository extends JpaRepository<ToDanhGia, Long> {

    @Query("select t from ToDanhGia t where (:dotId is null or t.dot.id = :dotId) order by t.id")
    List<ToDanhGia> theoDot(@Param("dotId") Long dotId);

    @Query("""
            select distinct t from ToDanhGia t join t.thanhViens tv
            where tv.nguoiDung.id = :nguoiDungId and (:dotId is null or t.dot.id = :dotId)
            order by t.id
            """)
    List<ToDanhGia> theoThanhVien(@Param("nguoiDungId") Long nguoiDungId, @Param("dotId") Long dotId);
}
