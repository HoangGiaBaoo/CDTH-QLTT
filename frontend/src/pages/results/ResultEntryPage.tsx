import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import MyResultPage from './MyResultPage';
import ResultDetailPage from './ResultDetailPage';

/**
 * `/results/:recordId` — cán bộ xem bảng TTTN-07 (SCR-21); sinh viên mở từ thông báo NT-14 thì thấy SCR-24 dạng rút
 * gọn. Backend vẫn tự chọn dạng trả về theo vai trò và chặn SV xem hồ sơ người khác (#83).
 */
export default function ResultEntryPage() {
  const { nguoiDung } = useAuth();
  const id = Number(useParams().recordId);
  return nguoiDung?.vaiTro === 'SINH_VIEN' ? <MyResultPage recordId={id} /> : <ResultDetailPage />;
}
