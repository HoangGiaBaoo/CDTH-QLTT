package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.NguoiDung;
import org.example.cdthqltt.entity.enums.TrangThaiTaiKhoan;
import org.example.cdthqltt.entity.enums.VaiTro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {

    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);

    boolean existsByTenDangNhap(String tenDangNhap);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<NguoiDung> findByVaiTroAndTrangThai(VaiTro vaiTro, TrangThaiTaiKhoan trangThai);

    @Query("""
            select n from NguoiDung n
            where (:vaiTro is null or n.vaiTro = :vaiTro)
              and (:trangThai is null or n.trangThai = :trangThai)
              and (:tuKhoa is null or lower(n.hoTen) like lower(concat('%', :tuKhoa, '%'))
                   or lower(n.tenDangNhap) like lower(concat('%', :tuKhoa, '%'))
                   or lower(n.email) like lower(concat('%', :tuKhoa, '%')))
            order by n.id
            """)
    Page<NguoiDung> timKiem(@Param("vaiTro") VaiTro vaiTro,
                            @Param("trangThai") TrangThaiTaiKhoan trangThai,
                            @Param("tuKhoa") String tuKhoa,
                            Pageable pageable);
}
