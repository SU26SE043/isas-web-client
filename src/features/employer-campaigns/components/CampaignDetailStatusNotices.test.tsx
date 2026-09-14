/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignDetailStatusNotices } from './CampaignDetailStatusNotices';
import type { EmployerCampaign } from '../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    // T13 R2 — giữ placeholder `{{n}}` để test đọc được số ca đã `.replace()`.
    t: (key: string) => (key === 'employer.campaigns.detail.startNowBlockedHasSlots' ? `${key} {{n}}` : key),
  }),
}));

afterEach(() => cleanup());

const future = '2099-01-01T10:00:00.000Z';
const campaign = (status: EmployerCampaign['status']) => ({
  status,
  startsAt: future,
} as EmployerCampaign);

describe('CampaignDetailStatusNotices', () => {
  it('does not offer start now for a future Draft campaign', () => {
    render(
      <CampaignDetailStatusNotices
        campaign={campaign('draft')}
        published={false}
        warnings={[]}
        formattedStart="future"
        onStartNow={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'employer.campaigns.detail.startNow' })).not.toBeInTheDocument();
  });

  it('offers start now only for a future Active campaign', () => {
    render(
      <CampaignDetailStatusNotices
        campaign={campaign('active')}
        published={false}
        warnings={[]}
        formattedStart="future"
        onStartNow={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'employer.campaigns.detail.startNow' })).toBeInTheDocument();
  });

  // T13 R2 — D-3: có ca ⇒ "Mở ngay" KHOÁ + nêu lý do (ca quyết định giờ mở), KHÔNG gọi API để nhận 409.
  it('có ca thi ⇒ nút Mở ngay DISABLED, lý do nêu số ca, bấm KHÔNG mở hộp thoại và KHÔNG gọi onStartNow', () => {
    const onStartNow = vi.fn();
    render(
      <CampaignDetailStatusNotices
        campaign={campaign('active')}
        published={false}
        warnings={[]}
        formattedStart="future"
        onStartNow={onStartNow}
        slotCount={3}
      />,
    );
    const button = screen.getByRole('button', { name: 'employer.campaigns.detail.startNow' });
    expect(button).toBeDisabled();
    expect(screen.getByTestId('start-now-blocked')).toHaveTextContent('employer.campaigns.detail.startNowBlockedHasSlots');
    expect(screen.getByTestId('start-now-blocked')).toHaveTextContent('3');
    fireEvent.click(button);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onStartNow).not.toHaveBeenCalled();
  });

  it('không ca ⇒ nút BẬT, không có dòng lý do; bấm mở hộp thoại xác nhận (chưa gọi API)', async () => {
    const onStartNow = vi.fn(async () => undefined);
    render(
      <CampaignDetailStatusNotices
        campaign={campaign('active')}
        published={false}
        warnings={[]}
        formattedStart="future"
        onStartNow={onStartNow}
        slotCount={0}
      />,
    );
    const button = screen.getByRole('button', { name: 'employer.campaigns.detail.startNow' });
    expect(button).toBeEnabled();
    expect(screen.queryByTestId('start-now-blocked')).not.toBeInTheDocument();
    fireEvent.click(button);
    expect(await screen.findByRole('dialog')).toHaveTextContent('employer.campaigns.detail.startNowConfirmTitle');
    expect(onStartNow).not.toHaveBeenCalled();
  });
});
