import { useState } from 'react';
import { ApiError } from '../../api/client';
import { hostOrgApi } from '../../api/hostOrgs';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import type { DonVi, DonViRequest } from '../../types/hostOrg';

interface Props {
  mo: boolean;
  onHuy: () => void;
  onDaGui: (donVi: DonVi) => void;
}

const RONG: DonViRequest = { ten: '', diaChi: '', linhVuc: '', nguoiDaiDien: '', dienThoai: '', email: '' };

/**
 * UC04 luồng thay thế — sinh viên đề xuất nơi thực tập chưa có trong danh mục (#19). Đơn vị vào trạng thái
 * Chờ duyệt; sinh viên chỉ chọn được sau khi giáo vụ bổ sung cán bộ và phê duyệt theo UC02.
 */
export default function ProposeHostOrgDialog({ mo, onHuy, onDaGui }: Props) {
  const [f, setF] = useState<DonViRequest>(RONG);
  const [loi, setLoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);

  const loiTruong = (t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);
  const dong = () => { setF(RONG); setLoi(null); onHuy(); };

  const gui = async () => {
    setLoi(null);
    setDangGui(true);
    try {
      const { data } = await hostOrgApi.tao({
        ...f, dienThoai: f.dienThoai?.trim() || undefined, email: f.email?.trim() || undefined,
      });
      setF(RONG);
      onDaGui(data);
    } catch (e) {
      setLoi(e);
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
    <ConfirmDialog mo={mo} rong tieuDe="Đề xuất đơn vị hướng dẫn mới" nhanXacNhan="Gửi đề xuất" tuFocusNut={false}
                   dangXuLy={dangGui} onXacNhan={() => void gui()} onHuy={dong}>
      <p className="muted">
        Dùng khi nơi bạn thực tập chưa có trong danh mục. Giáo vụ sẽ bổ sung cán bộ hướng dẫn và phê duyệt đơn vị;
        sau khi được duyệt, đơn vị mới hiện trong danh sách để bạn chọn (Điều 7 khoản 1).
      </p>
      <ErrorAlert error={loi} />
      <div className="form-grid mt">
        {o('ten', 'Tên đơn vị *', { autoFocus: true })}
        {o('linhVuc', 'Lĩnh vực *', { placeholder: 'Phát triển phần mềm' })}
        {o('diaChi', 'Địa chỉ *')}
        {o('nguoiDaiDien', 'Người đại diện *')}
        {o('dienThoai', 'Điện thoại', { inputMode: 'tel' })}
        {o('email', 'Email', { type: 'email' })}
      </div>
    </ConfirmDialog>
  );
}
