package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.MinhChung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MinhChungRepository extends JpaRepository<MinhChung, Long> {

    List<MinhChung> findByHoSoIdOrderByNgayTaiLenDesc(Long hoSoId);

    @Query("select distinct m.loaiMinhChung from MinhChung m where m.hoSo.id = :hoSoId")
    List<String> cacLoaiDaNop(@Param("hoSoId") Long hoSoId);

    @Modifying
    @Query("update MinhChung m set m.daKhoa = true where m.hoSo.id = :hoSoId")
    int khoaTheoHoSo(@Param("hoSoId") Long hoSoId);
}
