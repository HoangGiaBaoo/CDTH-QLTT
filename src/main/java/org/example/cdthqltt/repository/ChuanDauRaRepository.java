package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.ChuanDauRa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChuanDauRaRepository extends JpaRepository<ChuanDauRa, Long> {

    List<ChuanDauRa> findByDotIdOrderByMaClo(Long dotId);

    Optional<ChuanDauRa> findByDotIdAndMaClo(Long dotId, String maClo);
}
