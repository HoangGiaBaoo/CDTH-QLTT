import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationApi } from '../api/notifications';
import type { ThongBao } from '../types/notification';
import { ngayGio } from '../utils/format';
import ErrorAlert from './ErrorAlert';

/** Chu kỳ hỏi lại số chưa đọc — đủ để người demo thấy thông báo mới mà không phải tải lại trang. */
const CHU_KY_MS = 30_000;
const MOI_TRANG = 10;

/** "Vừa xong", "5 phút trước", "3 giờ trước"; cũ hơn một ngày thì ghi ngày giờ đầy đủ. */
function thoiGian(iso: string): string {
  const phut = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (Number.isNaN(phut)) return iso;
  if (phut < 1) return 'Vừa xong';
  if (phut < 60) return `${phut} phút trước`;
  if (phut < 24 * 60) return `${Math.floor(phut / 60)} giờ trước`;
  return ngayGio(iso);
}

/**
 * Chuông thông báo trên thanh trên (#101, #102): số chưa đọc, danh sách gần nhất, bấm một thông báo ⇒ đánh dấu đã
 * đọc và mở màn liên quan (đường dẫn backend gửi kèm).
 */
export default function NotificationBell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [soChuaDoc, setSoChuaDoc] = useState(0);
  const [mo, setMo] = useState(false);
  const [chiChuaDoc, setChiChuaDoc] = useState(false);
  const [ds, setDs] = useState<ThongBao[] | null>(null);
  const [tong, setTong] = useState(0);
  const [trang, setTrang] = useState(0);
  const [loi, setLoi] = useState<unknown>(null);
  const khung = useRef<HTMLDivElement>(null);

  const demChuaDoc = useCallback(async () => {
    try {
      setSoChuaDoc((await notificationApi.danhSach({ unread: true, size: 1 })).total);
    } catch {
      // Lỗi mạng tạm thời: giữ số cũ, lần hỏi sau sẽ cập nhật.
    }
  }, []);

  // Đếm lại khi chuyển màn (thao tác vừa xong có thể sinh thông báo) và theo chu kỳ.
  useEffect(() => { void demChuaDoc(); }, [demChuaDoc, location.pathname]);
  useEffect(() => {
    const t = window.setInterval(() => { if (!document.hidden) void demChuaDoc(); }, CHU_KY_MS);
    return () => window.clearInterval(t);
  }, [demChuaDoc]);

  const taiTrang = useCallback(async (p: number, noi: boolean) => {
    setLoi(null);
    try {
      const kq = await notificationApi.danhSach({ unread: chiChuaDoc || undefined, page: p, size: MOI_TRANG });
      setDs((cu) => (noi && cu ? [...cu, ...kq.items] : kq.items));
      setTong(kq.total);
      setTrang(p);
    } catch (e) {
      setLoi(e);
      setDs((cu) => cu ?? []);
    }
  }, [chiChuaDoc]);

  useEffect(() => {
    if (mo) void taiTrang(0, false);
  }, [mo, taiTrang]);

  // Bấm ra ngoài hoặc Esc để đóng.
  useEffect(() => {
    if (!mo) return;
    const bam = (e: MouseEvent) => { if (khung.current && !khung.current.contains(e.target as Node)) setMo(false); };
    const phim = (e: KeyboardEvent) => { if (e.key === 'Escape') setMo(false); };
    document.addEventListener('mousedown', bam);
    window.addEventListener('keydown', phim);
    return () => {
      document.removeEventListener('mousedown', bam);
      window.removeEventListener('keydown', phim);
    };
  }, [mo]);

  const moThongBao = async (t: ThongBao) => {
    if (!t.daDoc) {
      try {
        await notificationApi.daDoc(t.id);
        setDs((cu) => cu?.map((x) => (x.id === t.id ? { ...x, daDoc: true } : x)) ?? null);
        setSoChuaDoc((n) => Math.max(0, n - 1));
      } catch (e) {
        setLoi(e);
        return;
      }
    }
    if (t.duongDan) {
      setMo(false);
      navigate(t.duongDan);
    }
  };

  const nhanSo = soChuaDoc > 99 ? '99+' : String(soChuaDoc);

  return (
    <div className="tb-khung" ref={khung}>
      <button type="button" className="tb-nut" onClick={() => setMo((x) => !x)} aria-expanded={mo}
              aria-label={soChuaDoc ? `Thông báo, ${soChuaDoc} chưa đọc` : 'Thông báo'}>
        <Bell size={21} aria-hidden="true" />
        {soChuaDoc > 0 && <span className="tb-so" aria-hidden="true">{nhanSo}</span>}
      </button>

      {mo && (
        <div className="tb-bang" role="region" aria-label="Danh sách thông báo">
          <div className="tb-dau">
            <b>Thông báo</b>
            <div className="tb-loc">
              <button type="button" className={!chiChuaDoc ? 'tb-loc-chon' : undefined} onClick={() => setChiChuaDoc(false)}>
                Tất cả
              </button>
              <button type="button" className={chiChuaDoc ? 'tb-loc-chon' : undefined} onClick={() => setChiChuaDoc(true)}>
                Chưa đọc{soChuaDoc > 0 && ` (${nhanSo})`}
              </button>
            </div>
          </div>
          <ErrorAlert error={loi} />
          {!ds ? (
            <div className="tb-trong">Đang tải…</div>
          ) : ds.length === 0 ? (
            <div className="tb-trong">{chiChuaDoc ? 'Không có thông báo chưa đọc.' : 'Chưa có thông báo nào.'}</div>
          ) : (
            <ul className="tb-ds">
              {ds.map((t) => (
                <li key={t.id}>
                  <button type="button" className={`tb-muc${t.daDoc ? '' : ' tb-moi'}`} onClick={() => void moThongBao(t)}>
                    <span className="tb-cham" aria-hidden="true" />
                    <span className="tb-than">
                      <span className="tb-noi-dung">{t.noiDung}</span>
                      <span className="tb-gio">
                        {thoiGian(t.ngayTao)}{!t.daDoc && <span className="sr-only"> · chưa đọc</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {ds && ds.length < tong && (
            <div className="tb-cuoi">
              <button type="button" className="btn btn-phu btn-nho" onClick={() => void taiTrang(trang + 1, true)}>
                Xem thêm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
