// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Bell, Inbox } from 'lucide-react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/shared/languages';
import { DashboardLayout } from './DashboardLayout';
import { buildCandidateDashboardNav } from './candidateDashboardNav';

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
        <DashboardLayout />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

/** LanguageProvider đọc ngôn ngữ từ localStorage lúc khởi tạo. */
function useLanguageInTest(language: 'vi' | 'en') {
  localStorage.setItem('language', language);
}

const LABELS = {
  vi: { navPage: 'Thông báo', quickPanel: 'Trung tâm thông báo' },
  en: { navPage: 'Notifications', quickPanel: 'Notification Center' },
} as const;

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('sidebar candidate — mục nav Thông báo vs chuông xem nhanh', () => {
  // Bug gốc: cả hai dòng cùng dùng t('engagement.nav.notifications') nên sidebar
  // hiện đúng một chữ "Thông báo"/"Notifications" hai lần, không phân biệt được.
  it.each(['vi', 'en'] as const)('[%s] hai dòng mang nhãn KHÁC nhau', (language) => {
    useLanguageInTest(language);
    const { navPage, quickPanel } = LABELS[language];
    renderLayout();

    // Mục nav = điểm đến (trang danh sách đầy đủ).
    const navLink = screen.getByRole('link', { name: navPage });
    expect(navLink).toHaveAttribute('href', '/candidate/notifications');

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

  it('khi thu gọn, tooltip của hai dòng vẫn khác nhau và chuông vẫn còn', () => {
    useLanguageInTest('vi');
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    // Thu gọn: nhãn bị ẩn về w-0, tooltip `title` là thứ người dùng đọc được.
    expect(screen.getByTitle('Thông báo')).toHaveAttribute('href', '/candidate/notifications');
    expect(screen.getByTitle('Trung tâm thông báo')).toBeInTheDocument();
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('mục nav dùng icon Inbox, khác icon Bell của chuông xem nhanh', () => {
    const items = buildCandidateDashboardNav((key) => key);
    const notificationsItem = items.find((item) => item.to === '/candidate/notifications');

    expect(notificationsItem).toBeDefined();
    // Thu gọn sidebar chỉ còn icon; hai icon giống nhau là lại không phân biệt được.
    expect((notificationsItem!.icon as ReactElement).type).toBe(Inbox);
    expect((notificationsItem!.icon as ReactElement).type).not.toBe(Bell);
  });
});
