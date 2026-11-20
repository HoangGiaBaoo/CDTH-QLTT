import { useEffect, useState } from 'react';
import { ApiError } from '../../api/client';
import { hostOrgApi } from '../../api/hostOrgs';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import type { CanBo } from '../../types/hostOrg';

interface Props {
  mo: boolean;
  donViId: number;
  /** Có ⇒ sửa chức vụ, kinh nghiệm, hạn mức (#25); không có ⇒ thêm cán bộ kèm tài khoản (#24). */
  canBo?: CanBo;
  onHuy: () => void;
  onDaLuu: (canBo: CanBo, message?: string) => void;
}

interface FormCanBo {
  tenDangNhap: string;
  hoTen: string;
  email: string;
  dienThoai: string;
  chucVu: string;
  soNamKinhNghiem: string;
  soSvToiDa: string;
}

const RONG: FormCanBo = {
  tenDangNhap: '', hoTen: '', email: '', dienThoai: '', chucVu: '', soNamKinhNghiem: '', soSvToiDa: '',
};

function tuCanBo(c?: CanBo): FormCanBo {
  if (!c) return RONG;
  return {
    tenDangNhap: c.tenDangNhap ?? '', hoTen: c.hoTen, email: c.email ?? '', dienThoai: c.dienThoai ?? '',
    chucVu: c.chucVu ?? '', soNamKinhNghiem: String(c.soNamKinhNghiem ?? ''), soSvToiDa: String(c.soSvToiDa),
  };
}

/** Ô số trống ⇒ undefined để backend báo "Vui lòng nhập…" thay vì gửi 0. */
function so(s: string): number | undefined {
  return s.trim() === '' ? undefined : Number(s);
}

/** Hộp thoại thêm / sửa cán bộ hướng dẫn của một ĐVHD (UC02 bước 4, 4a). Quy tắc kinh nghiệm, hạn mức do backend kiểm. */
export default function SupervisorDialog({ mo, donViId, canBo, onHuy, onDaLuu }: Props) {
  const [f, setF] = useState<FormCanBo>(tuCanBo(canBo));
  const [loi, setLoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);

  useEffect(() => {
    if (mo) {
      setF(tuCanBo(canBo));
      setLoi(null);
    }
  }, [mo, canBo]);

  const loiTruong = (t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);

  const gui = async () => {
    setLoi(null);
    setDangGui(true);
    try {
      const { data, message } = canBo
        ? await hostOrgApi.capNhatCanBo(canBo.id, {
          chucVu: f.chucVu.trim() || undefined,
          soNamKinhNghiem: so(f.soNamKinhNghiem) as number,
          soSvToiDa: so(f.soSvToiDa) as number,
        })
        : await hostOrgApi.themCanBo(donViId, {
          tenDangNhap: f.tenDangNhap.trim(),
          hoTen: f.hoTen.trim(),
          email: f.email.trim(),
          dienThoai: f.dienThoai.trim() || undefined,
          chucVu: f.chucVu.trim() || undefined,
          soNamKinhNghiem: so(f.soNamKinhNghiem) as number,
          soSvToiDa: so(f.soSvToiDa),
        });
      onDaLuu(data, message);
    } catch (e) {
      setLoi(e);
    } finally {
      setDangGui(false);
    }
  };

  const o = (k: keyof FormCanBo, nhan: string, props: Record<string, unknown> = {}) => (
    <label className="field">
      <span>{nhan}</span>
      <input value={f[k]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))}
             className={loiTruong(k) ? 'input-loi' : undefined} {...props} />
      {loiTruong(k) && <small className="field-error">{loiTruong(k)}</small>}
    </label>
  );

  return (
    <ConfirmDialog mo={mo} rong tieuDe={canBo ? `Sửa cán bộ ${canBo.hoTen}` : 'Thêm cán bộ hướng dẫn'}
                   nhanXacNhan={canBo ? 'Lưu thay đổi' : 'Thêm cán bộ'} tuFocusNut={false} dangXuLy={dangGui}
                   onXacNhan={() => void gui()} onHuy={onHuy}>
      <ErrorAlert error={loi} />
      <div className="form-grid mt">
        {!canBo && (
          <>
            {o('hoTen', 'Họ tên *', { autoFocus: true })}
            {o('tenDangNhap', 'Tên đăng nhập *', { autoComplete: 'off', placeholder: 'cb.ten' })}
            {o('email', 'Email *', { type: 'email' })}
            {o('dienThoai', 'Điện thoại', { inputMode: 'tel' })}
          </>
        )}
        {o('chucVu', 'Chức vụ', { autoFocus: !!canBo })}
        {o('soNamKinhNghiem', 'Số năm kinh nghiệm *', { type: 'number', min: 0, inputMode: 'numeric' })}
        {o('soSvToiDa', canBo ? 'Hạn mức sinh viên *' : 'Hạn mức sinh viên', {
          type: 'number', min: 1, inputMode: 'numeric', placeholder: canBo ? undefined : 'Mặc định theo Quy định',
        })}
      </div>
      <p className="hint">
        Cán bộ hướng dẫn cần từ 3 năm kinh nghiệm trở lên (Điều 7 khoản 1 điểm c).
        {!canBo && ' Tài khoản đăng nhập được tạo kèm và chỉ hoạt động khi đơn vị đã được phê duyệt.'}
      </p>
    </ConfirmDialog>
  );
}
