package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.ThongBao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {

    Page<ThongBao> findByNguoiNhanIdOrderByNgayTaoDescIdDesc(Long nguoiNhanId, Pageable pageable);

    Page<ThongBao> findByNguoiNhanIdAndDaDocFalseOrderByNgayTaoDescIdDesc(Long nguoiNhanId, Pageable pageable);

    long countByNguoiNhanIdAndDaDocFalse(Long nguoiNhanId);
}
