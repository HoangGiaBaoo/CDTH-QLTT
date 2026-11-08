package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.KetQuaHocPhan;
import org.example.cdthqltt.entity.enums.TrangThaiKetQua;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface KetQuaHocPhanRepository extends JpaRepository<KetQuaHocPhan, Long> {

    Optional<KetQuaHocPhan> findByHoSoId(Long hoSoId);

    @Query("select k from KetQuaHocPhan k join fetch k.hoSo h where h.dot.id = :dotId order by h.id")
    List<KetQuaHocPhan> theoDot(@Param("dotId") Long dotId);

    @Query("select k from KetQuaHocPhan k join fetch k.hoSo h where h.dot.id = :dotId and k.trangThai = :trangThai order by h.id")
    List<KetQuaHocPhan> theoDotVaTrangThai(@Param("dotId") Long dotId, @Param("trangThai") TrangThaiKetQua trangThai);
}
