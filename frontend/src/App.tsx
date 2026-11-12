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
import AssessmentDetailPage from './pages/assessments/AssessmentDetailPage';
import AssessmentListPage from './pages/assessments/AssessmentListPage';
import GradingPage from './pages/assessments/GradingPage';
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
};

/** Trang con không hiện trên menu (chi tiết một bản ghi…) — tự khai báo quyền, thường trùng mục menu cha. */
const TRANG_CON: { path: string; roles: VaiTro[]; element: ReactElement }[] = [
  { path: '/terms/:termId', roles: ['ADMIN'], element: <TermDetailPage /> },
  { path: '/assessments/form', roles: ['GIANG_VIEN', 'CAN_BO_DVHD'], element: <GradingPage /> },
  { path: '/assessments/:assessmentId', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], element: <AssessmentDetailPage /> },
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
