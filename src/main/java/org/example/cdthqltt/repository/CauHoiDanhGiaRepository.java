package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.CauHoiDanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CauHoiDanhGiaRepository extends JpaRepository<CauHoiDanhGia, Long> {

    @Query("select c from CauHoiDanhGia c join fetch c.chuanDauRa where c.chang.id = :changId order by c.thuTu")
    List<CauHoiDanhGia> theoChang(@Param("changId") Long changId);

    @Query("select c from CauHoiDanhGia c join fetch c.chuanDauRa join fetch c.chang ch where ch.dot.id = :dotId order by ch.thuTu, c.thuTu")
    List<CauHoiDanhGia> theoDot(@Param("dotId") Long dotId);

    void deleteByChangId(Long changId);
}
