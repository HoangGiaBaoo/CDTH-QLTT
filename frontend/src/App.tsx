import type { ReactElement } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import RequireRole from './auth/RequireRole';
import AppLayout from './layouts/AppLayout';
import { MENU } from './menu';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/common/HomePage';
import NotFoundPage from './pages/common/NotFoundPage';
import PlaceholderPage from './pages/common/PlaceholderPage';
import MyRecordPage from './pages/records/MyRecordPage';
import RecordEntryPage from './pages/records/RecordEntryPage';
import RecordListPage from './pages/records/RecordListPage';
import AssessmentDetailPage from './pages/assessments/AssessmentDetailPage';
import AssessmentListPage from './pages/assessments/AssessmentListPage';
import GradingPage from './pages/assessments/GradingPage';
import PanelCreatePage from './pages/panels/PanelCreatePage';
import PanelDetailPage from './pages/panels/PanelDetailPage';
import PanelListPage from './pages/panels/PanelListPage';
import MyResultPage from './pages/results/MyResultPage';
import ResultEntryPage from './pages/results/ResultEntryPage';
import ResultListPage from './pages/results/ResultListPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import TermDetailPage from './pages/terms/TermDetailPage';
import TermListPage from './pages/terms/TermListPage';
import type { VaiTro } from './types/auth';

/**
 * Trang thật của từng màn: khai báo đường dẫn → component ở đây; màn chưa có thì tự dùng PlaceholderPage.
 * Quyền vào route lấy từ MENU (menu.ts) để menu và route không lệch nhau.
 */
const TRANG: Record<string, ReactElement> = {
  '/': <HomePage />,
  '/terms': <TermListPage />,
  '/assessments': <AssessmentListPage />,
  '/panels': <PanelListPage />,
  '/records': <RecordListPage />,
  '/results': <ResultListPage />,
  '/my-record': <MyRecordPage />,
  '/my-result': <MyResultPage />,
  '/statistics': <StatisticsPage />,
};

/**
 * Màn theo dõi của một hồ sơ mở từ SCR-12 (cán bộ, giảng viên, giáo vụ) — cùng màn với mục menu của sinh viên;
 * chưa làm thì giữ chỗ theo mục menu đó.
 */
const MAN_THEO_DOI_HO_SO: [string, string][] = [
  ['plan', '/my-record/plan'], ['logbook', '/my-record/logbook'], ['progress', '/my-record/progress'],
  ['evidence', '/my-record/evidence'], ['report', '/my-record/report'], ['feedback', '/my-record/feedback'],
];

/** Trang con không hiện trên menu (chi tiết một bản ghi…) — tự khai báo quyền, thường trùng mục menu cha. */
const TRANG_CON: { path: string; roles: VaiTro[]; element: ReactElement }[] = [
  { path: '/terms/:termId', roles: ['ADMIN'], element: <TermDetailPage /> },
  { path: '/assessments/form', roles: ['GIANG_VIEN', 'CAN_BO_DVHD'], element: <GradingPage /> },
  { path: '/panels/new', roles: ['ADMIN'], element: <PanelCreatePage /> },
  // Đích của NT-11 — sinh viên cũng nhận thông báo nên được xem tổ của mình (#78).
  { path: '/panels/:panelId', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD', 'SINH_VIEN'], element: <PanelDetailPage /> },
  { path: '/assessments/:assessmentId', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], element: <AssessmentDetailPage /> },
  // Cán bộ: bảng TTTN-07 (SCR-21). Sinh viên tới từ NT-14: kết quả của mình (SCR-24).
  // Đích NT-01/02/05/06: sinh viên ⇒ phiếu đăng ký của mình (SCR-11), cán bộ ⇒ chi tiết hồ sơ (SCR-12).
  { path: '/records/:recordId', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD', 'SINH_VIEN'], element: <RecordEntryPage /> },
  { path: '/results/:recordId', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD', 'SINH_VIEN'], element: <ResultEntryPage /> },
  ...MAN_THEO_DOI_HO_SO.map(([con, menuSv]) => ({
    path: `/records/:recordId/${con}`,
    roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'] as VaiTro[],
    element: <PlaceholderPage muc={MENU.find((m) => m.path === menuSv)!} />,
  })),
];

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireRole><AppLayout /></RequireRole>}>
            {MENU.map((m) => (
              <Route key={m.path} path={m.path}
                     element={<RequireRole roles={m.roles}>{TRANG[m.path] ?? <PlaceholderPage muc={m} />}</RequireRole>} />
            ))}
            {TRANG_CON.map((t) => (
              <Route key={t.path} path={t.path} element={<RequireRole roles={t.roles}>{t.element}</RequireRole>} />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
