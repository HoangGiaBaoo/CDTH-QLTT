import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import { hostOrgApi } from '../../api/hostOrgs';
import ErrorAlert from '../../components/ErrorAlert';
import type { ChuongTrinhDaoTao, VaiTro } from '../../types/auth';
import type { DonVi } from '../../types/hostOrg';
import type { TaoNguoiDungRequest, TaoNguoiDungResponse } from '../../types/user';
import { NHAN_CHUONG_TRINH, NHAN_VAI_TRO } from '../../utils/constants';

interface Props {
  onLuu: (req: TaoNguoiDungRequest) => Promise<TaoNguoiDungResponse>;
  onHuy: () => void;
}

const VAI_TRO: VaiTro[] = ['SINH_VIEN', 'GIANG_VIEN', 'CAN_BO_DVHD', 'ADMIN'];

/** Toàn bộ ô nhập dạng chuỗi; khi gửi chỉ lấy khối hồ sơ khớp vai trò đã chọn. */
const RONG = {
  tenDangNhap: '', hoTen: '', email: '', dienThoai: '', matKhau: '',
  maSv: '', lop: '', khoaHoc: '', nganh: 'Công nghệ thông tin', khoaVienSv: 'Khoa Công nghệ thông tin',
  chuongTrinhDaoTao: 'CHUAN' as ChuongTrinhDaoTao,
  maGv: '', boMon: '', khoaVienGv: 'Khoa Công nghệ thông tin', hocHamHocVi: '', soSvToiDaGv: '',
  donViId: '', chucVu: '', soNamKinhNghiem: '', soSvToiDaCb: '',
};
type Form = typeof RONG;

const chu = (s: string) => s.trim() || undefined;
const so = (s: string) => (s.trim() === '' ? undefined : Number(s));

/** SCR-03 — form tạo tài khoản kèm hồ sơ theo vai trò (#7). Quy tắc trùng, hạn mức, kinh nghiệm do backend kiểm. */
export default function UserCreateForm({ onLuu, onHuy }: Props) {
  const [vaiTro, setVaiTro] = useState<VaiTro>('SINH_VIEN');
  const [f, setF] = useState<Form>(RONG);
  const [donVis, setDonVis] = useState<DonVi[]>([]);
  const [loi, setLoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);

  // Cán bộ chỉ tạo được cho đơn vị đã phê duyệt.
  useEffect(() => {
    if (vaiTro === 'CAN_BO_DVHD' && donVis.length === 0) {
      hostOrgApi.danhSach({ status: 'DA_DUYET' }).then(setDonVis).catch(setLoi);
    }
  }, [vaiTro, donVis.length]);

  const dat = (k: keyof Form, v: string) => setF((x) => ({ ...x, [k]: v }));
  const loiTruong = (t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);

  const gui = async (e: FormEvent) => {
    e.preventDefault();
    setLoi(null);
    setDangGui(true);
    try {
      await onLuu({
        tenDangNhap: f.tenDangNhap.trim(),
        hoTen: f.hoTen.trim(),
        email: f.email.trim(),
        dienThoai: chu(f.dienThoai),
        vaiTro,
        matKhau: chu(f.matKhau),
        sinhVien: vaiTro !== 'SINH_VIEN' ? undefined : {
          maSv: f.maSv.trim(), lop: chu(f.lop), khoaHoc: chu(f.khoaHoc), nganh: chu(f.nganh),
          khoaVien: chu(f.khoaVienSv), chuongTrinhDaoTao: f.chuongTrinhDaoTao,
        },
        giangVien: vaiTro !== 'GIANG_VIEN' ? undefined : {
          maGv: f.maGv.trim(), boMon: chu(f.boMon), khoaVien: chu(f.khoaVienGv), hocHamHocVi: chu(f.hocHamHocVi),
          soSvToiDa: so(f.soSvToiDaGv),
        },
        canBoDvhd: vaiTro !== 'CAN_BO_DVHD' ? undefined : {
          donViId: so(f.donViId) as number, chucVu: chu(f.chucVu),
          soNamKinhNghiem: so(f.soNamKinhNghiem) as number, soSvToiDa: so(f.soSvToiDaCb),
        },
      });
    } catch (err) {
      setLoi(err);
    } finally {
      setDangGui(false);
    }
  };

  /** `truong` là tên trường backend báo lỗi (có thể lồng: sinhVien.maSv). */
  const o = (k: keyof Form, nhan: string, truong: string, props: Record<string, unknown> = {}) => (
    <label className="field">
      <span>{nhan}</span>
      <input value={f[k]} onChange={(e) => dat(k, e.target.value)}
             className={loiTruong(truong) ? 'input-loi' : undefined} {...props} />
      {loiTruong(truong) && <small className="field-error">{loiTruong(truong)}</small>}
    </label>
  );

  return (
    <form onSubmit={gui} noValidate>
      <ErrorAlert error={loi} />
      <div className="form-grid">
        <label className="field">
          <span>Vai trò *</span>
          <select value={vaiTro} onChange={(e) => setVaiTro(e.target.value as VaiTro)} autoFocus>
            {VAI_TRO.map((v) => <option key={v} value={v}>{NHAN_VAI_TRO[v]}</option>)}
          </select>
        </label>
        {o('hoTen', 'Họ tên *', 'hoTen', { autoComplete: 'off' })}
        {o('tenDangNhap', 'Tên đăng nhập *', 'tenDangNhap', { autoComplete: 'off', placeholder: 'sv.ten, gv.ten…' })}
        {o('email', 'Email *', 'email', { type: 'email', autoComplete: 'off' })}
        {o('dienThoai', 'Điện thoại', 'dienThoai', { inputMode: 'tel' })}
        {o('matKhau', 'Mật khẩu ban đầu', 'matKhau', {
          type: 'text', autoComplete: 'off', placeholder: 'Bỏ trống để hệ thống tự sinh',
        })}
      </div>

      {vaiTro === 'SINH_VIEN' && (
        <>
          <h3 className="tk-nhom">Hồ sơ sinh viên</h3>
          <div className="form-grid">
            {o('maSv', 'Mã sinh viên *', 'sinhVien.maSv')}
            {o('lop', 'Lớp', 'sinhVien.lop', { placeholder: '66IT1' })}
            {o('khoaHoc', 'Khóa', 'sinhVien.khoaHoc', { placeholder: 'K66' })}
            {o('nganh', 'Ngành', 'sinhVien.nganh')}
            {o('khoaVienSv', 'Khoa / Viện', 'sinhVien.khoaVien')}
            <label className="field">
              <span>Chương trình đào tạo *</span>
              <select value={f.chuongTrinhDaoTao} onChange={(e) => dat('chuongTrinhDaoTao', e.target.value)}>
                {Object.entries(NHAN_CHUONG_TRINH).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
              </select>
            </label>
          </div>
          <p className="hint">Chương trình đào tạo quyết định ngưỡng đạt của CLO1, CLO2 khi xét công nhận (Điều 15 khoản 3).</p>
        </>
      )}

      {vaiTro === 'GIANG_VIEN' && (
        <>
          <h3 className="tk-nhom">Hồ sơ giảng viên</h3>
          <div className="form-grid">
            {o('maGv', 'Mã giảng viên *', 'giangVien.maGv')}
            {o('boMon', 'Bộ môn', 'giangVien.boMon')}
            {o('khoaVienGv', 'Khoa / Viện', 'giangVien.khoaVien')}
            {o('hocHamHocVi', 'Học hàm, học vị', 'giangVien.hocHamHocVi', { placeholder: 'ThS., TS.' })}
            {o('soSvToiDaGv', 'Hạn mức sinh viên', 'giangVien.soSvToiDa', {
              type: 'number', inputMode: 'numeric', placeholder: 'Mặc định theo Quy định',
            })}
          </div>
        </>
      )}

      {vaiTro === 'CAN_BO_DVHD' && (
        <>
          <h3 className="tk-nhom">Hồ sơ cán bộ hướng dẫn</h3>
          <div className="form-grid">
            <label className="field">
              <span>Đơn vị hướng dẫn *</span>
              <select value={f.donViId} onChange={(e) => dat('donViId', e.target.value)}
                      className={loiTruong('canBoDvhd.donViId') ? 'input-loi' : undefined}>
                <option value="">— Chọn đơn vị đã phê duyệt —</option>
                {donVis.map((d) => <option key={d.id} value={d.id}>{d.ten}</option>)}
              </select>
              {loiTruong('canBoDvhd.donViId') && <small className="field-error">{loiTruong('canBoDvhd.donViId')}</small>}
            </label>
            {o('chucVu', 'Chức vụ', 'canBoDvhd.chucVu')}
            {o('soNamKinhNghiem', 'Số năm kinh nghiệm *', 'canBoDvhd.soNamKinhNghiem', { type: 'number', min: 0, inputMode: 'numeric' })}
            {o('soSvToiDaCb', 'Hạn mức sinh viên', 'canBoDvhd.soSvToiDa', {
              type: 'number', min: 1, inputMode: 'numeric', placeholder: 'Mặc định theo Quy định',
            })}
          </div>
          <p className="hint">
            Cán bộ cần từ 3 năm kinh nghiệm (Điều 7 khoản 1 điểm c). Cán bộ của đơn vị chưa duyệt thì thêm ở màn Đơn vị
            hướng dẫn — tài khoản sẽ được kích hoạt khi đơn vị được phê duyệt.
          </p>
        </>
      )}

      {vaiTro === 'ADMIN' && (
        <p className="hint">Tài khoản giáo vụ có toàn quyền quản trị hệ thống, không có hồ sơ mở rộng.</p>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-phu" onClick={onHuy} disabled={dangGui}>Hủy</button>
        <button className="btn btn-chinh" disabled={dangGui}>{dangGui ? 'Đang tạo…' : 'Tạo tài khoản'}</button>
      </div>
    </form>
  );
}
