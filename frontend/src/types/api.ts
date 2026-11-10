/** Vỏ chuẩn mọi phản hồi backend (common/ApiResponse.java), kể cả 401/403 sinh ra ở filter. */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message?: string;
  data?: T;
  errors?: LoiTruong[];
}

/** Lỗi một trường khi kiểm dữ liệu nhập (common/LoiTruong.java). */
export interface LoiTruong {
  truong: string;
  thongDiep: string;
}

/** Trang dữ liệu (common/PageResponse.java), mặc định 15 dòng/trang. */
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

/** 15 mã lỗi chuẩn (common/ErrorCode.java, docs/01-nghiep-vu.md mục 3). */
export type MaLoi =
  | 'VALIDATION_ERROR'
  | 'BUSINESS_RULE_VIOLATION'
  | 'UNAUTHORIZED'
  | 'ACCESS_DENIED'
  | 'RESOURCE_NOT_FOUND'
  | 'DUPLICATE_RESOURCE'
  | 'RESOURCE_IN_USE'
  | 'RESOURCE_LOCKED'
  | 'QUOTA_EXCEEDED'
  | 'THIEU_PHIEU_DVHD'
  | 'THIEU_PHIEU_GVHD'
  | 'CLO_CHUA_DUOC_DANH_GIA'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'INTERNAL_ERROR';
