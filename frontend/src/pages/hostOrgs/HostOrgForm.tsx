import { useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import ErrorAlert from '../../components/ErrorAlert';
import type { DonVi, DonViRequest } from '../../types/hostOrg';

interface Props {
  /** Có `donVi` ⇒ form sửa (#20); không có ⇒ form thêm (#19, đơn vị vào trạng thái Chờ duyệt). */
  donVi?: DonVi;
  onLuu: (req: DonViRequest) => Promise<void>;
  onHuy: () => void;
}

/** Form thông tin đơn vị hướng dẫn — dùng ở SCR-07 (thêm) và SCR-08 (sửa). */
export default function HostOrgForm({ donVi, onLuu, onHuy }: Props) {
  const [f, setF] = useState<DonViRequest>({
    maDvhd: donVi?.maDvhd ?? '',
    ten: donVi?.ten ?? '',
    diaChi: donVi?.diaChi ?? '',
    linhVuc: donVi?.linhVuc ?? '',
    nguoiDaiDien: donVi?.nguoiDaiDien ?? '',
    dienThoai: donVi?.dienThoai ?? '',
    email: donVi?.email ?? '',
  });
  const [loi, setLoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);

  const loiTruong = (t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);

  const gui = async (e: FormEvent) => {
    e.preventDefault();
    setLoi(null);
    setDangGui(true);
    try {
      await onLuu({
        ...f,
        maDvhd: f.maDvhd?.trim() || undefined,
        dienThoai: f.dienThoai?.trim() || undefined,
        email: f.email?.trim() || undefined,
      });
    } catch (err) {
      setLoi(err);
    } finally {
      setDangGui(false);
    }
  };

  const o = (k: keyof DonViRequest, nhan: string, props: Record<string, unknown> = {}) => (
    <label className="field">
      <span>{nhan}</span>
      <input value={f[k] ?? ''} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))}
             className={loiTruong(k) ? 'input-loi' : undefined} {...props} />
      {loiTruong(k) && <small className="field-error">{loiTruong(k)}</small>}
    </label>
  );

  return (
    <form onSubmit={gui} noValidate>
      <ErrorAlert error={loi} />
      <div className="form-grid">
        {o('ten', 'Tên đơn vị *', { autoFocus: !donVi })}
        {o('maDvhd', 'Mã đơn vị', { placeholder: 'Bỏ trống để hệ thống tự sinh' })}
        {o('linhVuc', 'Lĩnh vực *', { placeholder: 'Phát triển phần mềm' })}
        {o('diaChi', 'Địa chỉ *')}
        {o('nguoiDaiDien', 'Người đại diện *')}
        {o('dienThoai', 'Điện thoại', { inputMode: 'tel' })}
        {o('email', 'Email', { type: 'email' })}
      </div>
      {!donVi && (
        <div className="hint">
          Đơn vị mới vào trạng thái Chờ duyệt. Bổ sung tối thiểu một cán bộ hướng dẫn rồi phê duyệt để sinh viên chọn
          được đơn vị này (Điều 7 khoản 1).
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-phu" onClick={onHuy} disabled={dangGui}>Hủy</button>
        <button className="btn btn-chinh" disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : donVi ? 'Lưu thay đổi' : 'Thêm đơn vị'}
        </button>
      </div>
    </form>
  );
}
