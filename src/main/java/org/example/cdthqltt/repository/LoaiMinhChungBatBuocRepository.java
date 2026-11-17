package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.LoaiMinhChungBatBuoc;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoaiMinhChungBatBuocRepository extends JpaRepository<LoaiMinhChungBatBuoc, Long> {

    List<LoaiMinhChungBatBuoc> findByHinhThucThucTapOrderById(HinhThucThucTap hinhThucThucTap);

    /** Theo thứ tự seed — đúng thứ tự liệt kê ở Điều 4 (không sắp thì MySQL đọc qua chỉ mục unique, ra theo mã chữ cái). */
    List<LoaiMinhChungBatBuoc> findByHinhThucThucTapAndBatBuocTrueOrderById(HinhThucThucTap hinhThucThucTap);
}
