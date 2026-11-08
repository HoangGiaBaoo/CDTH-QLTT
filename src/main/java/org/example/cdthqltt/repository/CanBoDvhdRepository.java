package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.CanBoDvhd;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CanBoDvhdRepository extends JpaRepository<CanBoDvhd, Long> {

    Optional<CanBoDvhd> findByNguoiDungId(Long nguoiDungId);

    @EntityGraph(attributePaths = "nguoiDung")
    List<CanBoDvhd> findByDonViIdOrderById(Long donViId);
}
