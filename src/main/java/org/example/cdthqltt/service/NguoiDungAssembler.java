package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.dto.user.NguoiDungMapper;
import org.example.cdthqltt.dto.user.NguoiDungResponse;
import org.example.cdthqltt.entity.NguoiDung;
import org.example.cdthqltt.entity.enums.VaiTro;
import org.example.cdthqltt.repository.CanBoDvhdRepository;
import org.example.cdthqltt.repository.GiangVienRepository;
import org.example.cdthqltt.repository.SinhVienRepository;
import org.springframework.stereotype.Component;

/** Nạp hồ sơ mở rộng theo vai trò rồi dựng {@link NguoiDungResponse}; dùng chung cho /auth/me và /users. */
@Component
@RequiredArgsConstructor
public class NguoiDungAssembler {

    private final SinhVienRepository sinhVienRepo;
    private final GiangVienRepository giangVienRepo;
    private final CanBoDvhdRepository canBoRepo;

    public NguoiDungResponse dung(NguoiDung n) {
        VaiTro vt = n.getVaiTro();
        return NguoiDungMapper.toResponse(n,
                vt == VaiTro.SINH_VIEN ? sinhVienRepo.findByNguoiDungId(n.getId()).orElse(null) : null,
                vt == VaiTro.GIANG_VIEN ? giangVienRepo.findByNguoiDungId(n.getId()).orElse(null) : null,
                vt == VaiTro.CAN_BO_DVHD ? canBoRepo.findByNguoiDungId(n.getId()).orElse(null) : null);
    }
}
