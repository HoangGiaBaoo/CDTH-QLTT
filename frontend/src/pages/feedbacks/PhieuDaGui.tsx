import { useEffect, useState } from 'react';
import { ApiError } from '../../api/client';
import { feedbackApi } from '../../api/feedbacks';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import { diem, ngayGio, so2 } from '../../utils/format';
import { CAU_TU_LUAN_08B, MUC_DAT, MUC_HAI_LONG, nhanMuc } from './bieuMau';
import type { PhanHoi, TuNhanThuc } from '../../types/feedback';

const giaTri = (s?: string | null) => (s?.trim() ? <span className="pre-line">{s}</span> : <span className="muted">—</span>);
const oMuc = (muc: number | null | undefined, ds: { muc: number; nhan: string }[]) => (
  <div className="ph-muc-xem"><b>{muc ?? '—'}</b> <span className="muted small">{nhanMuc(ds, muc)}</span></div>
);

/** TTTN-08a đã gửi — chỉ đọc. */
export function Xem08a({ p }: { p: PhanHoi }) {
  return (
    <section className="card mb" aria-labelledby={`ph-xem-${p.id}`}>
      <h2 id={`ph-xem-${p.id}`} className="the-tieu-de">Phiếu TTTN-08a — Phản hồi của Đơn vị hướng dẫn</h2>
      <p className="muted small mt0">Cán bộ hướng dẫn {p.nguoiGui ?? ''} gửi lúc {ngayGio(p.ngayGui)}</p>
      <h3 className="tieu-de-nho">1. Mức độ đáp ứng về năng lực và thái độ làm việc</h3>
      {(p.phieu08a?.tieuChi ?? []).map((t) => (
        <div key={t.stt} className="ph-dong">
          <div className="ph-noi-dung"><span className="ph-stt">{t.stt}.</span> {t.noiDung}</div>
          {oMuc(t.muc, MUC_DAT)}
          <div className="ph-ghi-chu">{giaTri(t.nhanXet)}</div>
        </div>
      ))}
      <h3 className="tieu-de-nho">2. Ý kiến bổ sung của Đơn vị hướng dẫn</h3>
      <p className="mt0">{giaTri(p.yKienMo)}</p>
    </section>
  );
}

/**
 * TTTN-08b đã gửi — chỉ đọc. Người xem không phải chính sinh viên thì backend không trả phần A và phản hồi mở
 * (thống kê ẩn danh) ⇒ hiện một dòng giải thích thay cho phần đó.
 */
export function Xem08b({ p }: { p: PhanHoi }) {
  const b = p.phieu08b;
  const coPhanA = !!b?.chatLuong;
  return (
    <section className="card mb" aria-labelledby={`ph-xem-${p.id}`}>
      <h2 id={`ph-xem-${p.id}`} className="the-tieu-de">Phiếu TTTN-08b — Phản hồi của sinh viên</h2>
      <p className="muted small mt0">{p.nguoiGui ?? 'Sinh viên'} gửi lúc {ngayGio(p.ngayGui)}</p>

      <h3 className="tieu-de-nho">A. Đánh giá chất lượng đợt thực tập</h3>
      {coPhanA ? (
        <>
          {b!.chatLuong!.map((d) => (
            <div key={d.stt} className="ph-dong">
              <div className="ph-noi-dung"><span className="ph-stt">{d.stt}.</span> {d.noiDung}</div>
              {oMuc(d.mucHaiLong, MUC_HAI_LONG)}
              <div className="ph-ghi-chu">{giaTri(d.ghiChu)}</div>
            </div>
          ))}
          <div className="info-grid mt">
            <div><span className="muted">Các ý kiến khác</span>{giaTri(b!.yKienKhac)}</div>
            <div><span className="muted">Phản hồi mở và đề xuất cải tiến</span>{giaTri(p.yKienMo)}</div>
          </div>
        </>
      ) : (
        <p className="hint mt0">Phần đánh giá chất lượng chỉ sinh viên xem được; Khoa tổng hợp ẩn danh trong thống kê phản hồi.</p>
      )}

      <h3 className="tieu-de-nho">B. Bảng tự đánh giá CLO</h3>
      {(b?.tuDanhGia ?? []).map((t) => (
        <div key={t.maClo} className="ph-dong">
          <div className="ph-noi-dung"><b className="ph-ma">{t.maClo}</b> <span className="muted small">quy đổi {diem(t.diemQuyDoi)}</span></div>
          {oMuc(t.muc, MUC_DAT)}
          <div className="ph-ghi-chu">{giaTri(t.minhChung)}</div>
        </div>
      ))}
      <div className="ph-hp-dong">
        Điểm học phần tự đánh giá (HPself): <b className="ph-hp">{diem(p.hpSelf)}</b>
      </div>

      <h3 className="tieu-de-nho">C. Những trao đổi tự thân</h3>
      <dl className="ph-tu-luan">
        {CAU_TU_LUAN_08B.map((c, i) => (
          <div key={c.khoa}><dt>{i + 1}. {c.cau}</dt><dd>{giaTri(b?.tuLuan?.[c.khoa])}</dd></div>
        ))}
      </dl>
      {b?.camKet && <p className="text-xanh-la small mb0">✓ Sinh viên đã cam kết thông tin trong phiếu là trung thực (mục II).</p>}
    </section>
  );
}

/**
 * Chỉ số tự nhận thức năng lực (#97) — so sánh phần B phiếu 08b với mức chính thức sau khi kết quả công bố.
 * Chỉ chính sinh viên và GVHD gọi được; trước công bố backend báo lỗi nghiệp vụ ⇒ hiện như thông tin chờ.
 */
export function TuNhanThucCard({ phanHoiId }: { phanHoiId: number }) {
  const [kq, setKq] = useState<TuNhanThuc | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  useEffect(() => {
    feedbackApi.tuNhanThuc(phanHoiId).then(setKq).catch(setLoi);
  }, [phanHoiId]);

  const chuaCongBo = loi instanceof ApiError && loi.code === 'BUSINESS_RULE_VIOLATION';
  return (
    <section className="card mb" aria-labelledby="ph-tnt">
      <h2 id="ph-tnt" className="the-tieu-de">Chỉ số tự nhận thức năng lực</h2>
      {chuaCongBo ? <p className="muted mt0">{(loi as ApiError).message}.</p>
        : loi ? <ErrorAlert error={loi} />
          : !kq ? <Loading />
            : (
              <>
                <div className="stat-row mb">
                  <div className="stat stat-xanh-duong"><b>{so2(kq.chiSo)}</b><span>chỉ số tự nhận thức — càng gần 0 càng sát kết quả</span></div>
                  <div className="stat"><b>{diem(kq.hpSelf)}</b><span>HPself (tự đánh giá)</span></div>
                  <div className="stat stat-xanh-la"><b>{diem(kq.diemHpChinhThuc)}</b><span>điểm học phần chính thức</span></div>
                </div>
                {kq.nhanDinh && <div className="alert alert-xanh-duong mb">{kq.nhanDinh}.</div>}
                <div className="table-wrap">
                  <table className="table table-gon">
                    <thead>
                      <tr><th>CLO</th><th className="center">Tự đánh giá</th><th className="center">Chính thức</th><th className="center">Độ lệch</th></tr>
                    </thead>
                    <tbody>
                      {kq.cacClo.map((c) => (
                        <tr key={c.maClo}>
                          <td><b>{c.maClo}</b> <span className="muted small">{c.ten}</span></td>
                          <td className="center">Mức {c.mucTuDanhGia}</td>
                          <td className="center">Mức {c.mucChinhThuc}</td>
                          <td className={`center ${c.doLech > 0 ? 'text-vang' : c.doLech < 0 ? 'text-xanh-duong' : 'text-xanh-la'}`}>
                            {c.doLech > 0 ? `+${c.doLech}` : c.doLech}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="ph-chu-giai">
                  Chỉ số = trung bình độ lệch tuyệt đối giữa mức tự đánh giá và mức chính thức trên các CLO. Độ lệch dương:
                  tự đánh giá cao hơn; âm: thấp hơn. Chỉ số không ảnh hưởng điểm học phần.
                </p>
              </>
            )}
    </section>
  );
}
