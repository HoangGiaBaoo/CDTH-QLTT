package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.MucRubric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MucRubricRepository extends JpaRepository<MucRubric, Long> {

    List<MucRubric> findByChuanDauRaIdOrderByMuc(Long chuanDauRaId);

    @Query("select m from MucRubric m join fetch m.chuanDauRa c where c.dot.id = :dotId order by c.maClo, m.muc")
    List<MucRubric> theoDot(@Param("dotId") Long dotId);
}
