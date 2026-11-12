import type { ChuongTrinhDaoTao } from './auth';
import type { TrangThaiHoSo } from './record';

/** Kiểu khớp dto/result/*.java (UC10, #82–#88). Điểm là số đã do backend tính — giao diện chỉ hiển thị. */

export type TrangThaiKetQua = 'CHUA_TINH' | 'DA_TINH' | 'DA_XAC_NHAN' | 'DA_CONG_BO';
export type KetLuan = 'DAT' | 'KHONG_DAT';

/** #82 — một dòng bảng kết quả toàn đợt (RP-01). Chưa tính thì các trường điểm là null, `diemClo` rỗng. */
export interface KetQuaTomTat {
  hoSoId: number;
  maSv: string;
  hoTen: string;
  lop?: string;
  chuongTrinh: ChuongTrinhDaoTao;
  trangThaiHoSo: TrangThaiHoSo;
  giangVienHuongDan?: string;
  diemClo: Record<string, number | null>;
  diemThuong?: number | null;
  diemHp?: number | null;
  mucDat?: number | null;
  ketLuan?: KetLuan | null;
  trangThai: TrangThaiKetQua;
  ngayTinh?: string | null;
}

/** Mục I "Thông tin chung" của TTTN-07. */
export interface ThongTinChung {
  hoSoId: number;
  hoTen: string;
  maSv: string;
  lop?: string;
  nganh?: string;
  khoaVien?: string;
  chuongTrinh: ChuongTrinhDaoTao;
  giangVienHuongDan?: string;
  donViHuongDan?: string;
  canBoHuongDan?: string;
  tuNgay?: string;
  denNgay?: string;
  trangThaiHoSo: TrangThaiHoSo;
}

/** Cột (1)(2)(3) hoặc (4)(5)(6): trung bình nhóm người chấm, null khi nhóm có tỷ lệ 0 (ĐVHD ở CLO7). */
export interface DiemChangHienThi {
  dvhd: number | null;
  gvhd: number | null;
  tb: number | null;
}

/** Một dòng mục II. `theoChang`: thứ tự chặng → điểm; chặng không đánh giá CLO này thì không có khóa. */
export interface DongClo {
  maClo: string;
  ten: string;
  alpha: number;
  theoChang: Record<string, DiemChangHienThi>;
  diemClo: number | null;
  muc: number | null;
  diemQuyDoi: number | null;
}

export interface MucXepLoai {
  muc: number;
  tu: number;
  den: number;
}

export interface NhomNangLuc {
  ten: string;
  cacClo: string[];
  diem: number | null;
  muc: number | null;
}

/** #83 (cán bộ), #84–#86 — bảng tổng hợp TTTN-07. */
export interface BangTongHop {
  thongTin: ThongTinChung;
  trangThai: TrangThaiKetQua;
  cacClo: DongClo[];
  diemThuong: number;
  diemHp: number | null;
  mucHp: number | null;
  thangMuc: MucXepLoai[];
  nhomNangLuc: NhomNangLuc[];
  ketLuan: KetLuan | null;
  /** Mỗi lý do mở đầu bằng "(a)"…"(d)" — đúng điểm a–d của Điều 15 khoản 3. */
  lyDoKhongDat: string[];
  nhanXetGvhd: string | null;
  phienBanTrongSo: string | null;
  ngayTinh: string | null;
  canhBao: string[];
  /** Lý do chưa có kết quả (thiếu phiếu, chưa tới giai đoạn đánh giá…); null khi đã tính. */
  chuaTinhDuoc: string | null;
}

/** #85 — null = không đề xuất thưởng. */
export interface NhanXetKetQuaRequest {
  nhanXet: string;
  diemThuong?: number | null;
}

/** #86 — null = giữ mức GVHD đề xuất. */
export interface XacNhanKetQuaRequest {
  diemThuongDuyet?: number | null;
}

/** #87 — theo danh sách hồ sơ, hoặc cả đợt (`hoSoIds` rỗng). */
export interface CongBoRequest {
  termId?: number;
  hoSoIds?: number[];
}

export interface CongBoResponse {
  soDaCongBo: number;
  soHoanThanh: number;
  soKhongHoanThanh: number;
  hoSoIds: number[];
  /** Công bố cả đợt: số hồ sơ còn chưa có kết quả đã xác nhận. */
  soChuaXacNhan: number | null;
}
