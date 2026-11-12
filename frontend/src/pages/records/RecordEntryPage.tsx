import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import MyRecordPage from './MyRecordPage';
import RecordDetailPage from './RecordDetailPage';

/**
 * `/records/:recordId` — đích của NT-01/02/05/06. Sinh viên thấy phiếu đăng ký của mình (SCR-11); cán bộ ĐVHD,
 * giảng viên, giáo vụ thấy chi tiết hồ sơ (SCR-12). Backend chặn xem hồ sơ ngoài phạm vi (#41).
 */
export default function RecordEntryPage() {
  const { nguoiDung } = useAuth();
  const id = Number(useParams().recordId);
  if (nguoiDung?.vaiTro === 'SINH_VIEN') return <MyRecordPage recordId={id} />;
  return <RecordDetailPage key={id} recordId={id} />;
}
