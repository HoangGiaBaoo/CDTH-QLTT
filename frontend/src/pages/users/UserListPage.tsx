import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { userApi } from '../../api/users';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import type { PageResponse } from '../../types/api';
import type { NguoiDung, TrangThaiTaiKhoan, VaiTro } from '../../types/auth';
import type { TaoNguoiDungRequest, TaoNguoiDungResponse } from '../../types/user';
import { NHAN_CHUONG_TRINH, NHAN_TRANG_THAI_TAI_KHOAN, NHAN_VAI_TRO } from '../../utils/constants';
import MatKhauMotLan from './MatKhauMotLan';
import UserCreateForm from './UserCreateForm';

const VAI_TRO: VaiTro[] = ['SINH_VIEN', 'GIANG_VIEN', 'CAN_BO_DVHD', 'ADMIN'];
const TRANG_THAI: TrangThaiTaiKhoan[] = ['HOAT_DONG', 'VO_HIEU_HOA'];
const MOI_TRANG = 15;

/** Một dòng tóm tắt hồ sơ mở rộng theo vai trò — để giáo vụ nhận ra người dùng mà không mở chi tiết. */
export function tomTatHoSo(n: NguoiDung): string {
  if (n.sinhVien) {
    return [n.sinhVien.maSv, n.sinhVien.lop, NHAN_CHUONG_TRINH[n.sinhVien.chuongTrinhDaoTao]].filter(Boolean).join(' · ');
  }
  if (n.giangVien) return [n.giangVien.maGv, n.giangVien.boMon].filter(Boolean).join(' · ');
  if (n.canBoDvhd) return [n.canBoDvhd.tenDonVi, n.canBoDvhd.chucVu].filter(Boolean).join(' · ');
  return '—';
}

/** SCR-03 — danh sách tài khoản: lọc vai trò / trạng thái / từ khóa, phân trang 15 dòng, tạo tài khoản (UC01, #5, #7).
 *  Bộ lọc + trang giữ trong URL (`?vaiTro=&trangThai=&q=&trang=`) để từ chi tiết quay lại đúng chỗ. */
export default function UserListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [kq, setKq] = useState<PageResponse<NguoiDung> | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [moForm, setMoForm] = useState(false);
  const [vuaTao, setVuaTao] = useState<TaoNguoiDungResponse | null>(null);

  const vaiTro = (params.get('vaiTro') ?? '') as VaiTro | '';
  const trangThai = (params.get('trangThai') ?? '') as TrangThaiTaiKhoan | '';
  const tuKhoa = params.get('q') ?? '';
  const trang = Math.max(0, Number(params.get('trang') ?? 1) - 1) || 0;
  const [oTim, setOTim] = useState(tuKhoa);

  /** Đổi một bộ lọc ⇒ về trang 1; `trang` trong URL đánh số từ 1 cho dễ đọc. */
  const datLoc = (khoa: string, giaTri: string) => {
    const moi = new URLSearchParams(params);
    if (giaTri) moi.set(khoa, giaTri); else moi.delete(khoa);
    if (khoa !== 'trang') moi.delete('trang');
    setParams(moi, { replace: true });
  };

  const tai = useCallback(async () => {
    setLoi(null);
    try {
      setKq(await userApi.danhSach({
        role: vaiTro || undefined, status: trangThai || undefined, keyword: tuKhoa || undefined, page: trang, size: MOI_TRANG,
      }));
    } catch (e) {
      setLoi(e);
      setKq({ items: [], page: 0, size: MOI_TRANG, total: 0 });
    }
  }, [vaiTro, trangThai, tuKhoa, trang]);

  useEffect(() => { void tai(); }, [tai]);

  const tim = (e: FormEvent) => {
    e.preventDefault();
    datLoc('q', oTim.trim());
  };
  const sangTrang = (t: number) => datLoc('trang', t > 0 ? String(t + 1) : '');
  /** Mang theo bộ lọc hiện tại để nút "← Danh sách tài khoản" ở chi tiết quay về đúng chỗ. */
  const moChiTiet = (id: number) => navigate(`/users/${id}`, { state: { quayLai: `/users?${params}` } });

  const tao = async (req: TaoNguoiDungRequest) => {
    const { data } = await userApi.tao(req);
    setMoForm(false);
    setVuaTao(data);
    void tai();
    return data;
  };

  const soTrang = kq ? Math.max(1, Math.ceil(kq.total / MOI_TRANG)) : 1;

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Tài khoản</h1>
        {!moForm && <button className="btn btn-chinh" onClick={() => { setVuaTao(null); setMoForm(true); }}>+ Tạo tài khoản</button>}
      </div>

      {vuaTao && (
        <MatKhauMotLan tieuDe={`Đã tạo tài khoản ${NHAN_VAI_TRO[vuaTao.nguoiDung.vaiTro].toLowerCase()} cho ${vuaTao.nguoiDung.hoTen}.`}
                       tenDangNhap={vuaTao.nguoiDung.tenDangNhap} matKhau={vuaTao.matKhauBanDau}>
          <Link to={`/users/${vuaTao.nguoiDung.id}`}>Xem chi tiết tài khoản</Link>
        </MatKhauMotLan>
      )}

      {moForm && (
        <div className="card mb">
          <h2 className="section-title mt0">Tạo tài khoản</h2>
          <UserCreateForm onLuu={tao} onHuy={() => setMoForm(false)} />
        </div>
      )}

      <form className="toolbar" onSubmit={tim}>
        <label className="field field-inline">
          <span>Vai trò</span>
          <select value={vaiTro} onChange={(e) => datLoc('vaiTro', e.target.value)}>
            <option value="">Tất cả</option>
            {VAI_TRO.map((v) => <option key={v} value={v}>{NHAN_VAI_TRO[v]}</option>)}
          </select>
        </label>
        <label className="field field-inline">
          <span>Trạng thái</span>
          <select value={trangThai} onChange={(e) => datLoc('trangThai', e.target.value)}>
            <option value="">Tất cả</option>
            {TRANG_THAI.map((t) => <option key={t} value={t}>{NHAN_TRANG_THAI_TAI_KHOAN[t]}</option>)}
          </select>
        </label>
        <label className="field field-inline tk-tim">
          <span>Tìm kiếm</span>
          <input value={oTim} onChange={(e) => setOTim(e.target.value)} placeholder="Họ tên, tên đăng nhập hoặc email" />
        </label>
        <button className="btn btn-phu">Tìm</button>
      </form>

      <ErrorAlert error={loi} />
      {!kq ? <Loading /> : kq.items.length === 0 ? (
        <div className="card empty"><div className="muted">Không có tài khoản nào phù hợp.</div></div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table table-click tk-bang">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Tên đăng nhập</th>
                  <th>Vai trò</th>
                  <th>Hồ sơ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {kq.items.map((n) => (
                  <tr key={n.id} onClick={() => moChiTiet(n.id)} tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && moChiTiet(n.id)}>
                    <td>
                      <div className="tk-ten">{n.hoTen}</div>
                      <div className="muted small">{n.email}</div>
                    </td>
                    <td className="nowrap">{n.tenDangNhap}</td>
                    <td className="nowrap">{NHAN_VAI_TRO[n.vaiTro]}</td>
                    <td>{tomTatHoSo(n)}</td>
                    <td className="tk-tt"><StatusBadge value={n.trangThai} labels={NHAN_TRANG_THAI_TAI_KHOAN} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tk-trang">
            <span className="muted small">
              {kq.total} tài khoản · trang {trang + 1}/{soTrang}
            </span>
            <div className="tk-trang-nut">
              <button className="btn btn-phu btn-nho" disabled={trang === 0} onClick={() => sangTrang(trang - 1)}>‹ Trước</button>
              <button className="btn btn-phu btn-nho" disabled={trang + 1 >= soTrang} onClick={() => sangTrang(trang + 1)}>Sau ›</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
