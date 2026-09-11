// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Bell, Inbox, type LucideIcon } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/shared/languages';
import { AdminDashboardLayout } from './AdminDashboardLayout';

vi.mock('./LanguageToggle', () => ({
  LanguageToggle: () => <div data-testid="language-toggle" />,
}));

vi.mock('./components/SidebarLogoutButton', () => ({
  SidebarLogoutButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

// Chuông thật gọi useNotifications; ở đây chỉ cần biết layout CÓ render nó
// (số chưa đọc do chính nó sở hữu và vẽ badge).
vi.mock('@/features/engagement/components/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

// KHÔNG mock '@/shared/languages': phải chạy qua LanguageProvider thật thì mới bắt được ca
// hai khoá dịch KHÁC nhau nhưng cùng ra một chuỗi hiển thị. Mock kiểu `t: key => key` sẽ xanh
// đúng ở ca người dùng nhìn thấy.
function renderLayout() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <AdminDashboardLayout />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

/** LanguageProvider đọc ngôn ngữ từ localStorage lúc khởi tạo. */
function useLanguageInTest(language: 'vi' | 'en') {
  localStorage.setItem('language', language);
}

/**
 * Nav admin khai inline trong layout nên không có builder để so `element.type` như bên
 * employer/candidate. So bằng class mà chính lucide sinh ra, và class đó được DẪN XUẤT từ
 * một lần render component thật — đổi quy ước đặt tên của lucide thì hai vế cùng đổi.
 */
function lucideClassOf(Icon: LucideIcon): string {
  const { container, unmount } = render(<Icon />);
  const className = container.querySelector('svg')!.getAttribute('class')!;
  const token = className.split(/\s+/).find((c) => c.startsWith('lucide-'))!;
  unmount();
  return token;
}

function iconClassOfLink(name: string): string {
  return screen.getByRole('link', { name }).querySelector('svg')!.getAttribute('class')!;
}

const LABELS = {
  vi: { navPage: 'Thông báo', quickPanel: 'Trung tâm thông báo', templates: 'Mẫu thông báo' },
  en: { navPage: 'Notifications', quickPanel: 'Notification Center', templates: 'Templates' },
} as const;

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('sidebar admin — mục nav Thông báo vs chuông xem nhanh', () => {
  // Bug gốc: cả hai dòng cùng dùng t('engagement.nav.notifications') nên sidebar
  // hiện đúng một chữ "Thông báo"/"Notifications" hai lần, không phân biệt được.
  it.each(['vi', 'en'] as const)('[%s] hai dòng mang nhãn KHÁC nhau', (language) => {
    useLanguageInTest(language);
    const { navPage, quickPanel } = LABELS[language];
    renderLayout();

    // Mục nav = điểm đến (trang danh sách đầy đủ).
    const navLink = screen.getByRole('link', { name: navPage });
    expect(navLink).toHaveAttribute('href', '/admin/notifications');

    // Nhãn của trang chỉ xuất hiện ĐÚNG MỘT LẦN trong sidebar.
    expect(screen.getAllByText(navPage)).toHaveLength(1);

    // Dòng dưới đáy = mở panel xem nhanh, mang nhãn riêng.
    expect(screen.getByText(quickPanel)).toBeInTheDocument();
    expect(quickPanel).not.toBe(navPage);
  });

  it('nhãn dòng chuông trùng tiêu đề panel mà nó mở ra, không phải nhãn mục nav', () => {
    useLanguageInTest('vi');
    renderLayout();

    // 'engagement.notifications.center' cũng là tiêu đề panel trong NotificationBell.
    expect(screen.getByText('Trung tâm thông báo')).toBeInTheDocument();
    // Không còn dòng thứ hai mang nhãn của mục nav.
    expect(screen.getAllByText('Thông báo')).toHaveLength(1);
  });

  it('giữ NotificationBell trong sidebar — số chưa đọc không bị mất', () => {
    useLanguageInTest('vi');
    renderLayout();

    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('dưới sm (nhãn bị ẩn) tooltip của hai dòng vẫn khác nhau', () => {
    useLanguageInTest('vi');
    renderLayout();

    // Sidebar admin không có nút thu gọn: hẹp/rộng do breakpoint sm quyết định, nhãn
    // `hidden sm:inline`. Khi hẹp chỉ còn icon nên `title` là thứ duy nhất đọc được.
    expect(screen.getByTitle('Thông báo')).toHaveAttribute('href', '/admin/notifications');
    expect(screen.getByTitle('Trung tâm thông báo')).toBeInTheDocument();
  });

  it('mục nav dùng icon Inbox, khác icon Bell của chuông xem nhanh', () => {
    useLanguageInTest('vi');
    renderLayout();

    // Thu gọn sidebar chỉ còn icon; hai icon giống nhau là lại không phân biệt được.
    expect(iconClassOfLink('Thông báo')).toContain(lucideClassOf(Inbox));
    expect(iconClassOfLink('Thông báo')).not.toContain(lucideClassOf(Bell));
  });

  it('mục "Mẫu thông báo" không dùng lại icon của chuông — admin từng có BA cái Bell', () => {
    useLanguageInTest('vi');
    renderLayout();

    // Bell thứ ba: nav templates. Dưới sm cả ba chỉ còn glyph chuông y hệt nhau.
    expect(iconClassOfLink('Mẫu thông báo')).not.toContain(lucideClassOf(Bell));
    expect(iconClassOfLink('Mẫu thông báo')).not.toBe(iconClassOfLink('Thông báo'));
  });
});
