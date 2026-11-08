package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.SinhVien;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SinhVienRepository extends JpaRepository<SinhVien, Long> {

    Optional<SinhVien> findByNguoiDungId(Long nguoiDungId);

    Optional<SinhVien> findByMaSv(String maSv);

    boolean existsByMaSv(String maSv);

    @EntityGraph(attributePaths = "nguoiDung")
    @Query("""
            select s from SinhVien s
            where (:tuKhoa is null or lower(s.maSv) like lower(concat('%', :tuKhoa, '%'))
                   or lower(s.nguoiDung.hoTen) like lower(concat('%', :tuKhoa, '%')))
              and (:lop is null or s.lop = :lop)
            order by s.maSv
            """)
    List<SinhVien> timKiem(@Param("tuKhoa") String tuKhoa, @Param("lop") String lop);
}
