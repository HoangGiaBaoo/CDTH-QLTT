package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.BaoCaoThucTap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BaoCaoThucTapRepository extends JpaRepository<BaoCaoThucTap, Long> {

    List<BaoCaoThucTap> findByHoSoIdOrderByPhienBanDesc(Long hoSoId);

    Optional<BaoCaoThucTap> findTopByHoSoIdOrderByPhienBanDesc(Long hoSoId);
}
