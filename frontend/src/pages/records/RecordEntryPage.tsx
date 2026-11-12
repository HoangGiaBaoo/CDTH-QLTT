import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import PlaceholderPage from '../common/PlaceholderPage';
import { MENU } from '../../menu';
import MyRecordPage from './MyRecordPage';

/**
 * `/records/:recordId` — đích của NT-01/02/05/06. Sinh viên thấy phiếu đăng ký của mình (SCR-11); cán bộ thấy chi
 * tiết hồ sơ (SCR-12, làm ở bước sau). Backend chặn xem hồ sơ người khác (#41).
 */
export default function RecordEntryPage() {
  const { nguoiDung } = useAuth();
  const id = Number(useParams().recordId);
  if (nguoiDung?.vaiTro === 'SINH_VIEN') return <MyRecordPage recordId={id} />;
  return <PlaceholderPage muc={MENU.find((m) => m.path === '/records')!} />;
}
