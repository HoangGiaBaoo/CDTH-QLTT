package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.KeHoachHocTap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KeHoachHocTapRepository extends JpaRepository<KeHoachHocTap, Long> {

    Optional<KeHoachHocTap> findByHoSoId(Long hoSoId);

    boolean existsByHoSoId(Long hoSoId);
}
