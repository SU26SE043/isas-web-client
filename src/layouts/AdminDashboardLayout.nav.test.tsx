// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminDashboardLayout } from './AdminDashboardLayout';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('./LanguageToggle', () => ({ LanguageToggle: () => <div data-testid="language-toggle" /> }));
vi.mock('./components/SidebarLogoutButton', () => ({
  SidebarLogoutButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

afterEach(cleanup);

/**
 * Đợt B (2026-09-16): sidebar admin nhóm theo VIỆC — Vận hành · Tiền · Chất lượng AI — thay 8 mục phẳng
 * (trước đó "Thước đo chấm điểm" đứng cạnh "Người dùng", 3 màn cấu hình AI không nhìn ra là một cụm).
 * Khoá cả THÀNH VIÊN từng nhóm và THỨ TỰ nhóm: một mục lạc nhóm là cấu trúc thông tin nói sai.
 */
describe('AdminDashboardLayout — nav 3 nhóm', () => {
  const renderNav = () => render(<MemoryRouter initialEntries={['/admin/dashboard']}><AdminDashboardLayout /></MemoryRouter>);
  const linksOf = (group: HTMLElement) => within(group).getAllByRole('link').map((a) => a.getAttribute('href'));

  it('đúng 3 nhóm theo thứ tự Vận hành → Tiền → Chất lượng AI, không nhóm rỗng', () => {
    renderNav();
    const nav = screen.getByRole('navigation', { name: 'Admin' });
    const groups = within(nav).getAllByRole('group');
    expect(groups.map((g) => g.getAttribute('aria-label'))).toEqual([
      'admin.nav.group.operations', 'admin.nav.group.money', 'admin.nav.group.aiQuality',
    ]);
    groups.forEach((g) => expect(within(g).getAllByRole('link').length).toBeGreaterThan(0));
  });

  it('mỗi mục nằm đúng nhóm; 3 màn cấu hình AI đứng chung một cụm với Thước đo đứng đầu', () => {
    renderNav();
    const nav = screen.getByRole('navigation', { name: 'Admin' });
    const byName = (name: string) => within(nav).getByRole('group', { name });
    expect(linksOf(byName('admin.nav.group.operations'))).toEqual(['/admin/dashboard', '/admin/users', '/admin/organizations', '/admin/campaigns']);
    expect(linksOf(byName('admin.nav.group.money'))).toEqual(['/admin/billing', '/admin/orders', '/admin/grants']);
    expect(linksOf(byName('admin.nav.group.aiQuality'))).toEqual(['/admin/rubrics', '/admin/prompts', '/admin/roadmap-thresholds', '/admin/knowledge']);
    // Không mục nào bị rơi hay nhân đôi khi chia nhóm.
    expect(within(nav).getAllByRole('link')).toHaveLength(11);
  });
});
