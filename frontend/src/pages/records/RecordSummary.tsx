import { Link } from 'react-router-dom';
import type { HoSo } from '../../types/record';
import type { Dot } from '../../types/term';
import RecordInfo from './RecordInfo';
import RequiredEvidence from './RequiredEvidence';
import { daDuocDuyet, viecTiepTheo } from './vongDoi';

/** Lối tắt sang các màn của sinh viên khi hồ sơ đã được duyệt (đường dẫn khớp menu.ts). */
const LOI_TAT: { path: string; nhan: string; moTa: string; khi: (h: HoSo) => boolean }[] = [
  { path: '/my-record/plan', nhan: 'Kế hoạch học tập', moTa: 'Lập kế hoạch TTTN-02 theo tuần', khi: () => true },
  { path: '/my-record/logbook', nhan: 'Nhật ký thực tập', moTa: 'Ghi việc làm hằng ngày', khi: () => true },
  { path: '/my-record/progress', nhan: 'Tiến độ tuần', moTa: 'Tự đánh giá tiến độ từng tuần', khi: () => true },
  { path: '/my-record/evidence', nhan: 'Minh chứng', moTa: 'Tải tệp, đối chiếu Đủ / Thiếu', khi: () => true },
  { path: '/my-record/report', nhan: 'Báo cáo TTTN-06', moTa: 'Nộp báo cáo thực tập', khi: () => true },
  {
    path: '/my-record/feedback', nhan: 'Phản hồi 08b', moTa: 'Đánh giá chất lượng, tự đánh giá CLO',
    khi: (h) => ['CHO_DANH_GIA', 'HOAN_THANH', 'KHONG_HOAN_THANH'].includes(h.trangThai),
  },
  {
    path: '/my-result', nhan: 'Kết quả của tôi', moTa: 'Điểm 7 CLO và điều kiện công nhận',
    khi: (h) => h.trangThai === 'HOAN_THANH' || h.trangThai === 'KHONG_HOAN_THANH',
  },
];

/** SCR-11 khi hồ sơ đã gửi: chỉ xem phiếu TTTN-01, việc tiếp theo và danh mục minh chứng. */
export default function RecordSummary({ hoSo, dot }: { hoSo: HoSo; dot: Dot }) {
  const viec = viecTiepTheo(hoSo);
  const duyet = daDuocDuyet(hoSo.trangThai);

  return (
    <>
      {viec && (
        <div className={`alert ${hoSo.trangThai === 'GIAN_DOAN' ? 'alert-vang' : 'alert-xanh'} mb`} role="status">{viec}</div>
      )}

      <RecordInfo hoSo={hoSo} dot={dot} />

      <div className="card mb">
        <RequiredEvidence recordId={hoSo.id} hinhThucDaLuu={hoSo.hinhThucThucTap} hienTrangThai={duyet} />
      </div>

      {duyet && (
        <div className="tile-grid">
          {LOI_TAT.filter((l) => l.khi(hoSo)).map((l) => (
            <Link key={l.path} to={l.path} className="tile">
              <div className="tile-title">{l.nhan}</div>
              <div className="tile-desc">{l.moTa}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
