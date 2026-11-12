import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { recordApi } from '../../api/records';
import { termApi } from '../../api/terms';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import type { HoSo } from '../../types/record';
import type { Dot } from '../../types/term';
import RecordSummary from './RecordSummary';
import RegistrationForm from './RegistrationForm';
import { VONG_DOI_HO_SO, viTriVongDoi } from './vongDoi';

interface DuLieu {
  hoSo: HoSo | null;
  /** Đợt của hồ sơ, hoặc đợt đang nhận đăng ký khi lập phiếu mới. */
  dot: Dot | null;
  dsDotMo: Dot[];
  /** Hồ sơ ở đợt đã kết thúc, khi đang lập phiếu cho đợt mới. */
  hoSoCu: HoSo | null;
  /** Tăng mỗi lần tải từ backend xong — form dựng lại theo dữ liệu mới, còn lưu nháp tại chỗ thì không. */
  phien: number;
}

const DOT_DANG_CHAY = ['DANG_NHAN_DANG_KY', 'DANG_THUC_HIEN'];

async function taiDuLieu(recordId?: number): Promise<Omit<DuLieu, 'phien'>> {
  const hoSo = recordId
    ? await recordApi.chiTiet(recordId)
    : await recordApi.cuaToi().catch((e) => {
      if (e instanceof ApiError && e.code === 'RESOURCE_NOT_FOUND') return null;
      throw e;
    });
  const [dotHoSo, dsDotMo] = await Promise.all([
    hoSo ? termApi.chiTiet(hoSo.dot.id) : Promise.resolve(null),
    recordId ? Promise.resolve([] as Dot[]) : termApi.danhSach({ status: 'DANG_NHAN_DANG_KY' }),
  ]);
  // #40 trả hồ sơ đợt đang chạy, không có thì hồ sơ gần nhất — hồ sơ đợt cũ đã kết thúc không chặn đăng ký đợt mới.
  if (hoSo && (recordId || DOT_DANG_CHAY.includes(dotHoSo!.trangThai) || dsDotMo.length === 0)) {
    return { hoSo, dot: dotHoSo, dsDotMo, hoSoCu: null };
  }
  return { hoSo: null, dot: dsDotMo[0] ?? null, dsDotMo, hoSoCu: hoSo };
}

/**
 * SCR-11 — Đăng ký thực tập (UC04). Bản nháp (hoặc bị trả về) ⇒ phiếu TTTN-01 sửa được; đã gửi ⇒ xem phiếu,
 * trạng thái và việc tiếp theo. `recordId` có khi mở từ thông báo NT-02/05/06 (`/records/{id}`).
 */
export default function MyRecordPage({ recordId }: { recordId?: number }) {
  const [du, setDu] = useState<DuLieu | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [lanTai, setLanTai] = useState(0);
  const [thongBao, setThongBao] = useState<{ loai: 'xanh' | 'vang'; noiDung: string } | null>(null);

  useEffect(() => {
    let conHieuLuc = true;
    setLoi(null);
    taiDuLieu(recordId)
      .then((x) => { if (conHieuLuc) setDu((cu) => ({ ...x, phien: (cu?.phien ?? 0) + 1 })); })
      .catch((e) => { if (conHieuLuc) setLoi(e); });
    return () => { conHieuLuc = false; };
  }, [recordId, lanTai]);

  const tieuDe = (
    <div className="page-head">
      <div>
        <h1 className="page-title">Đăng ký thực tập</h1>
        <div className="muted small">Phiếu đăng ký TTTN-01</div>
      </div>
      {du?.hoSo && <StatusBadge value={du.hoSo.trangThai} labels={NHAN_TRANG_THAI_HO_SO} />}
    </div>
  );

  if (!du) return <div>{tieuDe}{loi ? <ErrorAlert error={loi} /> : <Loading />}</div>;

  const { hoSo, dot, dsDotMo, hoSoCu } = du;
  const suaDuoc = !hoSo || hoSo.trangThai === 'NHAP';
  const viTri = hoSo ? viTriVongDoi(hoSo.trangThai) : 0;

  const capNhatHoSo = (h: HoSo) => setDu((x) => (x ? { ...x, hoSo: h } : x));

  return (
    <div>
      {tieuDe}
      <ErrorAlert error={loi} />
      {thongBao && <div className={`alert alert-${thongBao.loai} mb`} role="status">{thongBao.noiDung}</div>}

      {!dot ? (
        <div className="card empty">
          <div className="empty-title">Hiện chưa có đợt thực tập nào mở đăng ký</div>
          <div className="muted">Khi Khoa mở đợt mới, bạn lập phiếu đăng ký TTTN-01 tại đây.</div>
        </div>
      ) : (
        <>
          {hoSoCu && (
            <p className="hint mb">
              Hồ sơ đợt {hoSoCu.dot.maDot} của bạn ({NHAN_TRANG_THAI_HO_SO[hoSoCu.trangThai]}) vẫn xem được{' '}
              <Link to={`/records/${hoSoCu.id}`}>tại đây</Link>.
            </p>
          )}
          {hoSo && viTri >= 0 && (
            <div className="card mb">
              <ol className="stepper">
                {VONG_DOI_HO_SO.map((b, i) => (
                  <li key={b.nhan} className={i < viTri ? 'step-xong' : i === viTri ? 'step-hien-tai' : ''}>
                    <span className="step-so">{i + 1}</span>
                    {b.ma.includes(hoSo.trangThai) ? NHAN_TRANG_THAI_HO_SO[hoSo.trangThai] : b.nhan}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {hoSo?.trangThai === 'NHAP' && hoSo.lyDoTuChoi && (
            <div className="alert alert-vang mb" role="alert">
              Hồ sơ bị trả về: {hoSo.lyDoTuChoi}. Sửa thông tin cần thiết rồi gửi lại.
            </div>
          )}

          {suaDuoc ? (
            <RegistrationForm
              // Lưu nháp lần đầu không dựng lại form (giữ ô cam kết, lỗi đang hiện); tải lại vì CBR-01 thì dựng lại theo hồ sơ thật.
              key={`dot-${dot.id}-${du.phien}`}
              hoSo={hoSo ?? undefined}
              dot={dot}
              dsDot={dsDotMo}
              onDoiDot={(id) => setDu((x) => (x ? { ...x, dot: x.dsDotMo.find((d) => d.id === id) ?? x.dot } : x))}
              onDaLuu={(h) => { setThongBao(null); capNhatHoSo(h); }}
              onDaGui={(h, msg) => {
                capNhatHoSo(h);
                setThongBao({ loai: 'xanh', noiDung: msg ?? 'Đã gửi đăng ký, chờ ĐVHD xác nhận' });
                window.scrollTo({ top: 0 });
              }}
              onDaCoHoSo={(msg) => {
                setThongBao({ loai: 'vang', noiDung: msg });
                setLanTai((n) => n + 1);
              }}
            />
          ) : (
            hoSo && <RecordSummary hoSo={hoSo} dot={dot} />
          )}
        </>
      )}
    </div>
  );
}
