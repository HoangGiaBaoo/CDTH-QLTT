import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { userApi } from '../../api/users';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import type { NguoiDung } from '../../types/auth';
import type { TaoNguoiDungResponse } from '../../types/user';
import { NHAN_CHUONG_TRINH, NHAN_TRANG_THAI_TAI_KHOAN, NHAN_VAI_TRO } from '../../utils/constants';
import { ngayGio } from '../../utils/format';
import MatKhauMotLan from './MatKhauMotLan';

type Phan = 'tai-khoan' | 'ho-so' | null;

interface ONhap {
  k: string;
  nhan: string;
  /** Tên trường backend báo lỗi. */
  truong?: string;
  props?: Record<string, unknown>;
  chon?: [string, string][];
}

/** Form sửa nhỏ dùng chung cho #8, #13, #16: lưu ⇒ gọi `onLuu` với giá trị chuỗi, lỗi trường gắn dưới ô. */
function FormSua({ dau, o, onLuu, onHuy, ghiChu }: {
  dau: Record<string, string>;
  o: ONhap[];
  onLuu: (v: Record<string, string>) => Promise<void>;
  onHuy: () => void;
  ghiChu?: ReactNode;
}) {
  const [v, setV] = useState(dau);
  const [loi, setLoi] = useState<unknown>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const loiTruong = (t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);

  const gui = async (e: FormEvent) => {
    e.preventDefault();
    setLoi(null);
    setDangLuu(true);
    try {
      await onLuu(v);
    } catch (err) {
      setLoi(err);
      setDangLuu(false);
    }
  };

  return (
    <form onSubmit={gui} noValidate>
      <ErrorAlert error={loi} />
      <div className="form-grid">
        {o.map(({ k, nhan, truong = k, props, chon }) => (
          <label key={k} className="field">
            <span>{nhan}</span>
            {chon ? (
              <select value={v[k]} onChange={(e) => setV((x) => ({ ...x, [k]: e.target.value }))}>
                {chon.map(([gt, n]) => <option key={gt} value={gt}>{n}</option>)}
              </select>
            ) : (
              <input value={v[k] ?? ''} onChange={(e) => setV((x) => ({ ...x, [k]: e.target.value }))}
                     className={loiTruong(truong) ? 'input-loi' : undefined} {...props} />
            )}
            {loiTruong(truong) && <small className="field-error">{loiTruong(truong)}</small>}
          </label>
        ))}
      </div>
      {ghiChu && <p className="hint">{ghiChu}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-phu" onClick={onHuy} disabled={dangLuu}>Hủy</button>
        <button className="btn btn-chinh" disabled={dangLuu}>{dangLuu ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
      </div>
    </form>
  );
}

const chu = (s: string | undefined) => s?.trim() || undefined;

/** SCR-03 — chi tiết tài khoản: thông tin cơ bản (#6, #8), hồ sơ theo vai trò (#13, #16), khóa / mở (#9), đặt lại mật khẩu (#10). */
export default function UserDetailPage() {
  const userId = Number(useParams().userId);
  const quayLai = (useLocation().state as { quayLai?: string } | null)?.quayLai ?? '/users';
  const { nguoiDung: toi } = useAuth();
  const [n, setN] = useState<NguoiDung | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [matKhauMoi, setMatKhauMoi] = useState<TaoNguoiDungResponse | null>(null);
  const [sua, setSua] = useState<Phan>(null);
  const [hoi, setHoi] = useState<'trang-thai' | 'mat-khau' | null>(null);
  const [dangXuLy, setDangXuLy] = useState(false);

  const tai = useCallback(async () => {
    setLoiTai(null);
    try {
      setN(await userApi.chiTiet(userId));
    } catch (e) {
      setLoiTai(e);
    }
  }, [userId]);

  useEffect(() => { void tai(); }, [tai]);

  if (loiTai) return <><Link to={quayLai} className="back-link">← Danh sách tài khoản</Link><ErrorAlert error={loiTai} /></>;
  if (!n) return <Loading />;

  const laToi = toi?.id === n.id;
  const dangHoatDong = n.trangThai === 'HOAT_DONG';

  const bao = (message?: string) => {
    setLoi(null);
    setThongBao(message);
    setSua(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const luuTaiKhoan = async (v: Record<string, string>) => {
    const { data, message } = await userApi.capNhat(n.id, { hoTen: v.hoTen, email: v.email, dienThoai: chu(v.dienThoai) });
    setN(data);
    bao(message);
  };

  const luuSinhVien = async (v: Record<string, string>) => {
    const { message } = await userApi.capNhatSinhVien(n.sinhVien!.id, {
      maSv: v.maSv, lop: chu(v.lop), khoaHoc: chu(v.khoaHoc), nganh: chu(v.nganh), khoaVien: chu(v.khoaVien),
      chuongTrinhDaoTao: v.chuongTrinhDaoTao as 'CHUAN' | 'CLC_STEM',
    });
    setN(await userApi.chiTiet(n.id));
    bao(message);
  };

  const luuGiangVien = async (v: Record<string, string>) => {
    const { message } = await userApi.capNhatGiangVien(n.giangVien!.id, {
      boMon: chu(v.boMon), khoaVien: chu(v.khoaVien), hocHamHocVi: chu(v.hocHamHocVi),
      soSvToiDa: (v.soSvToiDa.trim() === '' ? undefined : Number(v.soSvToiDa)) as number,
    });
    setN(await userApi.chiTiet(n.id));
    bao(message);
  };

  const xacNhan = async () => {
    setDangXuLy(true);
    setLoi(null);
    try {
      if (hoi === 'trang-thai') {
        const { data, message } = await userApi.doiTrangThai(n.id, dangHoatDong ? 'VO_HIEU_HOA' : 'HOAT_DONG');
        setN(data);
        setMatKhauMoi(null);
        bao(message);
      } else {
        const { data } = await userApi.datLaiMatKhau(n.id);
        setThongBao(undefined);
        setMatKhauMoi(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      setLoi(e);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setDangXuLy(false);
      setHoi(null);
    }
  };

  const { sinhVien: sv, giangVien: gv, canBoDvhd: cb } = n;

  return (
    <div>
      <Link to={quayLai} className="back-link">← Danh sách tài khoản</Link>
      <div className="page-head">
        <h1 className="page-title">{n.hoTen} <StatusBadge value={n.trangThai} labels={NHAN_TRANG_THAI_TAI_KHOAN} /></h1>
        <div className="tk-nut">
          <button className="btn btn-phu" onClick={() => setHoi('mat-khau')}>Đặt lại mật khẩu</button>
          {!(laToi && dangHoatDong) && (
            <button className={`btn ${dangHoatDong ? 'btn-phu' : 'btn-chinh'}`} onClick={() => setHoi('trang-thai')}>
              {dangHoatDong ? 'Vô hiệu hóa' : 'Kích hoạt'}
            </button>
          )}
        </div>
      </div>

      {thongBao && <div className="alert alert-xanh mb">{thongBao}</div>}
      {matKhauMoi && (
        <MatKhauMotLan tieuDe="Đã đặt lại mật khẩu." tenDangNhap={matKhauMoi.nguoiDung.tenDangNhap} matKhau={matKhauMoi.matKhauBanDau} />
      )}
      <ErrorAlert error={loi} />

      <div className="card mb">
        <div className="card-head">
          <h2 className="section-title mt0">Thông tin tài khoản</h2>
          {sua !== 'tai-khoan' && <button className="btn btn-phu btn-nho" onClick={() => setSua('tai-khoan')}>Sửa</button>}
        </div>
        {sua === 'tai-khoan' ? (
          <FormSua dau={{ hoTen: n.hoTen, email: n.email, dienThoai: n.dienThoai ?? '' }}
                   o={[
                     { k: 'hoTen', nhan: 'Họ tên *', props: { autoFocus: true } },
                     { k: 'email', nhan: 'Email *', props: { type: 'email' } },
                     { k: 'dienThoai', nhan: 'Điện thoại', props: { inputMode: 'tel' } },
                   ]}
                   ghiChu="Vai trò không đổi được sau khi tạo — mỗi tài khoản gắn đúng một vai trò."
                   onLuu={luuTaiKhoan} onHuy={() => setSua(null)} />
        ) : (
          <div className="info-grid">
            <div><span className="muted">Tên đăng nhập</span>{n.tenDangNhap}</div>
            <div><span className="muted">Vai trò</span>{NHAN_VAI_TRO[n.vaiTro]}</div>
            <div><span className="muted">Email</span>{n.email}</div>
            <div><span className="muted">Điện thoại</span>{n.dienThoai ?? '—'}</div>
            <div><span className="muted">Ngày tạo</span>{ngayGio(n.ngayTao)}</div>
          </div>
        )}
      </div>

      {sv && (
        <div className="card mb">
          <div className="card-head">
            <h2 className="section-title mt0">Hồ sơ sinh viên</h2>
            {sua !== 'ho-so' && <button className="btn btn-phu btn-nho" onClick={() => setSua('ho-so')}>Sửa</button>}
          </div>
          {sua === 'ho-so' ? (
            <FormSua dau={{
              maSv: sv.maSv, lop: sv.lop ?? '', khoaHoc: sv.khoaHoc ?? '', nganh: sv.nganh ?? '', khoaVien: sv.khoaVien ?? '',
              chuongTrinhDaoTao: sv.chuongTrinhDaoTao,
            }} o={[
              { k: 'maSv', nhan: 'Mã sinh viên *', props: { autoFocus: true } },
              { k: 'lop', nhan: 'Lớp' }, { k: 'khoaHoc', nhan: 'Khóa' }, { k: 'nganh', nhan: 'Ngành' },
              { k: 'khoaVien', nhan: 'Khoa / Viện' },
              { k: 'chuongTrinhDaoTao', nhan: 'Chương trình đào tạo *', chon: Object.entries(NHAN_CHUONG_TRINH) },
            ]} ghiChu="Chương trình đào tạo quyết định ngưỡng đạt của CLO1, CLO2 khi xét công nhận (Điều 15 khoản 3)."
                     onLuu={luuSinhVien} onHuy={() => setSua(null)} />
          ) : (
            <div className="info-grid">
              <div><span className="muted">Mã sinh viên</span>{sv.maSv}</div>
              <div><span className="muted">Lớp</span>{sv.lop ?? '—'}</div>
              <div><span className="muted">Khóa</span>{sv.khoaHoc ?? '—'}</div>
              <div><span className="muted">Ngành</span>{sv.nganh ?? '—'}</div>
              <div><span className="muted">Khoa / Viện</span>{sv.khoaVien ?? '—'}</div>
              <div><span className="muted">Chương trình đào tạo</span>{NHAN_CHUONG_TRINH[sv.chuongTrinhDaoTao]}</div>
            </div>
          )}
        </div>
      )}

      {gv && (
        <div className="card mb">
          <div className="card-head">
            <h2 className="section-title mt0">Hồ sơ giảng viên</h2>
            {sua !== 'ho-so' && <button className="btn btn-phu btn-nho" onClick={() => setSua('ho-so')}>Sửa</button>}
          </div>
          {sua === 'ho-so' ? (
            <FormSua dau={{ boMon: gv.boMon ?? '', khoaVien: gv.khoaVien ?? '', hocHamHocVi: gv.hocHamHocVi ?? '', soSvToiDa: String(gv.soSvToiDa) }}
                     o={[
                       { k: 'boMon', nhan: 'Bộ môn', props: { autoFocus: true } }, { k: 'khoaVien', nhan: 'Khoa / Viện' },
                       { k: 'hocHamHocVi', nhan: 'Học hàm, học vị' },
                       { k: 'soSvToiDa', nhan: 'Hạn mức sinh viên *', props: { type: 'number', inputMode: 'numeric' } },
                     ]}
                     ghiChu="Mỗi giảng viên hướng dẫn từ 5 đến 10 sinh viên mỗi đợt (Điều 6 khoản 2 điểm b). Mã giảng viên không sửa được."
                     onLuu={luuGiangVien} onHuy={() => setSua(null)} />
          ) : (
            <div className="info-grid">
              <div><span className="muted">Mã giảng viên</span>{gv.maGv}</div>
              <div><span className="muted">Bộ môn</span>{gv.boMon ?? '—'}</div>
              <div><span className="muted">Khoa / Viện</span>{gv.khoaVien ?? '—'}</div>
              <div><span className="muted">Học hàm, học vị</span>{gv.hocHamHocVi ?? '—'}</div>
              <div><span className="muted">Hạn mức hướng dẫn</span>{gv.soSvToiDa} sinh viên / đợt</div>
            </div>
          )}
        </div>
      )}

      {cb && (
        <div className="card mb">
          <div className="card-head">
            <h2 className="section-title mt0">Hồ sơ cán bộ hướng dẫn</h2>
            <Link className="btn btn-phu btn-nho" to={`/host-orgs/${cb.donViId}`}>Mở đơn vị</Link>
          </div>
          <div className="info-grid">
            <div><span className="muted">Đơn vị</span>{cb.tenDonVi}</div>
            <div><span className="muted">Chức vụ</span>{cb.chucVu ?? '—'}</div>
            <div><span className="muted">Kinh nghiệm</span>{cb.soNamKinhNghiem} năm</div>
            <div><span className="muted">Hạn mức hướng dẫn</span>{cb.soSvToiDa} sinh viên / đợt</div>
          </div>
          <p className="hint">Chức vụ, kinh nghiệm và hạn mức của cán bộ sửa ở màn Đơn vị hướng dẫn.</p>
        </div>
      )}

      <ConfirmDialog mo={hoi === 'trang-thai'} tieuDe={dangHoatDong ? `Vô hiệu hóa tài khoản ${n.tenDangNhap}?` : `Kích hoạt tài khoản ${n.tenDangNhap}?`}
                     nhanXacNhan={dangHoatDong ? 'Vô hiệu hóa' : 'Kích hoạt'} nguyHiem={dangHoatDong} dangXuLy={dangXuLy}
                     onXacNhan={() => void xacNhan()} onHuy={() => setHoi(null)}>
        <p>
          {dangHoatDong
            ? 'Người dùng không đăng nhập được nữa, phiên đang mở cũng bị từ chối. Dữ liệu đã phát sinh được giữ nguyên. '
              + 'Người đang hướng dẫn sinh viên trong đợt đang chạy thì cần đổi người hướng dẫn trước.'
            : n.vaiTro === 'CAN_BO_DVHD'
              ? 'Người dùng đăng nhập lại được bằng mật khẩu hiện có. Cán bộ của đơn vị chưa được phê duyệt thì tài khoản '
                + 'được kích hoạt khi phê duyệt đơn vị, kèm mật khẩu ban đầu.'
              : 'Người dùng đăng nhập lại được bằng mật khẩu hiện có.'}
        </p>
      </ConfirmDialog>

      <ConfirmDialog mo={hoi === 'mat-khau'} tieuDe={`Đặt lại mật khẩu cho ${n.tenDangNhap}?`} nhanXacNhan="Đặt lại mật khẩu"
                     dangXuLy={dangXuLy} onXacNhan={() => void xacNhan()} onHuy={() => setHoi(null)}>
        <p>Hệ thống sinh mật khẩu mới và mở khóa nếu tài khoản đang bị khóa do đăng nhập sai. Mật khẩu cũ hết hiệu lực ngay.</p>
      </ConfirmDialog>
    </div>
  );
}
