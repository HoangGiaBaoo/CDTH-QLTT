import {
  Award, BarChart3, Building2, CalendarRange, CircleUserRound, ClipboardCheck, FilePen, FileText, FolderOpen,
  LayoutDashboard, ListChecks, MessageSquareText, NotebookPen, Paperclip, TrendingUp, UserCheck, Users, UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { VaiTro } from './types/auth';

/**
 * Danh mục màn hình theo vai trò (docs/04-ke-hoach.md mục 2.3). Mỗi màn sẽ thay PlaceholderPage bằng trang thật
 * trong pages/<module>/ (khai báo `element` ở App.tsx) — người phụ trách ghi ở `phuTrach`.
 * Cùng một đường dẫn có thể mang nhãn khác theo vai trò. `scr`, `phuTrach` chỉ để tra cứu trong code, không hiển thị.
 */
export interface MucMenu {
  path: string;
  nhan: string | Partial<Record<VaiTro, string>>;
  roles: VaiTro[];
  /** Biểu tượng trên menu trái và ô chức năng ở trang Tổng quan. */
  icon: LucideIcon;
  scr?: string;
  phuTrach?: 'A' | 'B';
  /** Vai trò mở được đường dẫn (đích thông báo) nhưng không thấy trên menu — trang tự đưa họ sang màn phù hợp. */
  vaoThem?: VaiTro[];
}

const TAT_CA: VaiTro[] = ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD', 'SINH_VIEN'];

export const MENU: MucMenu[] = [
  { path: '/', nhan: 'Tổng quan', roles: TAT_CA, icon: LayoutDashboard },

  // Giáo vụ, giảng viên, cán bộ ĐVHD
  { path: '/users', nhan: 'Tài khoản', roles: ['ADMIN'], icon: Users, scr: 'SCR-03', phuTrach: 'A' },
  { path: '/host-orgs', nhan: 'Đơn vị hướng dẫn', roles: ['ADMIN'], icon: Building2, scr: 'SCR-07/08', phuTrach: 'B' },
  { path: '/terms', nhan: 'Đợt thực tập', roles: ['ADMIN'], icon: CalendarRange, scr: 'SCR-09/10', phuTrach: 'A' },
  {
    path: '/records', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], icon: FolderOpen, scr: 'SCR-12', phuTrach: 'B',
    nhan: { ADMIN: 'Hồ sơ thực tập', GIANG_VIEN: 'Sinh viên hướng dẫn', CAN_BO_DVHD: 'Sinh viên hướng dẫn' },
  },
  // NT-04 (kết quả phân công) gửi cả giảng viên và sinh viên với đường dẫn này.
  { path: '/assignments', nhan: 'Phân công GVHD', roles: ['ADMIN'], icon: UserCheck, scr: 'SCR-13', phuTrach: 'B',
    vaoThem: ['GIANG_VIEN', 'SINH_VIEN'] },
  {
    path: '/assessments', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], icon: ClipboardCheck, scr: 'SCR-18/20', phuTrach: 'A',
    nhan: { ADMIN: 'Giám sát phiếu chấm', GIANG_VIEN: 'Phiếu đánh giá', CAN_BO_DVHD: 'Phiếu đánh giá' },
  },
  { path: '/panels', nhan: 'Tổ đánh giá', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], icon: UsersRound, scr: 'SCR-19', phuTrach: 'A' },
  { path: '/results', nhan: 'Kết quả học phần', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], icon: Award, scr: 'SCR-21', phuTrach: 'A' },
  { path: '/statistics', nhan: 'Thống kê', roles: ['ADMIN'], icon: BarChart3, scr: 'SCR-25', phuTrach: 'A' },

  // Sinh viên
  { path: '/my-record', nhan: 'Đăng ký thực tập', roles: ['SINH_VIEN'], icon: FilePen, scr: 'SCR-11', phuTrach: 'B' },
  { path: '/my-record/plan', nhan: 'Kế hoạch học tập', roles: ['SINH_VIEN'], icon: ListChecks, scr: 'SCR-14', phuTrach: 'B' },
  { path: '/my-record/logbook', nhan: 'Nhật ký thực tập', roles: ['SINH_VIEN'], icon: NotebookPen, scr: 'SCR-15', phuTrach: 'B' },
  { path: '/my-record/progress', nhan: 'Tiến độ tuần', roles: ['SINH_VIEN'], icon: TrendingUp, scr: 'SCR-16', phuTrach: 'B' },
  { path: '/my-record/evidence', nhan: 'Minh chứng', roles: ['SINH_VIEN'], icon: Paperclip, scr: 'SCR-17', phuTrach: 'B' },
  { path: '/my-record/report', nhan: 'Báo cáo TTTN-06', roles: ['SINH_VIEN'], icon: FileText, scr: 'SCR-22', phuTrach: 'B' },
  { path: '/my-record/feedback', nhan: 'Phản hồi 08b', roles: ['SINH_VIEN'], icon: MessageSquareText, scr: 'SCR-23', phuTrach: 'B' },
  { path: '/my-result', nhan: 'Kết quả của tôi', roles: ['SINH_VIEN'], icon: Award, scr: 'SCR-24', phuTrach: 'A' },

  { path: '/profile', nhan: 'Hồ sơ cá nhân', roles: TAT_CA, icon: CircleUserRound, scr: 'SCR-06', phuTrach: 'A' },
];

export function nhanMenu(m: MucMenu, vaiTro: VaiTro): string {
  return typeof m.nhan === 'string' ? m.nhan : (m.nhan[vaiTro] ?? Object.values(m.nhan)[0] ?? m.path);
}

export function menuCua(vaiTro: VaiTro): MucMenu[] {
  return MENU.filter((m) => m.roles.includes(vaiTro));
}
