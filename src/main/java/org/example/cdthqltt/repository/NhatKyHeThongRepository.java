package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.NhatKyHeThong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface NhatKyHeThongRepository extends JpaRepository<NhatKyHeThong, Long> {

    @Query("""
            select n from NhatKyHeThong n
            where (:doiTuong is null or n.doiTuong = :doiTuong)
              and (:doiTuongId is null or n.doiTuongId = :doiTuongId)
              and (:nguoiThucHien is null or n.nguoiThucHien = :nguoiThucHien)
              and (:tu is null or n.thoiDiem >= :tu)
              and (:den is null or n.thoiDiem <= :den)
            order by n.thoiDiem desc, n.id desc
            """)
    Page<NhatKyHeThong> timKiem(@Param("doiTuong") String doiTuong, @Param("doiTuongId") Long doiTuongId,
                                @Param("nguoiThucHien") Long nguoiThucHien,
                                @Param("tu") LocalDateTime tu, @Param("den") LocalDateTime den, Pageable pageable);

    /** Lần ghi vết gần nhất của một hành vi trên một đối tượng — dùng suy ra phien_ban_trong_so (docs/01 mục 10.9). */
    Optional<NhatKyHeThong> findTopByHanhViAndDoiTuongAndDoiTuongIdOrderByIdDesc(String hanhVi, String doiTuong, Long doiTuongId);
}
