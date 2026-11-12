import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { recordApi } from '../../api/records';
import { studyPlanApi } from '../../api/studyPlans';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_KE_HOACH } from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import type { HoSo } from '../../types/record';
import type { KeHoach } from '../../types/studyPlan';
import type { Dot } from '../../types/term';
import { hanConLai, khoangTuan } from '../../utils/lich';

type NoiDung = { mucTieu: string; ketQuaMongDoi: string; hinhThucMinhChung: string };
type ThaoTac = 'GUI' | 'XAC_NHAN' | 'MO_LAI';

const tuMuc = (k: KeHoach): Record<number, NoiDung> => Object.fromEntries(k.cacMuc.map((m) => [m.tuan, {
  mucTieu: m.mucTieu ?? '', ketQuaMongDoi: m.ketQuaMongDoi ?? '', hinhThucMinhChung: m.hinhThucMinhChung ?? '',
}]));
const du = (n?: NoiDung) => !!n && !!n.mucTieu.trim() && !!n.ketQuaMongDoi.trim() && !!n.hinhThucMinhChung.trim();

/** `/records/:recordId/study_plan` — đích NT-07 (SV và cán bộ cùng mở). */
export function StudyPlanRoute() {
  const id = Number(useParams().recordId);
  return <StudyPlanPage key={id} recordId={id} />;
}

/**
 * SCR-14 — Kế hoạch học tập TTTN-02 (UC06). Sinh viên điền N tuần + dòng Tổng kết rồi gửi (#53, #54); cán bộ ĐVHD và
 * GVHD của hồ sơ xác nhận (#55, đủ hai ⇒ khóa); GVHD mở lại (#56). `recordId` trống ⇒ hồ sơ của SV đang đăng nhập (#40).
 * Quy tắc (đủ ba nội dung, hạn nộp, quyền) do backend kiểm; giao diện chỉ đánh dấu ô trống sau lần gửi bị từ chối.
 */
export default function StudyPlanPage({ recordId }: { recordId?: number }) {
  const { nguoiDung } = useAuth();
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [dot, setDot] = useState<Dot | null>(null);
  const [kh, setKh] = useState<KeHoach | null>(null);
  const [nhap, setNhap] = useState<Record<number, NoiDung>>({});
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [chuaCo, setChuaCo] = useState<string>();
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [hoi, setHoi] = useState<ThaoTac | null>(null);
  const [dangGui, setDangGui] = useState(false);
  const [daThuGui, setDaThuGui] = useState(false);

  useEffect(() => {
    let conHieuLuc = true;
    (async () => {
      const h = recordId ? await recordApi.chiTiet(recordId) : await recordApi.cuaToi();
      const [d, k] = await Promise.all([
        termApi.chiTiet(h.dot.id),
        studyPlanApi.theoHoSo(h.id).catch((e) => {
          if (e instanceof ApiError && e.code === 'RESOURCE_NOT_FOUND') return e.message;
          throw e;
        }),
      ]);
      if (!conHieuLuc) return;
      setHoSo(h);
      setDot(d);
      if (typeof k === 'string') setChuaCo(k);
      else { setKh(k); setNhap(tuMuc(k)); }
    })().catch((e) => { if (conHieuLuc) setLoiTai(e); });
    return () => { conHieuLuc = false; };
  }, [recordId]);

  const goc = useMemo(() => (kh ? tuMuc(kh) : {}), [kh]);
  const doi = kh ? kh.cacMuc.some((m) => JSON.stringify(goc[m.tuan]) !== JSON.stringify(nhap[m.tuan])) : false;

  const laSv = nguoiDung?.vaiTro === 'SINH_VIEN';
  const laCanBo = nguoiDung?.vaiTro === 'CAN_BO_DVHD' && hoSo?.canBoDvhd?.nguoiDungId === nguoiDung.id;
  const laGvhd = nguoiDung?.vaiTro === 'GIANG_VIEN' && hoSo?.gvhd?.nguoiDungId === nguoiDung.id;
  const quayLai = laSv
    ? <Link to="/my-record" className="back-link">← Hồ sơ thực tập của tôi</Link>
    : hoSo && <Link to={`/records/${hoSo.id}`} className="back-link">← Hồ sơ của {hoSo.sinhVien.hoTen}</Link>;

  const tieuDe = (
    <>
      {quayLai}
      <div className="page-head">
        <div>
          <h1 className="page-title">Kế hoạch học tập TTTN-02</h1>
          {hoSo && !laSv && <div className="muted small">{hoSo.sinhVien.hoTen} — {hoSo.sinhVien.maSv} · đợt {hoSo.dot.maDot}</div>}
        </div>
        {kh && (
          <div className="action-bar-buttons">
            {kh.nopMuon && <span className="badge badge-do">Nộp muộn</span>}
            <StatusBadge value={kh.trangThai} labels={NHAN_TRANG_THAI_KE_HOACH} />
          </div>
        )}
      </div>
    </>
  );

  if (loiTai) {
    const chuaCoHoSo = laSv && loiTai instanceof ApiError && loiTai.code === 'RESOURCE_NOT_FOUND';
    return (
      <div>
        {tieuDe}
        {chuaCoHoSo ? (
          <div className="card empty">
            <div className="empty-title">{loiTai.message}</div>
            <div className="muted">Kế hoạch học tập được tạo sau khi bạn đăng ký và GVHD phê duyệt hồ sơ.</div>
            <Link to="/my-record" className="btn btn-chinh">Đăng ký thực tập</Link>
          </div>
        ) : <ErrorAlert error={loiTai} />}
      </div>
    );
  }
  if (!hoSo || !dot || (!kh && !chuaCo)) return <div>{tieuDe}<Loading /></div>;
  if (!kh) {
    return (
      <div>
        {tieuDe}
        <div className="card empty">
          <div className="empty-title">Chưa có kế hoạch học tập</div>
          <div className="muted">{chuaCo}</div>
        </div>
      </div>
    );
  }

  const suaDuoc = laSv && kh.trangThai === 'NHAP' && hoSo.trangThai === 'DANG_THUC_TAP';
  const xacNhanDuoc = kh.trangThai === 'CHO_XAC_NHAN'
    && ((laCanBo && !kh.xacNhanDvhd) || (laGvhd && !kh.xacNhanGvhd));
  const moLaiDuoc = laGvhd && kh.trangThai !== 'NHAP';
  const soDongDu = kh.cacMuc.filter((m) => du(nhap[m.tuan])).length;
  const han = hanConLai(kh.hanNop);
  const soTuan = kh.cacMuc.filter((m) => !m.laTongKet).length;

  const sua = (tuan: number, truong: keyof NoiDung, giaTri: string) =>
    setNhap((cu) => ({ ...cu, [tuan]: { ...cu[tuan], [truong]: giaTri } }));

  const capNhatTuBackend = (k: KeHoach) => { setKh(k); setNhap(tuMuc(k)); };

  const luu = async (): Promise<KeHoach> => {
    const { data } = await studyPlanApi.capNhat(kh.id, {
      cacMuc: kh.cacMuc.map((m) => ({ tuan: m.tuan, ...nhap[m.tuan] })),
    });
    capNhatTuBackend(data);
    return data;
  };

  const chay = async (viec: () => Promise<string | undefined>) => {
    setHoi(null);
    setDangGui(true);
    setLoi(null);
    setThongBao(undefined);
    try {
      setThongBao(await viec());
    } catch (e) {
      setLoi(e);
    } finally {
      setDangGui(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const luuNhap = () => chay(async () => { await luu(); return 'Đã lưu kế hoạch'; });
  const guiXacNhan = () => chay(async () => {
    setDaThuGui(true);
    const k = doi ? await luu() : kh;
    const { data, message } = await studyPlanApi.gui(k.id);
    capNhatTuBackend(data);
    return message;
  });
  const xacNhan = () => chay(async () => {
    const { data, message } = await studyPlanApi.xacNhan(kh.id);
    capNhatTuBackend(data);
    return data.trangThai === 'DA_KHOA' ? `${message}. Đủ xác nhận của ĐVHD và GVHD — kế hoạch đã khóa.` : message;
  });
  const moLai = () => chay(async () => {
    const { data, message } = await studyPlanApi.moLai(kh.id);
    capNhatTuBackend(data);
    setDaThuGui(false);
    return message;
  });

  const huongDan = (() => {
    if (kh.trangThai === 'DA_KHOA') return { loai: 'xanh', noiDung: 'Kế hoạch đã được cán bộ ĐVHD và GVHD xác nhận và khóa. Cần sửa thì GVHD mở lại (BR-06.4).' };
    if (kh.trangThai === 'CHO_XAC_NHAN') {
      const cho = [!kh.xacNhanDvhd && 'cán bộ ĐVHD', !kh.xacNhanGvhd && 'GVHD'].filter(Boolean).join(' và ');
      return { loai: 'xanh-duong', noiDung: `Đã gửi ${ngayGio(kh.ngayNop)}, chờ ${cho} xác nhận.${laSv ? ' Muốn sửa, hãy đề nghị GVHD mở lại kế hoạch.' : ''}` };
    }
    if (!laSv) return { loai: 'xanh-duong', noiDung: 'Sinh viên đang soạn kế hoạch, chưa gửi xác nhận.' };
    if (hoSo.trangThai !== 'DANG_THUC_TAP') return { loai: 'vang', noiDung: 'Hồ sơ không ở trạng thái Đang thực tập nên không sửa được kế hoạch.' };
    return {
      loai: han.quaHan ? 'vang' : 'xanh-duong',
      noiDung: `Điền đủ mục tiêu, kết quả mong đợi và hình thức minh chứng cho ${soTuan} tuần và dòng Tổng kết, rồi bấm Gửi xác nhận. `
        + `Hạn nộp ${ngay(kh.hanNop)} — 5 ngày làm việc kể từ ngày bắt đầu đợt (Điều 6 khoản 3 điểm a)`
        + (han.quaHan ? '; đã quá hạn, gửi vẫn được nhưng kế hoạch bị gắn nhãn Nộp muộn (BR-06.3).' : '.'),
    };
  })();

  const xacNhanO = (thoiDiem: string | undefined, ai: string, ten?: string) => (
    <div>
      <span className="muted">Xác nhận {ai}</span>
      {thoiDiem ? <span className="ck-dat">✓ {ngayGio(thoiDiem)}</span> : <span className="muted">Chưa xác nhận</span>}
      {ten && <span className="muted small">{ten}</span>}
    </div>
  );

  return (
    <div>
      {tieuDe}
      {thongBao && <div className="alert alert-xanh mb" role="status">{thongBao}</div>}
      <ErrorAlert error={loi} />

      <div className={`alert alert-${huongDan.loai} mb`} role="status">{huongDan.noiDung}</div>

      <div className="card mb">
        <div className="info-grid">
          <div>
            <span className="muted">Hạn nộp</span>{ngay(kh.hanNop)}
            {kh.trangThai === 'NHAP' && !kh.ngayNop && (
              <span className={`small ${han.quaHan ? 'text-do' : han.soNgay <= 2 ? 'text-vang' : 'muted'}`}>
                {han.quaHan ? 'Đã quá hạn' : han.homNayLaHan ? 'Hôm nay là hạn cuối' : `Còn ${han.soNgay} ngày làm việc, tính cả hôm nay`}
              </span>
            )}
          </div>
          <div>
            {/* Mở lại (#56) không xóa ngày gửi và nhãn Nộp muộn; gửi lại thì backend tính lại cả hai. */}
            <span className="muted">{kh.trangThai === 'NHAP' && kh.ngayNop ? 'Gửi lần trước' : 'Ngày gửi'}</span>
            {kh.ngayNop ? ngayGio(kh.ngayNop) : 'Chưa gửi'}
            {kh.nopMuon && <span className="small text-do">Nộp muộn</span>}
          </div>
          {xacNhanO(kh.xacNhanDvhd, 'ĐVHD', hoSo.canBoDvhd?.hoTen)}
          {xacNhanO(kh.xacNhanGvhd, 'GVHD', hoSo.gvhd?.hoTen)}
        </div>
        {(xacNhanDuoc || moLaiDuoc) && (
          <div className="form-actions ngan-tren mt">
            {moLaiDuoc && <button className="btn btn-phu" disabled={dangGui} onClick={() => setHoi('MO_LAI')}>Mở lại cho sinh viên sửa</button>}
            {xacNhanDuoc && <button className="btn btn-chinh" disabled={dangGui} onClick={() => setHoi('XAC_NHAN')}>Xác nhận kế hoạch</button>}
          </div>
        )}
      </div>

      <div className="card-head">
        <h2 className="section-title mt0">Kế hoạch theo tuần</h2>
        {suaDuoc && (
          <span className={`small ${soDongDu === kh.cacMuc.length ? 'ck-dat' : 'muted'}`}>
            {soDongDu}/{kh.cacMuc.length} dòng đủ ba nội dung{doi && ' · có thay đổi chưa lưu'}
          </span>
        )}
      </div>
      <div className="table-wrap">
        <table className="table ke-hoach">
          <thead>
            <tr>
              <th className="kh-tuan">Tuần</th>
              <th>Mục tiêu</th>
              <th>Kết quả mong đợi</th>
              <th className="kh-mc">Hình thức minh chứng</th>
            </tr>
          </thead>
          <tbody>
            {kh.cacMuc.map((m) => {
              const n = nhap[m.tuan];
              const loiO = (v: string) => (suaDuoc && daThuGui && !v.trim() ? ' input-loi' : '');
              return (
                <tr key={m.tuan} className={m.laTongKet ? 'kh-tong-ket' : undefined}>
                  <td className="kh-tuan">
                    <b>{m.laTongKet ? 'Tổng kết' : `Tuần ${m.tuan}`}</b>
                    {!m.laTongKet && <div className="muted small">{khoangTuan(dot, m.tuan)}</div>}
                  </td>
                  {suaDuoc ? (
                    <>
                      <td><textarea className={`textarea${loiO(n.mucTieu)}`} rows={3} maxLength={2000} value={n.mucTieu}
                                    aria-label={`Mục tiêu ${m.laTongKet ? 'Tổng kết' : `tuần ${m.tuan}`}`}
                                    onChange={(e) => sua(m.tuan, 'mucTieu', e.target.value)} /></td>
                      <td><textarea className={`textarea${loiO(n.ketQuaMongDoi)}`} rows={3} maxLength={2000} value={n.ketQuaMongDoi}
                                    aria-label={`Kết quả mong đợi ${m.laTongKet ? 'Tổng kết' : `tuần ${m.tuan}`}`}
                                    onChange={(e) => sua(m.tuan, 'ketQuaMongDoi', e.target.value)} /></td>
                      <td><textarea className={`textarea${loiO(n.hinhThucMinhChung)}`} rows={3} maxLength={200} value={n.hinhThucMinhChung}
                                    aria-label={`Hình thức minh chứng ${m.laTongKet ? 'Tổng kết' : `tuần ${m.tuan}`}`}
                                    onChange={(e) => sua(m.tuan, 'hinhThucMinhChung', e.target.value)} /></td>
                    </>
                  ) : (
                    <>
                      <td className="pre-line">{m.mucTieu ?? <span className="muted">—</span>}</td>
                      <td className="pre-line">{m.ketQuaMongDoi ?? <span className="muted">—</span>}</td>
                      <td className="pre-line">{m.hinhThucMinhChung ?? <span className="muted">—</span>}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {suaDuoc && (
        <div className="card pc-thanh">
          <span className="muted small">
            {doi ? 'Có thay đổi chưa lưu.' : 'Đã lưu.'} Gửi xác nhận sẽ lưu luôn các thay đổi.
          </span>
          <div className="action-bar-buttons">
            <button className="btn btn-phu" disabled={dangGui || !doi} onClick={() => void luuNhap()}>Lưu nháp</button>
            <button className="btn btn-chinh" disabled={dangGui} onClick={() => setHoi('GUI')}>Gửi xác nhận</button>
          </div>
        </div>
      )}

      <ConfirmDialog
        mo={hoi === 'GUI'}
        tieuDe="Gửi kế hoạch học tập để xác nhận?"
        nhanXacNhan="Gửi xác nhận"
        dangXuLy={dangGui}
        onXacNhan={() => void guiXacNhan()}
        onHuy={() => setHoi(null)}
      >
        <p>Cán bộ ĐVHD và GVHD nhận thông báo để xác nhận. Sau khi gửi, bạn không sửa được nữa trừ khi GVHD mở lại.</p>
        {han.quaHan && <p className="text-vang">Đã quá hạn nộp {ngay(kh.hanNop)}: kế hoạch sẽ bị gắn nhãn Nộp muộn (BR-06.3).</p>}
        {soDongDu < kh.cacMuc.length && (
          <p className="text-vang">Còn {kh.cacMuc.length - soDongDu} dòng chưa đủ ba nội dung — hệ thống sẽ không nhận.</p>
        )}
      </ConfirmDialog>
      <ConfirmDialog
        mo={hoi === 'XAC_NHAN'}
        tieuDe="Xác nhận kế hoạch học tập?"
        nhanXacNhan="Xác nhận"
        dangXuLy={dangGui}
        onXacNhan={() => void xacNhan()}
        onHuy={() => setHoi(null)}
      >
        <p>
          Bạn xác nhận kế hoạch của <b>{hoSo.sinhVien.hoTen}</b> với vai trò {laCanBo ? 'cán bộ ĐVHD' : 'GVHD'}.
          Khi có đủ xác nhận của cán bộ ĐVHD và GVHD, kế hoạch bị khóa và được ghi nhận là minh chứng.
        </p>
      </ConfirmDialog>
      <ConfirmDialog
        mo={hoi === 'MO_LAI'}
        tieuDe="Mở lại kế hoạch cho sinh viên sửa?"
        nhanXacNhan="Mở lại"
        nguyHiem
        dangXuLy={dangGui}
        onXacNhan={() => void moLai()}
        onHuy={() => setHoi(null)}
      >
        <p>
          Kế hoạch trở về Bản nháp và <b>mất cả hai xác nhận</b>; sinh viên sửa xong phải gửi lại để ĐVHD và GVHD xác nhận
          lần nữa (BR-06.4). Thao tác được ghi nhật ký, sinh viên nhận thông báo.
        </p>
      </ConfirmDialog>
    </div>
  );
}
