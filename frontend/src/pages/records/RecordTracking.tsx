import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { evidenceApi } from '../../api/evidences';
import { feedbackApi } from '../../api/feedbacks';
import { progressApi } from '../../api/progress';
import { reportApi } from '../../api/reports';
import { studyPlanApi } from '../../api/studyPlans';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_KE_HOACH } from '../../utils/constants';
import { ngay } from '../../utils/format';
import type { VaiTro } from '../../types/auth';
import type { DoiChieuMinhChung } from '../../types/evidence';
import type { PhanHoi } from '../../types/feedback';
import type { NhatKy, TienDo } from '../../types/progress';
import type { HoSo } from '../../types/record';
import type { BaoCao } from '../../types/report';
import type { KeHoach } from '../../types/studyPlan';

type KetQua<T> = { ok: true; data: T } | { ok: false; loi: unknown };

interface DuLieu {
  keHoach: KetQua<KeHoach>;
  nhatKy: KetQua<NhatKy[]>;
  tienDo: KetQua<TienDo[]>;
  minhChung: KetQua<DoiChieuMinhChung>;
  baoCao: KetQua<BaoCao[]>;
  phanHoi: KetQua<PhanHoi[]>;
}

const boc = <T,>(p: Promise<T>): Promise<KetQua<T>> =>
  p.then((data) => ({ ok: true as const, data }), (loi) => ({ ok: false as const, loi }));

/** Lỗi một ô không làm hỏng cả khối: "chưa có" (RESOURCE_NOT_FOUND) hiện như dữ liệu trống, lỗi khác hiện nguyên văn. */
function Loi({ loi }: { loi: unknown }) {
  if (loi instanceof ApiError && loi.code === 'RESOURCE_NOT_FOUND') return <div className="muted">Chưa có</div>;
  return <div className="text-do small">{loi instanceof ApiError ? loi.message : 'Không tải được dữ liệu'}</div>;
}

function O<T>({ kq, children }: { kq: KetQua<T>; children: (data: T) => ReactNode }) {
  return kq.ok ? <>{children(kq.data)}</> : <Loi loi={kq.loi} />;
}

const dau = (x?: string) => (x ? '✓' : '○');

/**
 * SCR-12 — các mục theo dõi của một hồ sơ đã được GVHD duyệt: mỗi ô tóm tắt một màn (SCR-14…17, SCR-22, SCR-23,
 * SCR-21) và là lối sang màn đó. Mọi con số do backend trả (#52, #57, #61, #65, #89, #94); ô nào lỗi thì riêng ô đó báo.
 */
export default function RecordTracking({ hoSo, vaiTro }: { hoSo: HoSo; vaiTro: VaiTro }) {
  const [du, setDu] = useState<DuLieu | null>(null);
  const id = hoSo.id;

  useEffect(() => {
    let conHieuLuc = true;
    setDu(null);
    Promise.all([
      boc(studyPlanApi.theoHoSo(id)), boc(progressApi.nhatKy(id)), boc(progressApi.tienDo(id)),
      boc(evidenceApi.doiChieu(id)), boc(reportApi.danhSach(id)), boc(feedbackApi.theoHoSo(id)),
    ]).then(([keHoach, nhatKy, tienDo, minhChung, baoCao, phanHoi]) => {
      if (conHieuLuc) setDu({ keHoach, nhatKy, tienDo, minhChung, baoCao, phanHoi });
    });
    return () => { conHieuLuc = false; };
  }, [id, hoSo.trangThai]);

  const coKetQua = ['CHO_DANH_GIA', 'HOAN_THANH', 'KHONG_HOAN_THANH'].includes(hoSo.trangThai);
  // Khi đang thực tập, báo cáo / 08a / 08b chưa tới hạn ⇒ xám như SCR-11; từ lúc chờ đánh giá thiếu mới là cảnh báo (Đ15 k3d).
  const denHanMinhChung = coKetQua;

  return (
    <>
      <h2 className="section-title">Theo dõi thực tập</h2>
      {!du ? <div className="loading">Đang tải…</div> : (
        <div className="tile-grid theo-doi">
          <Link to={`/records/${id}/study_plan`} className="tile">
            <div className="tile-title">Kế hoạch học tập TTTN-02</div>
            <O kq={du.keHoach}>{(k) => (
              <>
                <div className="theo-doi-dong">
                  <StatusBadge value={k.trangThai} labels={NHAN_TRANG_THAI_KE_HOACH} />
                  {k.nopMuon && <span className="badge badge-do">Nộp muộn</span>}
                </div>
                <div className="tile-desc">
                  {k.cacMuc.filter((m) => !m.laTongKet).length} tuần + dòng Tổng kết
                  {' · '}{k.ngayNop ? `nộp ${ngay(k.ngayNop)}` : `hạn nộp ${ngay(k.hanNop)}`}
                </div>
                <div className="tile-desc">Xác nhận: ĐVHD {dau(k.xacNhanDvhd)} · GVHD {dau(k.xacNhanGvhd)}</div>
              </>
            )}</O>
          </Link>

          <Link to={`/records/${id}/logbooks`} className="tile">
            <div className="tile-title">Nhật ký thực tập</div>
            <O kq={du.nhatKy}>{(ds) => {
              const ganNhat = ds.reduce<string | undefined>((m, n) => (!m || n.ngay > m ? n.ngay : m), undefined);
              return (
                <>
                  <div className="theo-doi-so"><b>{ds.length}</b> ngày đã ghi</div>
                  <div className="tile-desc">{ganNhat ? `Gần nhất: ${ngay(ganNhat)}` : 'Sinh viên chưa ghi ngày nào'}</div>
                </>
              );
            }}</O>
          </Link>

          <Link to={`/records/${id}/weekly_progress`} className="tile">
            <div className="tile-title">Tiến độ tuần TTTN-03</div>
            <O kq={du.tienDo}>{(ds) => {
              const daXacNhan = ds.filter((t) => t.daXacNhan).length;
              const choXacNhan = ds.filter((t) => !t.daXacNhan && (t.ketQuaThucHien || t.phanTramHoanThanh != null)).length;
              const boSung = ds.filter((t) => !t.daXacNhan && t.yeuCauBoSung).length;
              return (
                <>
                  <div className="theo-doi-so"><b>{daXacNhan}/{ds.length}</b> tuần đã xác nhận</div>
                  <div className="tile-desc">
                    {choXacNhan > 0 ? `${choXacNhan} tuần đã cập nhật, chờ ĐVHD xác nhận` : 'Không có tuần nào chờ xác nhận'}
                    {boSung > 0 && ` · ${boSung} tuần được yêu cầu bổ sung`}
                  </div>
                </>
              );
            }}</O>
          </Link>

          <Link to={`/records/${id}/evidences`} className="tile">
            <div className="tile-title">Minh chứng</div>
            <O kq={du.minhChung}>{(mc) => {
              const thieu = mc.danhMuc.filter((d) => !d.daCo);
              return (
                <>
                  <div className="theo-doi-dong">
                    <span className={`badge ${mc.du ? 'badge-xanh-la' : denHanMinhChung ? 'badge-vang' : 'badge-xam'}`}>
                      {mc.du ? 'Đủ' : `${denHanMinhChung ? 'Thiếu' : 'Chưa có'} ${thieu.length}/${mc.danhMuc.length} loại`}
                    </span>
                  </div>
                  <div className="tile-desc">
                    {mc.du ? 'Đủ minh chứng bắt buộc của hình thức thực tập (Điều 4)'
                      : `${denHanMinhChung ? 'Còn thiếu' : 'Chưa có'}: ${thieu.map((d) => d.tenHienThi).join('; ')}`}
                  </div>
                </>
              );
            }}</O>
          </Link>

          <Link to={`/records/${id}/reports`} className="tile">
            <div className="tile-title">Báo cáo TTTN-06</div>
            <O kq={du.baoCao}>{(ds) => {
              const moi = ds.find((b) => b.laMoiNhat) ?? ds[0];
              if (!moi) return <div className="muted">Sinh viên chưa nộp báo cáo</div>;
              return (
                <>
                  <div className="theo-doi-dong">
                    <span className="theo-doi-so"><b>Phiên bản {moi.phienBan}</b></span>
                    {moi.nopMuon && <span className="badge badge-do">Nộp muộn {moi.soNgayTre} ngày</span>}
                  </div>
                  <div className="tile-desc">Nộp {ngay(moi.ngayNop)} · Xác nhận: ĐVHD {dau(moi.xacNhanDvhd)} · GVHD {dau(moi.xacNhanGvhd)}</div>
                </>
              );
            }}</O>
          </Link>

          <Link to={`/records/${id}/feedbacks`} className="tile">
            <div className="tile-title">Phản hồi TTTN-08a / 08b</div>
            <O kq={du.phanHoi}>{(ds) => {
              const p08a = ds.find((p) => p.loai === 'TTTN_08A');
              const p08b = ds.find((p) => p.loai === 'TTTN_08B');
              return (
                <>
                  <div className="tile-desc">08a (cán bộ ĐVHD): {p08a ? `đã gửi ${ngay(p08a.ngayGui)}` : 'chưa gửi'}</div>
                  {/* #94 không trả 08b cho cán bộ ĐVHD — không hiện dòng thay vì báo "chưa gửi" sai. */}
                  {vaiTro !== 'CAN_BO_DVHD' && (
                    <div className="tile-desc">08b (sinh viên): {p08b ? `đã gửi ${ngay(p08b.ngayGui)}` : 'chưa gửi'}</div>
                  )}
                </>
              );
            }}</O>
          </Link>

          {coKetQua && (
            <Link to={`/results/${id}`} className="tile">
              <div className="tile-title">Kết quả học phần TTTN-07</div>
              <div className="tile-desc">Điểm 7 CLO, điểm học phần, bốn điều kiện công nhận (Điều 15)</div>
            </Link>
          )}
        </div>
      )}
    </>
  );
}
