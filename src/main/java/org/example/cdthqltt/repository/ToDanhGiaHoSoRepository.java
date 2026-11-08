package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.ToDanhGiaHoSo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ToDanhGiaHoSoRepository extends JpaRepository<ToDanhGiaHoSo, ToDanhGiaHoSo.Id> {

    Optional<ToDanhGiaHoSo> findFirstByHoSoId(Long hoSoId);

    List<ToDanhGiaHoSo> findByToDanhGiaId(Long toDanhGiaId);
}
