import type { HoSo, TrangThaiHoSo } from '../../types/record';

/** Các bước của hồ sơ theo UC04 → UC11 → UC10; bước cuối mang nhãn Hoàn thành / Không hoàn thành thực tế. */
export const VONG_DOI_HO_SO: { ma: TrangThaiHoSo[]; nhan: string }[] = [
  { ma: ['NHAP'], nhan: 'Bản nháp' },
  { ma: ['CHO_DVHD'], nhan: 'Chờ ĐVHD xác nhận' },
  { ma: ['CHO_GVHD'], nhan: 'Chờ GVHD duyệt' },
  { ma: ['DANG_THUC_TAP'], nhan: 'Đang thực tập' },
  { ma: ['CHO_DANH_GIA'], nhan: 'Chờ đánh giá' },
  { ma: ['HOAN_THANH', 'KHONG_HOAN_THANH'], nhan: 'Có kết quả' },
];

/** Vị trí trên thanh bước; hồ sơ đã có kết quả coi như xong hết; Gián đoạn ⇒ -1 (hiện cảnh báo riêng). */
export function viTriVongDoi(t: TrangThaiHoSo): number {
  if (t === 'HOAN_THANH' || t === 'KHONG_HOAN_THANH') return VONG_DOI_HO_SO.length;
  return VONG_DOI_HO_SO.findIndex((b) => b.ma.includes(t));
}

/** Hồ sơ đã qua bước GVHD duyệt — các mục kế hoạch, nhật ký, tiến độ, minh chứng đã có khung. */
export function daDuocDuyet(t: TrangThaiHoSo): boolean {
  return ['DANG_THUC_TAP', 'CHO_DANH_GIA', 'HOAN_THANH', 'KHONG_HOAN_THANH', 'GIAN_DOAN'].includes(t);
}

/** Câu "việc tiếp theo" cho sinh viên theo trạng thái — chỉ mô tả, mọi kiểm tra do backend làm. */
export function viecTiepTheo(h: HoSo): string | null {
  const cb = h.canBoDvhd ? `cán bộ ${h.canBoDvhd.hoTen}${h.donVi ? ` (${h.donVi.ten})` : ''}` : 'cán bộ hướng dẫn';
  switch (h.trangThai) {
    case 'CHO_DVHD':
      return `Đã gửi đăng ký. Chờ ${cb} xác nhận tiếp nhận; kết quả được báo qua thông báo.`;
    case 'CHO_GVHD':
      return h.gvhd
        ? `ĐVHD đã xác nhận tiếp nhận. Chờ GVHD ${h.gvhd.hoTen} phê duyệt hồ sơ.`
        : 'ĐVHD đã xác nhận tiếp nhận. Chờ giáo vụ phân công giảng viên hướng dẫn.';
    case 'DANG_THUC_TAP':
      return 'Hồ sơ đã được GVHD phê duyệt. Hãy lập kế hoạch học tập TTTN-02 trong 5 ngày làm việc, ghi nhật ký và cập nhật tiến độ hằng tuần.';
    case 'CHO_DANH_GIA':
      return 'Báo cáo thực tập đã được xác nhận. Hồ sơ đang chờ đánh giá cuối kỳ; hãy gửi phiếu phản hồi TTTN-08b.';
    case 'HOAN_THANH':
    case 'KHONG_HOAN_THANH':
      return 'Kết quả học phần đã được công bố.';
    case 'GIAN_DOAN':
      return 'Hồ sơ đang tạm dừng do gián đoạn bất khả kháng (Điều 15 khoản 4). Liên hệ giáo vụ để được khôi phục.';
    default:
      return null;
  }
}
