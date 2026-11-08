package org.example.cdthqltt.repository;

import org.example.cdthqltt.entity.PhieuDanhGia;
import org.example.cdthqltt.entity.enums.TrangThaiPhieu;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PhieuDanhGiaRepository extends JpaRepository<PhieuDanhGia, Long> {

    Optional<PhieuDanhGia> findByHoSoIdAndChangIdAndNguoiChamId(Long hoSoId, Long changId, Long nguoiChamId);

    @EntityGraph(attributePaths = {"diemClos", "diemClos.chuanDauRa", "chang", "nguoiCham"})
    List<PhieuDanhGia> findByHoSoIdOrderById(Long hoSoId);

    @EntityGraph(attributePaths = {"diemClos", "diemClos.chuanDauRa", "nguoiCham"})
    List<PhieuDanhGia> findByHoSoIdAndChangIdOrderById(Long hoSoId, Long changId);

    /** CBR-12 / BR-03.6: đợt đã có phiếu nộp thì khóa cấu hình trọng số. */
    @Query("select count(p) > 0 from PhieuDanhGia p where p.chang.dot.id = :dotId and p.trangThai = :trangThai")
    boolean coPhieuTheoTrangThai(@Param("dotId") Long dotId, @Param("trangThai") TrangThaiPhieu trangThai);

    @Query("select count(p) > 0 from PhieuDanhGia p where p.hoSo.id = :hoSoId and p.nguoiCham.id = :nguoiChamId and p.trangThai = :trangThai")
    boolean coPhieuCuaNguoiCham(@Param("hoSoId") Long hoSoId, @Param("nguoiChamId") Long nguoiChamId,
                                @Param("trangThai") TrangThaiPhieu trangThai);

    @Query("""
            select p from PhieuDanhGia p
            where (:nguoiChamId is null or p.nguoiCham.id = :nguoiChamId)
              and (:dotId is null or p.chang.dot.id = :dotId)
              and (:thuTuChang is null or p.chang.thuTu = :thuTuChang)
              and (:trangThai is null or p.trangThai = :trangThai)
            order by p.id desc
            """)
    List<PhieuDanhGia> timKiem(@Param("nguoiChamId") Long nguoiChamId, @Param("dotId") Long dotId,
                               @Param("thuTuChang") Integer thuTuChang, @Param("trangThai") TrangThaiPhieu trangThai);

    @EntityGraph(attributePaths = {"diemClos", "diemClos.chuanDauRa", "nguoiCham", "hoSo", "chang"})
    @Query("select p from PhieuDanhGia p where p.chang.dot.id = :dotId and p.trangThai = :trangThai order by p.hoSo.id, p.chang.thuTu")
    List<PhieuDanhGia> theoDotVaTrangThai(@Param("dotId") Long dotId, @Param("trangThai") TrangThaiPhieu trangThai);
}
