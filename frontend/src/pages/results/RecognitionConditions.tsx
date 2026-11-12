import { NHAN_CHUONG_TRINH } from '../../utils/constants';
import { diem } from '../../utils/format';
import type { BangTongHop } from '../../types/result';

interface DieuKien {
  ma: 'a' | 'b' | 'c' | 'd';
  ten: string;
  /** Diễn giải khi đạt, lấy từ số liệu backend trả về. */
  khiDat: string;
}

/**
 * Bốn điều kiện công nhận hoàn thành — đúng bốn điểm a, b, c, d của Điều 15 khoản 3. Kết luận và lý do do backend
 * xét (ScoringService.xetCongNhanHoanThanh); mỗi lý do mở đầu bằng "(a)"…"(d)" nên giao diện chỉ việc ghép đúng dòng.
 */
export default function RecognitionConditions({ bang }: { bang: BangTongHop }) {
  const clo = (ma: string) => bang.cacClo.find((d) => d.maClo === ma);
  const mucCua = (ma: string) => {
    const m = clo(ma)?.muc;
    return m == null ? `${ma} —` : `${ma} Mức ${m}`;
  };
  const chuongTrinh = NHAN_CHUONG_TRINH[bang.thongTin.chuongTrinh] ?? bang.thongTin.chuongTrinh;

  const dieuKien: DieuKien[] = [
    { ma: 'a', ten: 'Có đủ kết quả đánh giá của cả hai chặng', khiDat: 'Đủ phiếu đã nộp của hai chặng' },
    { ma: 'b', ten: `CLO1 và CLO2 đạt mức tối thiểu của chương trình ${chuongTrinh}`, khiDat: `${mucCua('CLO1')} · ${mucCua('CLO2')}` },
    { ma: 'c', ten: 'Điểm học phần không dưới Mức 1', khiDat: `HP ${diem(bang.diemHp)} — Mức ${bang.mucHp ?? '—'}` },
    { ma: 'd', ten: 'Đủ minh chứng bắt buộc theo hình thức thực tập', khiDat: 'Đủ theo bảng đối chiếu minh chứng' },
  ];

  const lyDo = (ma: string) => bang.lyDoKhongDat.find((x) => x.startsWith(`(${ma})`));
  const lyDoKhac = bang.lyDoKhongDat.filter((x) => !/^\([a-d]\)/.test(x));
  const daXet = bang.ketLuan !== null;

  return (
    <>
      <ul className="dieu-kien">
        {dieuKien.map((d) => {
          const truot = lyDo(d.ma);
          const lop = !daXet ? 'dk-chua' : truot ? 'dk-truot' : 'dk-dat';
          return (
            <li key={d.ma} className={lop}>
              <span className="dk-dau" aria-hidden>{!daXet ? '…' : truot ? '✗' : '✓'}</span>
              <div>
                <div><b>({d.ma})</b> {d.ten} <span className="muted small">— Điều 15 khoản 3 điểm {d.ma}</span></div>
                <div className="small">
                  {!daXet ? <span className="muted">Chưa xét</span>
                    : truot ? <span className="text-do">{truot.replace(/^\([a-d]\)\s*/, '')}</span>
                      : <span className="muted">{d.khiDat}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {lyDoKhac.length > 0 && (
        <ul className="alert-list text-do small">{lyDoKhac.map((x) => <li key={x}>{x}</li>)}</ul>
      )}
    </>
  );
}
