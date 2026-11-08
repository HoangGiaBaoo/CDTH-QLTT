package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.DotThucTap;
import org.example.cdthqltt.entity.enums.TrangThaiDot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DotThucTapRepository extends JpaRepository<DotThucTap, Long> {

    Optional<DotThucTap> findByMaDot(String maDot);

    boolean existsByMaDot(String maDot);

    List<DotThucTap> findByTrangThaiInOrderByNgayBatDauDesc(Collection<TrangThaiDot> trangThai);

    List<DotThucTap> findAllByOrderByNgayBatDauDesc();
}
