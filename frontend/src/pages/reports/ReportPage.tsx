import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { recordApi } from '../../api/records';
import { reportApi } from '../../api/reports';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import { soNgayTruoc } from '../../utils/lich';
import { luuTep } from '../../utils/taiTep';
import { duoiTep } from '../../utils/tepTaiLen';
import ReportSubmitForm from './ReportSubmitForm';
import type { HoSo, TrangThaiHoSo } from '../../types/record';
import type { BaoCao } from '../../types/report';
import type { Dot } from '../../types/term';

type ThaoTac = 'XAC_NHAN' | 'MO_LAI';

/** Trạng thái trước khi GVHD phê duyệt — chưa tới lúc nộp báo cáo. */
const CHUA_THUC_TAP: TrangThaiHoSo[] = ['NHAP', 'CHO_DVHD', 'CHO_GVHD', 'TU_CHOI'];

/** `/records/:recordId/reports` — đích NT-07 (cán bộ ĐVHD, GVHD) và NT-13 (sinh viên), lối từ ô Báo cáo của SCR-12. */
export function ReportRoute() {
  const id = Number(useParams().recordId);
  return <ReportPage key={id} recordId={id} />;
}

/**
 * SCR-22 — Báo cáo thực tập TTTN-06 (UC11, #89–#93). Sinh viên tích đủ sáu phần rồi nộp pdf / docx (#90); mỗi lần nộp
 * là một phiên bản mới, bản cũ vẫn tải được (#91). Cán bộ ĐVHD xác nhận trước, GVHD sau (#92) — đủ hai ⇒ hồ sơ Chờ đánh
 * giá cuối kỳ; GVHD mở lại cho SV thay tệp (#93, BR-11.4). Mọi quy tắc do backend kiểm. `recordId` trống ⇒ hồ sơ của SV.
 */
export default function ReportPage({ recordId }: { recordId?: number }) {
  const { nguoiDung } = useAuth();
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [dot, setDot] = useState<Dot | null>(null);
  const [ds, setDs] = useState<BaoCao[] | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [loiTaiVe, setLoiTaiVe] = useState<unknown>(null);
  const [dangTaiVe, setDangTaiVe] = useState<number>();
  const [hoi, setHoi] = useState<ThaoTac | null>(null);
  const [loiHoi, setLoiHoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);

  const layHoSo = useCallback(() => (recordId ? recordApi.chiTiet(recordId) : recordApi.cuaToi()), [recordId]);

  useEffect(() => {
    let conHieuLuc = true;
    (async () => {
      const h = await layHoSo();
      const [d, b] = await Promise.all([termApi.chiTiet(h.dot.id), reportApi.danhSach(h.id)]);
      if (!conHieuLuc) return;
      setHoSo(h);
      setDot(d);
      setDs(b);
    })().catch((e) => { if (conHieuLuc) setLoiTai(e); });
    return () => { conHieuLuc = false; };
  }, [layHoSo]);

  /** Xác nhận đủ hai bên hoặc mở lại có thể đổi trạng thái hồ sơ ⇒ nạp lại cả hồ sơ lẫn danh sách. */
  const taiLai = useCallback(async () => {
    const h = await layHoSo();
    const b = await reportApi.danhSach(h.id);
    setHoSo(h);
    setDs(b);
  }, [layHoSo]);

  const laSv = nguoiDung?.vaiTro === 'SINH_VIEN';
  const laCanBo = nguoiDung?.vaiTro === 'CAN_BO_DVHD' && hoSo?.canBoDvhd?.nguoiDungId === nguoiDung.id;
  const laGvhd = nguoiDung?.vaiTro === 'GIANG_VIEN' && hoSo?.gvhd?.nguoiDungId === nguoiDung.id;

  const quayLai = laSv
    ? <Link to="/my-record" className="back-link">← Hồ sơ thực tập của tôi</Link>
    : hoSo && <Link to={`/records/${hoSo.id}`} className="back-link">← Hồ sơ của {hoSo.sinhVien.hoTen}</Link>;
  const moiNhat = ds?.find((b) => b.laMoiNhat) ?? ds?.[0];
  const tieuDe = (
    <>
      {quayLai}
      <div className="page-head">
        <div>
          <h1 className="page-title">Báo cáo thực tập TTTN-06</h1>
          {hoSo && !laSv && <div className="muted small">{hoSo.sinhVien.hoTen} — {hoSo.sinhVien.maSv} · đợt {hoSo.dot.maDot}</div>}
        </div>
        {hoSo && (
          <div className="action-bar-buttons">
            {moiNhat?.nopMuon && <span className="badge badge-do">Nộp muộn {moiNhat.soNgayTre} ngày</span>}
            <StatusBadge value={hoSo.trangThai} labels={NHAN_TRANG_THAI_HO_SO} />
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
            <div className="muted">Báo cáo TTTN-06 được nộp trong thời gian thực tập, sau khi bạn đăng ký và GVHD phê duyệt hồ sơ.</div>
            <Link to="/my-record" className="btn btn-chinh">Đăng ký thực tập</Link>
          </div>
        ) : <ErrorAlert error={loiTai} />}
      </div>
    );
  }
  if (!hoSo || !dot || !ds) return <div>{tieuDe}<Loading /></div>;

  // Cùng mốc với `BaoCaoService.soNgayTre`: đợt chưa đặt hạn nộp báo cáo thì lấy ngày kết thúc thực tập.
  const han = dot.hanNopBaoCao ?? dot.ngayKetThuc;
  const conLai = -soNgayTruoc(han);
  const dangThucTap = hoSo.trangThai === 'DANG_THUC_TAP';
  const coXacNhan = !!moiNhat && (!!moiNhat.xacNhanDvhd || !!moiNhat.xacNhanGvhd);
  const nopDuoc = laSv && dangThucTap && !coXacNhan;
  const canBoXacNhanDuoc = laCanBo && dangThucTap && !!moiNhat && !moiNhat.xacNhanDvhd;
  const gvhdXacNhanDuoc = laGvhd && dangThucTap && !!moiNhat && !moiNhat.xacNhanGvhd;
  const moLaiDuoc = laGvhd && coXacNhan && (dangThucTap || hoSo.trangThai === 'CHO_DANH_GIA');
  const soXacNhan = moiNhat ? Number(!!moiNhat.xacNhanDvhd) + Number(!!moiNhat.xacNhanGvhd) : 0;

  const daNop = (b: BaoCao, message?: string) => {
    setThongBao(`${message ?? 'Đã nộp báo cáo'}: ${b.tenFile} (phiên bản ${b.phienBan}).`);
    setLoiTaiVe(null);
    taiLai().catch(setLoiTai);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const taiVe = async (b: BaoCao) => {
    setDangTaiVe(b.id);
    setLoiTaiVe(null);
    try {
      const { blob, tenTep } = await reportApi.taiVe(b.id, b.tenFile);
      luuTep(blob, tenTep);
    } catch (e) {
      setLoiTaiVe(e);
    } finally {
      setDangTaiVe(undefined);
    }
  };

  const moHoi = (t: ThaoTac) => {
    setLoiHoi(null);
    setThongBao(undefined);
    setHoi(t);
  };
  const thucHien = async () => {
    if (!hoi || !moiNhat) return;
    setDangGui(true);
    setLoiHoi(null);
    try {
      const { message } = hoi === 'XAC_NHAN' ? await reportApi.xacNhan(moiNhat.id) : await reportApi.moLai(moiNhat.id);
      setThongBao(message);
      setHoi(null);
      await taiLai();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setLoiHoi(e);
    } finally {
      setDangGui(false);
    }
  };

  const huongDan = (() => {
    if (CHUA_THUC_TAP.includes(hoSo.trangThai)) {
      return { loai: 'vang', noiDung: laSv
        ? 'Bạn nộp báo cáo khi hồ sơ đã được GVHD phê duyệt (Đang thực tập).'
        : 'Hồ sơ chưa ở giai đoạn thực tập nên sinh viên chưa nộp báo cáo.' };
    }
    if (!dangThucTap && hoSo.trangThai !== 'CHO_DANH_GIA') {
      return { loai: 'vang', noiDung: 'Hồ sơ đã kết thúc hoặc gián đoạn — báo cáo chỉ còn để xem và tải về.' };
    }
    if (!moiNhat) {
      return laSv
        ? { loai: 'xanh-duong', noiDung: 'Tích đủ sáu phần nội dung, chọn tệp pdf hoặc docx rồi bấm Nộp báo cáo. Sau đó cán bộ ĐVHD xác nhận trước, GVHD xác nhận sau.' }
        : { loai: 'xanh-duong', noiDung: 'Sinh viên chưa nộp báo cáo. Bạn sẽ nhận thông báo khi có phiên bản mới.' };
    }
    if (moiNhat.daDuXacNhan) {
      return { loai: 'xanh', noiDung: 'Báo cáo đã đủ xác nhận của cán bộ ĐVHD và GVHD; hồ sơ chờ đánh giá cuối kỳ.'
        + (laSv ? ' Muốn thay tệp, hãy liên hệ GVHD để mở lại (BR-11.4).' : laGvhd ? ' Cần sinh viên thay tệp thì bấm Mở lại (BR-11.4).' : '') };
    }
    if (moiNhat.xacNhanDvhd) {
      return { loai: laSv ? 'vang' : 'xanh-duong', noiDung: `Cán bộ ĐVHD đã xác nhận phiên bản ${moiNhat.phienBan}, chờ GVHD xác nhận đủ điều kiện chấm.`
        + (laSv ? ' Muốn thay tệp, hãy liên hệ GVHD để mở lại (BR-11.4).' : '') };
    }
    return { loai: 'xanh-duong', noiDung: `Phiên bản ${moiNhat.phienBan} chờ cán bộ ĐVHD xác nhận hoàn thành kế hoạch thực tập.`
      + (laSv ? ' Trước khi có xác nhận, bạn vẫn nộp được phiên bản mới — bản cũ vẫn được lưu.' : '') };
  })();

  const buoc = (xong: boolean, hienTai: boolean, so: number, ten: string, chiTiet?: string) => (
    <li className={xong ? 'step-xong' : hienTai ? 'step-hien-tai' : undefined}>
      <span className="step-so">{xong ? '✓' : so}</span>
      <span>{ten}{chiTiet && <span className="bc-buoc-ct">{chiTiet}</span>}</span>
    </li>
  );
  const xacNhanCua = (thoiDiem: string | undefined, ten?: string) =>
    (thoiDiem ? `${ten ? `${ten} · ` : ''}${ngayGio(thoiDiem)}` : ten);

  const nutTaiVe = (b: BaoCao) => (
    <button type="button" className="btn btn-phu btn-nho" disabled={dangTaiVe === b.id} onClick={() => void taiVe(b)}>
      {dangTaiVe === b.id ? 'Đang tải…' : 'Tải về'}
    </button>
  );

  return (
    <div>
      {tieuDe}
      {thongBao && <div className="alert alert-xanh mb" role="status">{thongBao}</div>}
      <div className={`alert alert-${huongDan.loai} mb`}>{huongDan.noiDung}</div>

      <div className="stat-row mb">
        <div className={`stat ${!moiNhat && conLai < 0 && dangThucTap ? 'stat-vang' : ''}`}>
          <b className="stat-chu">{ngay(han)}</b>
          <span>
            hạn nộp báo cáo{!dot.hanNopBaoCao && ' (ngày kết thúc đợt)'}
            {!moiNhat && dangThucTap && (conLai > 0 ? ` · còn ${conLai} ngày` : conLai === 0 ? ' · hôm nay' : ` · đã quá ${-conLai} ngày`)}
          </span>
        </div>
        <div className="stat">
          <b className="stat-chu">{moiNhat ? `Phiên bản ${moiNhat.phienBan}` : 'Chưa nộp'}</b>
          <span>{ds.length ? `${ds.length} lần nộp` : 'chưa có phiên bản nào'}</span>
        </div>
        <div className={`stat ${moiNhat?.daDuXacNhan ? 'stat-xanh-la' : ''}`}>
          <b>{soXacNhan}/2</b><span>xác nhận của ĐVHD, GVHD</span>
        </div>
      </div>

      {moiNhat && (
        <section className="card mb" aria-labelledby="bc-hien-hanh">
          <div className="card-head">
            <h2 id="bc-hien-hanh" className="section-title mt0">Phiên bản hiện hành</h2>
            <span className="muted small">Nộp {ngayGio(moiNhat.ngayNop)}</span>
          </div>
          <div className="bc-tep">
            <div className="mc-ten">
              <span className="mc-duoi" aria-hidden>{duoiTep(moiNhat.tenFile) || '?'}</span>
              <span>
                <b className="mc-ten-tep">{moiNhat.tenFile}</b>
                <span className="muted small"> · phiên bản {moiNhat.phienBan}</span>
                {moiNhat.nopMuon && <span className="badge badge-do bc-muon">Nộp muộn {moiNhat.soNgayTre} ngày</span>}
              </span>
            </div>
            {nutTaiVe(moiNhat)}
          </div>
          <ErrorAlert error={loiTaiVe} />

          <ol className="stepper mt">
            {buoc(!!moiNhat.xacNhanDvhd, !moiNhat.xacNhanDvhd, 1, 'Cán bộ ĐVHD xác nhận hoàn thành kế hoạch',
              xacNhanCua(moiNhat.xacNhanDvhd, hoSo.canBoDvhd?.hoTen))}
            {buoc(!!moiNhat.xacNhanGvhd, !!moiNhat.xacNhanDvhd && !moiNhat.xacNhanGvhd, 2, 'GVHD xác nhận đủ điều kiện chấm',
              xacNhanCua(moiNhat.xacNhanGvhd, hoSo.gvhd?.hoTen))}
            {buoc(moiNhat.daDuXacNhan, false, 3, 'Hồ sơ chờ đánh giá cuối kỳ',
              'Mở điều kiện chấm chặng 2 (Đ10 k2)')}
          </ol>

          {(canBoXacNhanDuoc || gvhdXacNhanDuoc || moLaiDuoc) && (
            <div className="form-actions ngan-tren mt">
              {gvhdXacNhanDuoc && !moiNhat.xacNhanDvhd && (
                <span className="muted small bc-cho">Chờ cán bộ ĐVHD xác nhận trước</span>
              )}
              {moLaiDuoc && (
                <button type="button" className="btn btn-phu" disabled={dangGui} onClick={() => moHoi('MO_LAI')}>
                  Mở lại cho sinh viên thay tệp
                </button>
              )}
              {canBoXacNhanDuoc && (
                <button type="button" className="btn btn-chinh" disabled={dangGui} onClick={() => moHoi('XAC_NHAN')}>
                  Xác nhận hoàn thành kế hoạch thực tập
                </button>
              )}
              {gvhdXacNhanDuoc && (
                <button type="button" className="btn btn-chinh" disabled={dangGui || !moiNhat.xacNhanDvhd}
                        onClick={() => moHoi('XAC_NHAN')}>
                  Xác nhận đủ điều kiện chấm
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {nopDuoc && <ReportSubmitForm hoSoId={hoSo.id} phienBanMoi={(moiNhat?.phienBan ?? 0) + 1} han={han} onDaNop={daNop} />}

      <section aria-labelledby="bc-lich-su">
        <div className="card-head">
          <h2 id="bc-lich-su" className="section-title">Các phiên bản đã nộp ({ds.length})</h2>
        </div>
        {ds.length === 0 ? (
          <div className="card empty">
            <div className="empty-title">Chưa có phiên bản nào</div>
            <div className="muted">{nopDuoc ? 'Dùng mục "Nộp báo cáo" ở trên.' : 'Sinh viên chưa nộp báo cáo.'}</div>
          </div>
        ) : (
          <>
            <p className="muted small mt0">Mỗi lần nộp là một phiên bản mới, không ghi đè bản cũ — vẫn tra được bản nộp lần đầu.</p>
            <div className="table-wrap">
              <table className="table table-giua bc-bang">
                <thead>
                  <tr>
                    <th className="bc-pb">Phiên bản</th>
                    <th>Tệp</th>
                    <th className="bc-ngay">Nộp lúc</th>
                    <th className="bc-xn">Xác nhận ĐVHD</th>
                    <th className="bc-xn">Xác nhận GVHD</th>
                    <th className="actions" aria-label="Thao tác" />
                  </tr>
                </thead>
                <tbody>
                  {ds.map((b) => (
                    <tr key={b.id} className={b.laMoiNhat ? undefined : 'bc-cu'}>
                      <td className="bc-pb">
                        <b>{b.phienBan}</b>
                        {b.laMoiNhat && <span className="badge badge-xanh-duong bc-hh">Hiện hành</span>}
                      </td>
                      <td><span className="mc-ten-tep">{b.tenFile}</span></td>
                      <td className="bc-ngay">
                        {ngayGio(b.ngayNop)}
                        {b.nopMuon && <div><span className="badge badge-do">Muộn {b.soNgayTre} ngày</span></div>}
                      </td>
                      <td className="bc-xn">
                        <span className="bc-nhan-xn">ĐVHD: </span>
                        {b.xacNhanDvhd ? <span className="ck-dat">✓ {ngayGio(b.xacNhanDvhd)}</span> : <span className="muted">—</span>}
                      </td>
                      <td className="bc-xn">
                        <span className="bc-nhan-xn">GVHD: </span>
                        {b.xacNhanGvhd ? <span className="ck-dat">✓ {ngayGio(b.xacNhanGvhd)}</span> : <span className="muted">—</span>}
                      </td>
                      <td className="actions">{nutTaiVe(b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <ConfirmDialog
        mo={hoi === 'XAC_NHAN'}
        tieuDe={laCanBo ? 'Xác nhận hoàn thành kế hoạch thực tập?' : 'Xác nhận báo cáo đủ điều kiện chấm?'}
        nhanXacNhan="Xác nhận"
        dangXuLy={dangGui}
        onXacNhan={() => void thucHien()}
        onHuy={() => setHoi(null)}
      >
        {moiNhat && (
          <>
            {/* Lời xác nhận lấy từ mục IV mẫu TTTN-06. */}
            <p>
              {laCanBo
                ? <>Tôi xác nhận sinh viên <b>{hoSo.sinhVien.hoTen}</b> đã hoàn thành đúng kế hoạch thực tập, tuân thủ quy định và có kết quả đạt yêu cầu.</>
                : <>Tôi xác nhận báo cáo của <b>{hoSo.sinhVien.hoTen}</b> đạt yêu cầu, đủ điều kiện nộp và chấm điểm học phần.</>}
            </p>
            <p className="muted small">
              Áp dụng cho phiên bản {moiNhat.phienBan} — {moiNhat.tenFile}.{' '}
              {laCanBo
                ? 'GVHD xác nhận sau bạn.'
                : 'Đủ hai xác nhận, hồ sơ chuyển Chờ đánh giá cuối kỳ và mở điều kiện chấm chặng 2 (Điều 10 khoản 2).'}
            </p>
            <ErrorAlert error={loiHoi} />
          </>
        )}
      </ConfirmDialog>
      <ConfirmDialog
        mo={hoi === 'MO_LAI'}
        tieuDe="Mở lại báo cáo cho sinh viên thay tệp?"
        nhanXacNhan="Mở lại"
        nguyHiem
        dangXuLy={dangGui}
        onXacNhan={() => void thucHien()}
        onHuy={() => setHoi(null)}
      >
        {moiNhat && (
          <>
            <p>
              Phiên bản {moiNhat.phienBan} <b>mất cả hai xác nhận</b>; sinh viên nộp phiên bản mới rồi cán bộ ĐVHD và GVHD xác nhận
              lại (BR-11.4). Thao tác được ghi nhật ký, sinh viên nhận thông báo.
            </p>
            {hoSo.trangThai === 'CHO_DANH_GIA' && (
              <p className="text-vang">
                Hồ sơ đang Chờ đánh giá cuối kỳ sẽ quay về Đang thực tập. Không mở lại được nếu Tổ đánh giá đã nộp phiếu cuối kỳ.
              </p>
            )}
            <ErrorAlert error={loiHoi} />
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
