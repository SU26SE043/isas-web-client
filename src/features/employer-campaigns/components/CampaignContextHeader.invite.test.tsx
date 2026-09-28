/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';

/**
 * HR không tìm ra cách mời thêm người vào chiến dịch đang mở (2026-09-22): trang chi tiết chỉ có nút mời trong
 * tab "Danh sách lời mời" và CHỈ khi danh sách rỗng. Header nay có lối vào thẳng tab Mời ứng viên — chỉ khi
 * Active (BE từ chối mời ở Draft/Closed) và chỉ ở mode overview (trang /invitations đã có tab đó, in hai lần
 * là thừa).
 */
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));
vi.mock('./CampaignSubNavigation', () => ({ CampaignSubNavigation: () => null }));
vi.mock('./EndCampaignDialog', () => ({ EndCampaignDialog: () => <button type="button">end</button> }));

const { CampaignContextHeader } = await import('./CampaignContextHeader');

afterEach(cleanup);

const campaign = (status: EmployerCampaign['status']) =>
  ({ id: 'cmp-9', title: 'T', status, domain: 'Backend', deadline: '2099-02-01T10:00:00.000Z' }) as unknown as EmployerCampaign;

function renderHeader(status: EmployerCampaign['status'], mode: 'overview' | 'invitations' = 'overview') {
  return render(
    <MemoryRouter>
      <CampaignContextHeader campaign={campaign(status)} mode={mode} />
    </MemoryRouter>,
  );
}

describe('CampaignContextHeader — nút "Mời ứng viên"', () => {
  it('Active + overview ⇒ link trỏ thẳng tab Mời ứng viên của chính chiến dịch', () => {
    renderHeader('active');
    const link = screen.getByRole('link', { name: 'employer.campaigns.list.invite' });
    expect(link).toHaveAttribute('href', '/employer/campaigns/cmp-9/invitations?tab=invite');
  });

  it.each(['draft', 'closed', 'archived'] as const)('%s ⇒ không có nút (BE từ chối mời ngoài Active)', (status) => {
    renderHeader(status);
    expect(screen.queryByRole('link', { name: 'employer.campaigns.list.invite' })).not.toBeInTheDocument();
  });

  it('mode invitations ⇒ không lặp nút (trang đó đã có tab Mời ứng viên)', () => {
    renderHeader('active', 'invitations');
    expect(screen.queryByRole('link', { name: 'employer.campaigns.list.invite' })).not.toBeInTheDocument();
  });
});
