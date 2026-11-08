package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.NhatKyThucTap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NhatKyThucTapRepository extends JpaRepository<NhatKyThucTap, Long> {

    List<NhatKyThucTap> findByHoSoIdOrderByNgayDesc(Long hoSoId);

    boolean existsByHoSoIdAndNgay(Long hoSoId, LocalDate ngay);

    Optional<NhatKyThucTap> findTopByHoSoIdOrderByNgayDesc(Long hoSoId);
}
