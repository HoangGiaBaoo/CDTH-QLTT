import type { VaiTro } from '../types/auth';

/** Nhãn tiếng Việt của enum backend (entity/enums). Tên khóa giữ nguyên giá trị enum. */

export const NHAN_VAI_TRO: Record<VaiTro, string> = {
  ADMIN: 'Giáo vụ Khoa',
  GIANG_VIEN: 'Giảng viên',
  CAN_BO_DVHD: 'Cán bộ ĐVHD',
  SINH_VIEN: 'Sinh viên',
};

export const NHAN_TRANG_THAI_HO_SO: Record<string, string> = {
  NHAP: 'Bản nháp',
  CHO_DVHD: 'Chờ ĐVHD xác nhận',
  CHO_GVHD: 'Chờ GVHD duyệt',
  DANG_THUC_TAP: 'Đang thực tập',
  CHO_DANH_GIA: 'Chờ đánh giá',
  HOAN_THANH: 'Hoàn thành',
  KHONG_HOAN_THANH: 'Không hoàn thành',
  GIAN_DOAN: 'Gián đoạn',
  TU_CHOI: 'Từ chối',
};

export const NHAN_HINH_THUC_THUC_TAP: Record<string, string> = {
  DOANH_NGHIEP: 'Thực tập tại doanh nghiệp',
  NGHIEN_CUU: 'Thực tập nghiên cứu',
  KHOI_NGHIEP: 'Thực tập khởi nghiệp',
  CONG_DONG: 'Thực tập cộng đồng',
  NOI_BO: 'Thực tập nội bộ',
  QUOC_TE: 'Thực tập quốc tế',
};

export const NHAN_HINH_THUC_LAM_VIEC: Record<string, string> = {
  TRUC_TIEP: 'Trực tiếp',
  TRUC_TUYEN: 'Trực tuyến',
};

export const NHAN_CHUONG_TRINH: Record<string, string> = {
  CHUAN: 'Chuẩn',
  CLC_STEM: 'CLC/STEM',
};

export const NHAN_TRANG_THAI_DOT: Record<string, string> = {
  KHOI_TAO: 'Khởi tạo',
  DANG_NHAN_DANG_KY: 'Đang nhận đăng ký',
  DANG_THUC_HIEN: 'Đang thực hiện',
  DA_KET_THUC: 'Đã kết thúc',
};

export const NHAN_TRANG_THAI_CHANG: Record<string, string> = {
  CHUA_MO: 'Chưa mở',
  DANG_MO: 'Đang mở',
  DA_DONG: 'Đã đóng',
  DA_TONG_HOP: 'Đã tổng hợp',
};

export const NHAN_TRANG_THAI_PHIEU: Record<string, string> = {
  NHAP: 'Nháp',
  DA_NOP: 'Đã nộp',
  MO_LAI: 'Mở lại',
};

export const NHAN_TRANG_THAI_KET_QUA: Record<string, string> = {
  CHUA_TINH: 'Chưa tính',
  DA_TINH: 'Đã tính',
  DA_XAC_NHAN: 'Đã xác nhận',
  DA_CONG_BO: 'Đã công bố',
};

export const NHAN_KET_LUAN: Record<string, string> = {
  DAT: 'Đạt',
  KHONG_DAT: 'Không đạt',
};

export const NHAN_TRANG_THAI_KE_HOACH: Record<string, string> = {
  NHAP: 'Bản nháp',
  CHO_XAC_NHAN: 'Chờ xác nhận',
  DA_KHOA: 'Đã khóa',
};

export const NHAN_TRANG_THAI_PHE_DUYET: Record<string, string> = {
  CHO_DUYET: 'Chờ duyệt',
  DA_DUYET: 'Đã duyệt',
  TU_CHOI: 'Từ chối',
  DA_LOAI: 'Đã loại',
};

export const NHAN_TRANG_THAI_TAI_KHOAN: Record<string, string> = {
  HOAT_DONG: 'Hoạt động',
  VO_HIEU_HOA: 'Vô hiệu hóa',
};

export const NHAN_NHOM_NGUOI_CHAM: Record<string, string> = {
  GVHD: 'Nhóm giảng viên',
  DVHD: 'Nhóm ĐVHD',
};

/** Nhóm màu cố định của StatusBadge: nháp xám · chờ vàng · đang chạy xanh dương · xong xanh lá · từ chối/không đạt đỏ. */
export type MauTrangThai = 'xam' | 'vang' | 'xanh-duong' | 'xanh-la' | 'do';

export const MAU_TRANG_THAI: Record<string, MauTrangThai> = {
  NHAP: 'xam', KHOI_TAO: 'xam', CHUA_MO: 'xam', CHUA_TINH: 'xam', VO_HIEU_HOA: 'xam',
  CHO_DVHD: 'vang', CHO_GVHD: 'vang', CHO_DANH_GIA: 'vang', CHO_XAC_NHAN: 'vang', CHO_DUYET: 'vang',
  MO_LAI: 'vang', GIAN_DOAN: 'vang', DA_TINH: 'vang',
  DANG_THUC_TAP: 'xanh-duong', DANG_NHAN_DANG_KY: 'xanh-duong', DANG_THUC_HIEN: 'xanh-duong', DANG_MO: 'xanh-duong',
  DA_XAC_NHAN: 'xanh-duong',
  HOAN_THANH: 'xanh-la', DA_NOP: 'xanh-la', DA_KHOA: 'xanh-la', DA_DUYET: 'xanh-la', DA_CONG_BO: 'xanh-la',
  DA_DONG: 'xanh-la', DA_TONG_HOP: 'xanh-la', DA_KET_THUC: 'xanh-la', HOAT_DONG: 'xanh-la', DAT: 'xanh-la',
  KHONG_HOAN_THANH: 'do', TU_CHOI: 'do', DA_LOAI: 'do', KHONG_DAT: 'do',
};

/** Mã lỗi nghiệp vụ hiển thị cảnh báo vàng, không phải "lỗi hệ thống". */
export const MA_LOI_CANH_BAO = new Set([
  'BUSINESS_RULE_VIOLATION', 'QUOTA_EXCEEDED', 'RESOURCE_LOCKED', 'RESOURCE_IN_USE', 'DUPLICATE_RESOURCE',
  'THIEU_PHIEU_DVHD', 'THIEU_PHIEU_GVHD', 'CLO_CHUA_DUOC_DANH_GIA',
]);
