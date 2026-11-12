import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { evidenceApi } from '../../api/evidences';
import ErrorAlert from '../../components/ErrorAlert';
import { NHAN_HINH_THUC_THUC_TAP } from '../../utils/constants';
import type { DoiChieuMinhChung } from '../../types/evidence';

interface Props {
  /** Chưa có hồ sơ (chưa lưu nháp lần nào) ⇒ chưa tra được danh mục. */
  recordId?: number;
  /** Hình thức đã lưu trên hồ sơ — danh mục #65 tính theo giá trị này. */
  hinhThucDaLuu?: string;
  /** Hình thức đang chọn trên form, khác giá trị đã lưu ⇒ nhắc lưu nháp để cập nhật. */
  hinhThucDangChon?: string;
  /** Sau khi GVHD duyệt: hiện đã có / chưa có (xám — nhiều mục chưa tới hạn) và đường sang SCR-17. */
  hienTrangThai?: boolean;
  /** Cán bộ / giáo vụ xem hồ sơ của SV (SCR-12): lời nhắc ở ngôi thứ ba và đường sang minh chứng của hồ sơ đó. */
  xemHoSoSinhVien?: boolean;
}

/**
 * UC04 bước 3 — danh mục minh chứng bắt buộc của hình thức thực tập (Điều 4). Danh mục lấy từ backend
 * (#65, bảng `loai_minh_chung_bat_buoc`), không viết sẵn ở giao diện.
 */
export default function RequiredEvidence({ recordId, hinhThucDaLuu, hinhThucDangChon, hienTrangThai, xemHoSoSinhVien }: Props) {
  const [bang, setBang] = useState<DoiChieuMinhChung | null>(null);
  const [loi, setLoi] = useState<unknown>(null);

  useEffect(() => {
    if (!recordId) return;
    let conHieuLuc = true;
    setLoi(null);
    evidenceApi.doiChieu(recordId)
      .then((x) => { if (conHieuLuc) setBang(x); })
      .catch((e) => { if (conHieuLuc) setLoi(e); });
    return () => { conHieuLuc = false; };
  }, [recordId, hinhThucDaLuu]);

  const doiHinhThuc = !!hinhThucDangChon && !!hinhThucDaLuu && hinhThucDangChon !== hinhThucDaLuu;

  return (
    <div className="minh-chung-bb">
      <div className="tieu-de-nho">
        Minh chứng bắt buộc
        {bang && <span className="muted"> — {NHAN_HINH_THUC_THUC_TAP[bang.hinhThucThucTap] ?? bang.hinhThucThucTap}</span>}
      </div>
      {!recordId ? (
        <p className="hint">Lưu nháp để xem danh mục minh chứng bắt buộc của hình thức đã chọn (Điều 4).</p>
      ) : (
        <>
          <ErrorAlert error={loi} />
          {doiHinhThuc && <p className="hint">Bạn vừa đổi hình thức thực tập — lưu nháp để cập nhật danh mục bên dưới.</p>}
          {bang && (
            <ul className="checklist ds-minh-chung">
              {bang.danhMuc.map((d) => (
                <li key={d.loaiMinhChung}>
                  <span className={hienTrangThai ? (d.daCo ? 'ck-dat' : 'muted') : undefined}>
                    {hienTrangThai && <span aria-hidden>{d.daCo ? '✓ ' : '○ '}</span>}
                    {d.tenHienThi}
                  </span>
                  <span className="muted small">
                    {d.nguon === 'HE_THONG' ? 'Hệ thống tự ghi nhận'
                      : xemHoSoSinhVien ? 'Sinh viên tải lên' : 'Bạn tải lên ở mục Minh chứng'}
                    {hienTrangThai && (d.daCo ? ' · Đã có' : ' · Chưa có')}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {bang && hienTrangThai && (
            <p className="mt0 small">
              <Link to={xemHoSoSinhVien ? `/records/${recordId}/evidences` : '/my-record/evidence'}>Mở mục Minh chứng →</Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
