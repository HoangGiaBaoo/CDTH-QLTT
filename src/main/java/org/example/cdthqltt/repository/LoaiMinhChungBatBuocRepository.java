package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.LoaiMinhChungBatBuoc;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoaiMinhChungBatBuocRepository extends JpaRepository<LoaiMinhChungBatBuoc, Long> {

    List<LoaiMinhChungBatBuoc> findByHinhThucThucTapOrderById(HinhThucThucTap hinhThucThucTap);

    List<LoaiMinhChungBatBuoc> findByHinhThucThucTapAndBatBuocTrue(HinhThucThucTap hinhThucThucTap);
}
