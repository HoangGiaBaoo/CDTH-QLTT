package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.PhanHoi;
import org.example.cdthqltt.entity.enums.LoaiPhanHoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PhanHoiRepository extends JpaRepository<PhanHoi, Long> {

    Optional<PhanHoi> findByHoSoIdAndLoai(Long hoSoId, LoaiPhanHoi loai);

    boolean existsByHoSoIdAndLoai(Long hoSoId, LoaiPhanHoi loai);

    @Query("select p from PhanHoi p where p.loai = :loai and (:dotId is null or p.hoSo.dot.id = :dotId)")
    List<PhanHoi> theoLoaiVaDot(@Param("loai") LoaiPhanHoi loai, @Param("dotId") Long dotId);
}
