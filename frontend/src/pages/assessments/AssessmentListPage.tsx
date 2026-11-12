import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assessmentApi } from '../../api/assessments';
import { panelApi } from '../../api/panels';
import { recordApi } from '../../api/records';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import {
  NHAN_NHOM_NGUOI_CHAM, NHAN_TRANG_THAI_CHANG, NHAN_TRANG_THAI_HO_SO, NHAN_TRANG_THAI_PHIEU,
} from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import type { NhomNguoiCham, Phieu } from '../../types/assessment';
import type { TrangThaiHoSo } from '../../types/record';
import type { Chang } from '../../types/term';
import AssessmentOversight from './AssessmentOversight';
import TermSelect, { useTermPicker } from '../../components/TermSelect';

/** Hồ sơ đã qua phê duyệt mới có chặng giữa kỳ để chấm (Đ10 k2). */
const CO_THE_CHAM_CHANG_1: TrangThaiHoSo[] = ['DANG_THUC_TAP', 'CHO_DANH_GIA', 'HOAN_THANH', 'KHONG_HOAN_THANH', 'GIAN_DOAN'];

interface Dong {
  hoSoId: number;
  maSv: string;
  hoTen: string;
  lop?: string;
  trangThai: TrangThaiHoSo;
  /** Chặng 2: nhóm trong tổ, tổ nào, có vắng mặt không. */
  nhom?: NhomNguoiCham;
  to?: { id: number; thoiGian?: string; diaDiem?: string };
  vangMat?: boolean;
}

/** SCR-18 / SCR-20 — giáo vụ thấy màn giám sát; người chấm thấy danh sách sinh viên mình chấm. */
export default function AssessmentListPage() {
  const { nguoiDung } = useAuth();
  return nguoiDung?.vaiTro === 'ADMIN' ? <AssessmentOversight /> : <MyGradingList />;
}

/**
 * Danh sách chấm của GV / cán bộ ĐVHD: chặng 1 — SV mình hướng dẫn (#39); chặng 2 — SV của Tổ mình tham gia
 * (#77, UC09). Ghép phiếu của chính mình (#69) để biết đã chấm tới đâu.
 */
function MyGradingList() {
  const { nguoiDung } = useAuth();
  const { dsDot, termId, setTermId, loi: loiDot } = useTermPicker();
  const [stage, setStage] = useState(1);
  const [chang, setChang] = useState<Chang[]>([]);
  const [dong, setDong] = useState<Dong[] | null>(null);
  const [phieu, setPhieu] = useState<Record<number, Phieu>>({});
  const [loi, setLoi] = useState<unknown>(null);

  useEffect(() => {
    if (!termId || !nguoiDung) return;
    setDong(null);
    setLoi(null);
    // Đổi tab / đợt nhanh: bỏ kết quả của lần tải cũ để không hiện lẫn SV chặng 1 vào tab chặng 2.
    let conHieuLuc = true;
    (async () => {
      const [c, ds] = await Promise.all([termApi.danhSachChang(termId), assessmentApi.danhSach({ termId, stage })]);
      const hs = stage === 1 ? await recordApi.danhSach({ termId }) : [];
      const cacTo = stage === 2 ? await panelApi.danhSach(termId) : [];
      if (!conHieuLuc) return;
      setChang(c);
      setPhieu(Object.fromEntries(ds.map((p) => [p.hoSoId, p])));
      if (stage === 1) {
        setDong(hs.filter((h) => CO_THE_CHAM_CHANG_1.includes(h.trangThai)).map((h) => ({
          hoSoId: h.id, maSv: h.sinhVien.maSv, hoTen: h.sinhVien.hoTen, lop: h.sinhVien.lop, trangThai: h.trangThai,
        })));
      } else {
        setDong(cacTo.flatMap((t) => {
          const toi = t.thanhViens.find((tv) => tv.nguoiDungId === nguoiDung.id);
          if (!toi) return [];
          return t.hoSos.map((h) => ({
            ...h, nhom: toi.nhom, vangMat: toi.vangMat, to: { id: t.id, thoiGian: t.thoiGianBaoCao, diaDiem: t.diaDiem },
          }));
        }));
      }
    })().catch((e) => { if (conHieuLuc) { setLoi(e); setDong([]); } });
    return () => { conHieuLuc = false; };
  }, [termId, stage, nguoiDung]);

  const changHienTai = chang.find((c) => c.thuTu === stage);
  const daNop = dong?.filter((d) => phieu[d.hoSoId]?.trangThai === 'DA_NOP').length ?? 0;

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Phiếu đánh giá</h1>
      </div>
      <ErrorAlert error={loiDot} />
      <div className="toolbar">
        <TermSelect dsDot={dsDot} termId={termId} onChange={setTermId} />
      </div>

      <div className="tabs">
        {[1, 2].map((s) => {
          const c = chang.find((x) => x.thuTu === s);
          return (
            <button key={s} className={`tab ${stage === s ? 'tab-active' : ''}`} onClick={() => setStage(s)}>
              {s === 1 ? 'Chặng 1 — giữa kỳ (TTTN-04)' : 'Chặng 2 — cuối kỳ (TTTN-05)'}
              {c && <> <StatusBadge value={c.trangThai} labels={NHAN_TRANG_THAI_CHANG} /></>}
            </button>
          );
        })}
      </div>
      {changHienTai && (
        <p className="hint mb">
          {changHienTai.ten}: {NHAN_TRANG_THAI_CHANG[changHienTai.trangThai].toLowerCase()}
          {changHienTai.ngayMo && <>, mở từ {ngay(changHienTai.ngayMo)}</>}
          {changHienTai.ngayDong && <>, đóng {ngay(changHienTai.ngayDong)}</>}.{' '}
          {stage === 1
            ? 'Chấm sinh viên bạn hướng dẫn: GVHD theo phân công, cán bộ ĐVHD theo hồ sơ tiếp nhận.'
            : 'Chấm sinh viên của Tổ đánh giá bạn tham gia; chỉ chấm được khi báo cáo TTTN-06 đã đủ hai xác nhận.'}
          {dong && dong.length > 0 && <> Đã nộp {daNop}/{dong.length} phiếu.</>}
        </p>
      )}

      <ErrorAlert error={loi} />
      {!termId ? null : !dong ? <Loading /> : dong.length === 0 ? (
        <div className="card empty">
          <div className="muted">
            {stage === 1 ? 'Chưa có sinh viên nào cần chấm ở chặng này.' : 'Bạn chưa thuộc Tổ đánh giá nào của đợt này.'}
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table table-giua">
            <thead>
              <tr>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Hồ sơ</th>
                {stage === 2 && <th>Tổ · nhóm của bạn</th>}
                <th>Phiếu của bạn</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {dong.map((d) => {
                const p = phieu[d.hoSoId];
                const nhanNut = !p ? 'Chấm' : p.trangThai === 'DA_NOP' ? 'Xem' : p.trangThai === 'MO_LAI' ? 'Sửa phiếu' : 'Tiếp tục';
                return (
                  <tr key={d.hoSoId}>
                    <td className="nowrap">{d.maSv}</td>
                    <td>{d.hoTen}</td>
                    <td className="nowrap">{d.lop ?? '—'}</td>
                    <td><StatusBadge value={d.trangThai} labels={NHAN_TRANG_THAI_HO_SO} /></td>
                    {stage === 2 && (
                      <td className="small">
                        Tổ #{d.to?.id}{d.nhom && <> · {NHAN_NHOM_NGUOI_CHAM[d.nhom]}</>}
                        {d.to?.thoiGian && <div className="muted">{ngayGio(d.to.thoiGian)}{d.to.diaDiem && ` · ${d.to.diaDiem}`}</div>}
                      </td>
                    )}
                    <td>
                      {p ? <StatusBadge value={p.trangThai} labels={NHAN_TRANG_THAI_PHIEU} /> : <span className="muted">Chưa chấm</span>}
                      {p?.ngayNop && <div className="muted small">{ngayGio(p.ngayNop)}</div>}
                    </td>
                    <td className="actions">
                      {d.vangMat ? (
                        <span className="muted small" title="Thành viên vắng mặt bị loại khỏi phép tính (CBR-15)">Vắng mặt</span>
                      ) : (
                        <Link className={`btn btn-nho ${!p || p.trangThai !== 'DA_NOP' ? 'btn-chinh' : 'btn-phu'}`}
                              to={`/assessments/form?recordId=${d.hoSoId}&stage=${stage}`}>
                          {nhanNut}
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
