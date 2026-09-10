/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignDetailStatusNotices } from './CampaignDetailStatusNotices';
import type { EmployerCampaign } from '../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
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
});
