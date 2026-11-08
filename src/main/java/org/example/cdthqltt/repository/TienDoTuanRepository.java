package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.TienDoTuan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TienDoTuanRepository extends JpaRepository<TienDoTuan, Long> {

    List<TienDoTuan> findByHoSoIdOrderByTuan(Long hoSoId);

    Optional<TienDoTuan> findByHoSoIdAndTuan(Long hoSoId, Integer tuan);
}
