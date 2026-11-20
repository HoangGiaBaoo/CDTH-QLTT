import { useState, type FormEvent } from 'react';
import { authApi } from '../../api/auth';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import ErrorAlert from '../../components/ErrorAlert';
import { NHAN_CHUONG_TRINH, NHAN_VAI_TRO } from '../../utils/constants';

/** Cùng mẫu với MatKhauPolicy.MAU ở backend — chỉ để báo sớm, backend vẫn kiểm. */
const MAU_MAT_KHAU = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

/** SCR-06 — hồ sơ cá nhân: xem thông tin theo vai trò, sửa họ tên / email / điện thoại (#3), đổi mật khẩu (#4). */
export default function ProfilePage() {
  const { nguoiDung, taiLai, dangXuat } = useAuth();
  const [f, setF] = useState({
    hoTen: nguoiDung?.hoTen ?? '', email: nguoiDung?.email ?? '', dienThoai: nguoiDung?.dienThoai ?? '',
  });
  const [loiHoSo, setLoiHoSo] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [dangLuu, setDangLuu] = useState(false);

  const [mk, setMk] = useState({ hienTai: '', moi: '', nhapLai: '' });
  const [loiMk, setLoiMk] = useState<unknown>(null);
  const [loiNhapLai, setLoiNhapLai] = useState<string>();
  const [dangDoi, setDangDoi] = useState(false);

  if (!nguoiDung) return null;
  const { sinhVien, giangVien, canBoDvhd } = nguoiDung;

  const truong = (loi: unknown, t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);

  const luuHoSo = async (e: FormEvent) => {
    e.preventDefault();
    setLoiHoSo(null);
    setThongBao(undefined);
    setDangLuu(true);
    try {
      await authApi.capNhatHoSo({ hoTen: f.hoTen, email: f.email, dienThoai: f.dienThoai.trim() || undefined });
      await taiLai();
      setThongBao('Đã cập nhật hồ sơ cá nhân.');
    } catch (err) {
      setLoiHoSo(err);
    } finally {
      setDangLuu(false);
    }
  };

  const doiMatKhau = async (e: FormEvent) => {
    e.preventDefault();
    setLoiMk(null);
    setLoiNhapLai(undefined);
    if (mk.moi !== mk.nhapLai) {
      setLoiNhapLai('Mật khẩu nhập lại không khớp');
      return;
    }
    setDangDoi(true);
    try {
      await authApi.doiMatKhau({ matKhauHienTai: mk.hienTai, matKhauMoi: mk.moi });
      // Token cũ hết hiệu lực ngay sau khi đổi ⇒ đăng xuất, nạp lại hẳn trang đăng nhập. Không dùng navigate:
      // RequireRole thấy phiên rỗng sẽ tự chuyển về /login trước và làm mất thông báo "đã đổi mật khẩu".
      dangXuat();
      window.location.replace('/login?doiMatKhau=1');
    } catch (err) {
      setLoiMk(err);
      setDangDoi(false);
    }
  };

  const thongTin: [string, string | number | undefined][] = [
    ['Tên đăng nhập', nguoiDung.tenDangNhap],
    ['Vai trò', NHAN_VAI_TRO[nguoiDung.vaiTro]],
  ];
  if (sinhVien) {
    thongTin.push(['Mã sinh viên', sinhVien.maSv], ['Lớp', sinhVien.lop], ['Ngành', sinhVien.nganh],
      ['Chương trình', NHAN_CHUONG_TRINH[sinhVien.chuongTrinhDaoTao]]);
  }
  if (giangVien) {
    thongTin.push(['Mã giảng viên', giangVien.maGv], ['Bộ môn', giangVien.boMon], ['Học hàm, học vị', giangVien.hocHamHocVi],
      ['Hạn mức hướng dẫn', `${giangVien.soSvToiDa} sinh viên`]);
  }
  if (canBoDvhd) {
    thongTin.push(['Đơn vị', canBoDvhd.tenDonVi], ['Chức vụ', canBoDvhd.chucVu],
      ['Kinh nghiệm', `${canBoDvhd.soNamKinhNghiem} năm`], ['Hạn mức hướng dẫn', `${canBoDvhd.soSvToiDa} sinh viên`]);
  }

  const daNhapMk = mk.moi.length > 0;
  const mkHopLe = MAU_MAT_KHAU.test(mk.moi);

  return (
    <div>
      <h1 className="page-title">Hồ sơ cá nhân</h1>

      <div className="card mb">
        <h2 className="section-title mt0">Thông tin tài khoản</h2>
        <div className="info-grid">
          {thongTin.map(([nhan, giaTri]) => (
            <div key={nhan}><span className="muted">{nhan}</span>{giaTri ?? '—'}</div>
          ))}
        </div>
        <p className="hint">Vai trò, mã định danh và thông tin đào tạo do giáo vụ quản lý; bạn chỉ tự sửa được thông tin liên hệ.</p>
      </div>

      <div className="hs-luoi">
        <form className="card" onSubmit={luuHoSo} noValidate>
          <h2 className="section-title mt0">Thông tin liên hệ</h2>
          {thongBao && <div className="alert alert-xanh mb">{thongBao}</div>}
          <ErrorAlert error={loiHoSo} />
          <div className="hs-o">
            <label className="field">
              <span>Họ tên *</span>
              <input value={f.hoTen} onChange={(e) => setF((x) => ({ ...x, hoTen: e.target.value }))} autoComplete="name" />
              {truong(loiHoSo, 'hoTen') && <small className="field-error">{truong(loiHoSo, 'hoTen')}</small>}
            </label>
            <label className="field">
              <span>Email *</span>
              <input type="email" value={f.email} onChange={(e) => setF((x) => ({ ...x, email: e.target.value }))} autoComplete="email" />
              {truong(loiHoSo, 'email') && <small className="field-error">{truong(loiHoSo, 'email')}</small>}
            </label>
            <label className="field">
              <span>Điện thoại</span>
              <input inputMode="tel" value={f.dienThoai} onChange={(e) => setF((x) => ({ ...x, dienThoai: e.target.value }))} autoComplete="tel" />
              {truong(loiHoSo, 'dienThoai') && <small className="field-error">{truong(loiHoSo, 'dienThoai')}</small>}
            </label>
          </div>
          <div className="form-actions">
            <button className="btn btn-chinh" disabled={dangLuu}>{dangLuu ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
          </div>
        </form>

        <form className="card" onSubmit={doiMatKhau} noValidate>
          <h2 className="section-title mt0">Đổi mật khẩu</h2>
          <ErrorAlert error={loiMk} />
          <div className="hs-o">
            <label className="field">
              <span>Mật khẩu hiện tại *</span>
              <input type="password" value={mk.hienTai} onChange={(e) => setMk((x) => ({ ...x, hienTai: e.target.value }))}
                     autoComplete="current-password" />
              {truong(loiMk, 'matKhauHienTai') && <small className="field-error">{truong(loiMk, 'matKhauHienTai')}</small>}
            </label>
            <label className="field">
              <span>Mật khẩu mới *</span>
              <input type="password" value={mk.moi} onChange={(e) => setMk((x) => ({ ...x, moi: e.target.value }))}
                     autoComplete="new-password" />
              {truong(loiMk, 'matKhauMoi') ? (
                <small className="field-error">{truong(loiMk, 'matKhauMoi')}</small>
              ) : (
                <small className={daNhapMk && !mkHopLe ? 'text-vang' : 'muted'}>
                  Tối thiểu 8 ký tự, gồm cả chữ và số{daNhapMk && mkHopLe && ' ✓'}
                </small>
              )}
            </label>
            <label className="field">
              <span>Nhập lại mật khẩu mới *</span>
              <input type="password" value={mk.nhapLai} onChange={(e) => setMk((x) => ({ ...x, nhapLai: e.target.value }))}
                     autoComplete="new-password" />
              {loiNhapLai && <small className="field-error">{loiNhapLai}</small>}
            </label>
          </div>
          <p className="hint">Sau khi đổi mật khẩu, bạn cần đăng nhập lại trên mọi thiết bị.</p>
          <div className="form-actions">
            <button className="btn btn-chinh" disabled={dangDoi || !mk.hienTai || !mk.moi || !mk.nhapLai}>
              {dangDoi ? 'Đang đổi…' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
