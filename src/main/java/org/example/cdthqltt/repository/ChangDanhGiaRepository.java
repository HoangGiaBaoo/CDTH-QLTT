package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.ChangDanhGia;
import org.example.cdthqltt.entity.enums.TrangThaiChang;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ChangDanhGiaRepository extends JpaRepository<ChangDanhGia, Long> {

    List<ChangDanhGia> findByDotIdOrderByThuTu(Long dotId);

    Optional<ChangDanhGia> findByDotIdAndThuTu(Long dotId, Integer thuTu);

    /** Chặng đến hạn mở mà chưa mở — dùng cho lịch chạy hằng ngày. */
    List<ChangDanhGia> findByTrangThaiAndNgayMoLessThanEqual(TrangThaiChang trangThai, LocalDate ngay);
}
