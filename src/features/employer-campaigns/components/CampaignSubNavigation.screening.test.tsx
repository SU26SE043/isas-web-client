/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { CampaignSubNavigation } from './CampaignSubNavigation';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' as const }),
}));

afterEach(() => cleanup());

const campaign = (status: EmployerCampaign['status']) =>
  ({ id: 'c-1', title: 'BE', status, deadline: '2099-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', cvCount: 0, capacity: 0 }) as EmployerCampaign;

/**
 * SCR1-F2 — backend + wizard cho sàng CV ở Draft (CMP3-B2), nên trang lời mời cũng phải mở tab
 * "Sàng lọc CV" ở Draft — hai cửa một luật. Tab "Mời" vẫn đòi Active (BE 409 ở Draft).
 * Trước bản này tab sàng CV chỉ bật khi Active và KHÔNG có test nào khoá ⇒ mutation
 * `canScreen = status === 'active'` chạy qua xanh — test này bịt lỗ đó.
 */
describe('CampaignSubNavigation — tab sàng CV ở Draft', () => {
  it('Draft: tab sàng CV là link (bật), tab mời là span aria-disabled', () => {
    render(
      <MemoryRouter initialEntries={['/employer/campaigns/c-1/invitations?tab=cv-screening']}>
        <CampaignSubNavigation campaign={campaign('draft')} mode="invitations" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'employer.campaigns.workspace.screening' })).toHaveAttribute(
      'href',
      '/employer/campaigns/c-1/invitations?tab=cv-screening',
    );
    expect(screen.queryByRole('link', { name: 'employer.campaigns.workspace.invite' })).toBeNull();
    expect(screen.getByText('employer.campaigns.workspace.invite')).toHaveAttribute('aria-disabled', 'true');
  });

  it('Closed: tab sàng CV bị khoá (BE 409 khi Closed/Archived)', () => {
    render(
      <MemoryRouter initialEntries={['/employer/campaigns/c-1/invitations']}>
        <CampaignSubNavigation campaign={campaign('closed')} mode="invitations" />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: 'employer.campaigns.workspace.screening' })).toBeNull();
    expect(screen.getByText('employer.campaigns.workspace.screening')).toHaveAttribute('aria-disabled', 'true');
  });
});
