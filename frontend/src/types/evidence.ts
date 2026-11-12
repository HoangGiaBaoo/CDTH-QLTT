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
