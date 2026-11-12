import type { VaiTro } from './types/auth';

/**
 * Danh mục màn hình theo vai trò (docs/04-ke-hoach.md mục 2.3). Mỗi màn sẽ thay PlaceholderPage bằng trang thật
 * trong pages/<module>/ (khai báo `element` ở App.tsx) — người phụ trách ghi ở `phuTrach`.
 * Cùng một đường dẫn có thể mang nhãn khác theo vai trò.
 */
export interface MucMenu {
  path: string;
  nhan: string | Partial<Record<VaiTro, string>>;
  roles: VaiTro[];
  scr?: string;
  phuTrach?: 'A' | 'B';
  moTa?: string;
}

const TAT_CA: VaiTro[] = ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD', 'SINH_VIEN'];

export const MENU: MucMenu[] = [
  { path: '/', nhan: 'Tổng quan', roles: TAT_CA },

  // Giáo vụ, giảng viên, cán bộ ĐVHD
  { path: '/users', nhan: 'Tài khoản', roles: ['ADMIN'], scr: 'SCR-03', phuTrach: 'A',
    moTa: 'Tạo, nhập hàng loạt, khóa/mở tài khoản (UC01, #5–#16)' },
  { path: '/host-orgs', nhan: 'Đơn vị hướng dẫn', roles: ['ADMIN'], scr: 'SCR-07/08', phuTrach: 'B',
    moTa: 'Phê duyệt ĐVHD và cán bộ hướng dẫn (UC02, #17–#25)' },
  { path: '/terms', nhan: 'Đợt thực tập', roles: ['ADMIN'], scr: 'SCR-09/10', phuTrach: 'A',
    moTa: 'Đợt, chặng, CLO, rubric, câu hỏi đánh giá (UC03, #26–#38)' },
  {
    path: '/records', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], scr: 'SCR-12', phuTrach: 'B',
    nhan: { ADMIN: 'Hồ sơ thực tập', GIANG_VIEN: 'Sinh viên hướng dẫn', CAN_BO_DVHD: 'Sinh viên hướng dẫn' },
    moTa: 'Xác nhận / duyệt hồ sơ; từ hồ sơ mở kế hoạch, nhật ký, tiến độ, minh chứng, báo cáo, 08a (UC04–UC07, UC11, UC12)',
  },
  { path: '/assignments', nhan: 'Phân công GVHD', roles: ['ADMIN'], scr: 'SCR-13', phuTrach: 'B',
    moTa: 'Phân công hàng loạt, kiểm hạn mức giảng viên (UC05, #48–#51)' },
  {
    path: '/assessments', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], scr: 'SCR-18/20', phuTrach: 'A',
    nhan: { ADMIN: 'Giám sát phiếu chấm', GIANG_VIEN: 'Phiếu đánh giá', CAN_BO_DVHD: 'Phiếu đánh giá' },
    moTa: 'Chấm chặng 1 và chặng 2 theo rubric; giáo vụ giám sát, mở lại phiếu, xem lệch điểm (UC08, UC09, #69–#76)',
  },
  { path: '/panels', nhan: 'Tổ đánh giá', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], scr: 'SCR-19', phuTrach: 'A',
    moTa: 'Thành lập Tổ đánh giá cuối kỳ, đánh dấu vắng mặt (UC09, #77–#81)' },
  { path: '/results', nhan: 'Kết quả học phần', roles: ['ADMIN', 'GIANG_VIEN', 'CAN_BO_DVHD'], scr: 'SCR-21', phuTrach: 'A',
    moTa: 'Bảng TTTN-07, nhận xét GVHD, xác nhận và công bố (UC10, #82–#88)' },
  { path: '/statistics', nhan: 'Thống kê', roles: ['ADMIN'], scr: 'SCR-25', phuTrach: 'A',
    moTa: 'RP-01…RP-06, xuất Excel (UC13, #98–#99)' },

  // Sinh viên
  { path: '/my-record', nhan: 'Đăng ký thực tập', roles: ['SINH_VIEN'], scr: 'SCR-11', phuTrach: 'B',
    moTa: 'Phiếu đăng ký TTTN-01 (UC04, #39–#47)' },
  { path: '/my-record/plan', nhan: 'Kế hoạch học tập', roles: ['SINH_VIEN'], scr: 'SCR-14', phuTrach: 'B',
    moTa: 'Kế hoạch TTTN-02 (UC06, #52–#56)' },
  { path: '/my-record/logbook', nhan: 'Nhật ký thực tập', roles: ['SINH_VIEN'], scr: 'SCR-15', phuTrach: 'B',
    moTa: 'Ghi nhật ký hằng ngày (UC07, #57–#60)' },
  { path: '/my-record/progress', nhan: 'Tiến độ tuần', roles: ['SINH_VIEN'], scr: 'SCR-16', phuTrach: 'B',
    moTa: 'Cập nhật tiến độ từng tuần (UC07, #61–#63)' },
  { path: '/my-record/evidence', nhan: 'Minh chứng', roles: ['SINH_VIEN'], scr: 'SCR-17', phuTrach: 'B',
    moTa: 'Tải minh chứng, bảng đối chiếu Đủ/Thiếu (UC07, #64–#68)' },
  { path: '/my-record/report', nhan: 'Báo cáo TTTN-06', roles: ['SINH_VIEN'], scr: 'SCR-22', phuTrach: 'B',
    moTa: 'Nộp báo cáo theo phiên bản (UC11, #89–#93)' },
  { path: '/my-record/feedback', nhan: 'Phản hồi 08b', roles: ['SINH_VIEN'], scr: 'SCR-23', phuTrach: 'B',
    moTa: 'Đánh giá chất lượng, tự đánh giá 7 CLO, HPself (UC12, #94–#97)' },
  { path: '/my-result', nhan: 'Kết quả của tôi', roles: ['SINH_VIEN'], scr: 'SCR-24', phuTrach: 'A',
    moTa: 'Điểm 7 CLO và bốn điều kiện công nhận (UC10, #83)' },

  { path: '/profile', nhan: 'Hồ sơ cá nhân', roles: TAT_CA, scr: 'SCR-06', phuTrach: 'A',
    moTa: 'Cập nhật thông tin, đổi mật khẩu (#3, #4)' },
];

export function nhanMenu(m: MucMenu, vaiTro: VaiTro): string {
  return typeof m.nhan === 'string' ? m.nhan : (m.nhan[vaiTro] ?? Object.values(m.nhan)[0] ?? m.path);
}

export function menuCua(vaiTro: VaiTro): MucMenu[] {
  return MENU.filter((m) => m.roles.includes(vaiTro));
}
