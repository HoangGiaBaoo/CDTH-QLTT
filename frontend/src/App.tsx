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

/**
 * Trang thật của từng màn: khai báo đường dẫn → component ở đây; màn chưa có thì tự dùng PlaceholderPage.
 * Quyền vào route lấy từ MENU (menu.ts) để menu và route không lệch nhau.
 */
const TRANG: Record<string, ReactElement> = {
  '/': <HomePage />,
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireRole><AppLayout /></RequireRole>}>
            {MENU.map((m) => (
              <Route key={m.path} path={m.path}
                     element={<RequireRole roles={m.roles}>{TRANG[m.path] ?? <PlaceholderPage muc={m} />}</RequireRole>} />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
