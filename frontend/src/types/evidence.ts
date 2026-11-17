/** dto/evidence/*.java (UC07, #64–#68). */

/** #65 — đối chiếu minh chứng với danh mục bắt buộc của hình thức thực tập (BR-07.6). */
export interface DoiChieuMinhChung {
  hoSoId: number;
  hinhThucThucTap: string;
  du: boolean;
  danhMuc: {
    loaiMinhChung: string;
    tenHienThi: string;
    /** HE_THONG: hệ thống tự đối chiếu từ dữ liệu nghiệp vụ; TAI_LEN: sinh viên tải tệp. */
    nguon: 'HE_THONG' | 'TAI_LEN';
    daCo: boolean;
    soTep: number;
  }[];
  loaiConThieu: string[];
}

export type DongDoiChieu = DoiChieuMinhChung['danhMuc'][number];

/** #64, #66 — `MinhChungResponse`; không có đường dẫn lưu trữ, tải tệp qua #67. */
export interface MinhChung {
  id: number;
  hoSoId: number;
  loaiMinhChung: string;
  tenLoai: string;
  /** Tuần liên quan (1…số tuần của đợt); trống = không gắn tuần. */
  tuan?: number | null;
  tenFile: string;
  /** Byte. */
  kichThuoc: number;
  nguoiTaiLenId: number;
  ngayTaiLen: string;
  /** Giáo vụ đã xác nhận kết quả (#86) ⇒ minh chứng của hồ sơ bị khóa, không xóa được (UC07 8a). */
  daKhoa: boolean;
}

/** Tham số multipart của #66. */
export interface TaiLenMinhChungRequest {
  recordId: number;
  type: string;
  week?: number;
  file: File;
}
