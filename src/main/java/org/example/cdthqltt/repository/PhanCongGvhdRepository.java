package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.PhanCongGvhd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PhanCongGvhdRepository extends JpaRepository<PhanCongGvhd, Long> {

    Optional<PhanCongGvhd> findByHoSoId(Long hoSoId);

    boolean existsByHoSoId(Long hoSoId);

    boolean existsByHoSoIdAndGiangVienId(Long hoSoId, Long giangVienId);

    /** Đếm động số SV GV đang hướng dẫn trong đợt (CBR-04). */
    @Query("select count(p) from PhanCongGvhd p where p.giangVien.id = :giangVienId and p.hoSo.dot.id = :dotId")
    long demTheoGiangVien(@Param("giangVienId") Long giangVienId, @Param("dotId") Long dotId);

    @Query("select p from PhanCongGvhd p join fetch p.hoSo h join fetch p.giangVien where h.dot.id = :dotId order by p.id")
    List<PhanCongGvhd> theoDot(@Param("dotId") Long dotId);
}
