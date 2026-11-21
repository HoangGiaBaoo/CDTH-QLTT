import type { NhomNguoiCham } from '../../types/assessment';
import type { TrangThaiHoSo } from '../../types/record';

/** Hồ sơ được xếp vào Tổ đánh giá — khớp ToDanhGiaService.HO_SO_DUOC_XEP_TO. */
export const HO_SO_XEP_TO: TrangThaiHoSo[] = ['DANG_THUC_TAP', 'CHO_DANH_GIA', 'GIAN_DOAN'];

/** Một dòng trong bảng kiểm thành phần Tổ đánh giá. */
export interface DieuKien {
  noiDung: string;
  dat: boolean;
}

export interface ThanhVienNhap {
  nguoiDungId: number;
  nhom: NhomNguoiCham;
  laChuTich: boolean;
  vangMat?: boolean;
  hoTen?: string;
}

export interface HoSoNhap {
  hoTen: string;
  gvhdNguoiDungId?: number;
  canBoNguoiDungId?: number;
}

/**
 * Bảng kiểm CBR-14 / Điều 10 khoản 3 điểm a — cùng điều kiện với ToDanhGiaService.kiemThanhPhan, chỉ để giáo vụ
 * thấy ngay khi chọn người; backend kiểm lại và mới là nơi quyết định. Thành viên vắng mặt không được tính.
 * Xét theo từng SV như mẫu TTTN-05 (3 bản mỗi SV): người chấm của một SV là mọi giảng viên trong tổ cộng cán bộ đã
 * hướng dẫn chính SV đó ⇒ tổ 2 giảng viên đủ cho cả nhóm SV, mỗi SV thêm cán bộ của mình.
 */
export function kiemThanhPhan(thanhViens: ThanhVienNhap[], hoSos: HoSoNhap[]): DieuKien[] {
  const coMat = thanhViens.filter((t) => !t.vangMat);
  const gv = new Set(coMat.filter((t) => t.nhom === 'GVHD').map((t) => t.nguoiDungId));
  const canBo = coMat.filter((t) => t.nhom === 'DVHD');
  const dvhd = new Set(canBo.map((t) => t.nguoiDungId));
  const cuaSv = new Set(hoSos.map((h) => h.canBoNguoiDungId));
  const soNguoiCham = gv.size + 1;
  const ds: DieuKien[] = [
    { noiDung: `Nhóm giảng viên gồm GVHD và ít nhất một giảng viên khác (hiện ${gv.size})`, dat: gv.size >= 2 },
    {
      noiDung: `Mỗi sinh viên được ${gv.size} giảng viên của tổ và cán bộ của mình đánh giá: ${soNguoiCham} người, phải từ 3 và là số lẻ`,
      dat: gv.size >= 2 && soNguoiCham % 2 === 1,
    },
    { noiDung: `Có ít nhất một thành viên thuộc ĐVHD (hiện ${dvhd.size})`, dat: dvhd.size >= 1 },
    { noiDung: 'Có đúng một chủ tịch tổ', dat: thanhViens.filter((t) => t.laChuTich).length === 1 },
  ];
  for (const h of hoSos) {
    ds.push({ noiDung: `Có GVHD của ${h.hoTen}`, dat: !!h.gvhdNguoiDungId && gv.has(h.gvhdNguoiDungId) });
    ds.push({ noiDung: `Có cán bộ ĐVHD đã hướng dẫn ${h.hoTen}`, dat: !!h.canBoNguoiDungId && dvhd.has(h.canBoNguoiDungId) });
  }
  for (const cb of canBo) {
    if (!cuaSv.has(cb.nguoiDungId)) {
      ds.push({ noiDung: `Cán bộ ${cb.hoTen ?? ''} không hướng dẫn sinh viên nào trong tổ — cán bộ chỉ đánh giá sinh viên của mình`, dat: false });
    }
  }
  return ds;
}
