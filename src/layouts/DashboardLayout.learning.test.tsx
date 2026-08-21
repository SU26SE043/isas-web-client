// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BRAND_LOGO_ALT } from '@/shared/brand';
import { DashboardLayout } from './DashboardLayout';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('./LanguageToggle', () => ({
  LanguageToggle: () => <div data-testid="language-toggle" />,
}));

vi.mock('./candidateDashboardNav', () => ({
  buildCandidateDashboardNav: () => [],
}));

vi.mock('./components/SidebarLogoutButton', () => ({
  SidebarLogoutButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

vi.mock('@/features/engagement/components/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

afterEach(cleanup);

describe('learning shared chrome', () => {
  it('renders exactly one BrandLogo', () => {
    render(
      <MemoryRouter>
        <DashboardLayout sectionTitleKey="practice.learningPath.title" />
      </MemoryRouter>,
    );

    expect(screen.getAllByAltText(BRAND_LOGO_ALT)).toHaveLength(1);
  });
});
