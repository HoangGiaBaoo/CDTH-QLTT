package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.GiangVien;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GiangVienRepository extends JpaRepository<GiangVien, Long> {

    Optional<GiangVien> findByNguoiDungId(Long nguoiDungId);

    boolean existsByMaGv(String maGv);

    @EntityGraph(attributePaths = "nguoiDung")
    @Query("""
            select g from GiangVien g
            where (:tuKhoa is null or lower(g.maGv) like lower(concat('%', :tuKhoa, '%'))
                   or lower(g.nguoiDung.hoTen) like lower(concat('%', :tuKhoa, '%')))
              and (:boMon is null or g.boMon = :boMon)
            order by g.maGv
            """)
    List<GiangVien> timKiem(@Param("tuKhoa") String tuKhoa, @Param("boMon") String boMon);
}
