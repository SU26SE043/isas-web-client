/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';

/**
 * ATT1-F2 — khe nối: trang chi tiết render thẻ "Luật làm bài" bằng CHÍNH campaign đang xem, và ô số
 * liệu "Thời lượng" cũ đã bị thay (một chỗ hiển thị cho một giá trị).
 */
vi.mock('@/shared/config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/config')>()),
  isCampaignSlotsUiEnabled: () => false,
}));
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => (key === 'employer.campaigns.detail.attemptRules.attemptsValueMany' ? `${key}:{{n}}` : key),
    language: 'vi',
  }),
}));
vi.mock('../hooks/useCampaignSlots', () => ({
  useCampaignSlots: () => ({ data: [], isLoading: false, isError: false }),
  useCampaignSlotMutations: () => ({ create: {}, update: {}, remove: {} }),
}));
vi.mock('./slots/CampaignSlotsPanel', () => ({ CampaignSlotsPanel: () => null }));
vi.mock('./CampaignAttachmentsCard', () => ({ CampaignAttachmentsCard: () => null }));
vi.mock('./detail/CampaignDetailQuestionsSection', () => ({ CampaignDetailQuestionsSection: () => null }));
vi.mock('./CampaignScoringRulesCard', () => ({ CampaignScoringRulesCard: () => null }));
vi.mock('./CampaignDetailActions', () => ({ CampaignDetailActions: () => null }));

const { CampaignDetailView } = await import('./CampaignDetailView');

afterEach(cleanup);

const campaign = {
  id: 'cmp-9',
  title: 'ATT1',
  status: 'active',
  startsAt: '2026-01-01T10:00:00.000Z',
  deadline: '2099-02-01T10:00:00.000Z',
  durationMinutes: 45,
  maxAttempts: 2,
  capacity: 10,
  cvCount: 0,
  questions: [],
  rubric: [],
  jobDescription: 'JD',
} as unknown as EmployerCampaign;

describe('CampaignDetailView → thẻ "Luật làm bài" (ATT1-F2)', () => {
  it('thẻ nhận đúng campaign (45 phút · tối đa 2 lần · nút Tăng) và ô số liệu Thời lượng cũ không còn', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <CampaignDetailView
            campaign={campaign}
            published={false}
            warnings={[]}
            onPublish={async () => undefined}
            onChangeStatus={async () => undefined}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const card = screen.getByTestId('campaign-attempt-rules-card');
    expect(within(card).getByTestId('attempt-rules-duration')).toHaveTextContent('45 employer.campaigns.detail.minutes');
    expect(within(card).getByTestId('attempt-rules-attempts')).toHaveTextContent(
      'employer.campaigns.detail.attemptRules.attemptsValueMany:2',
    );
    expect(within(card).getByRole('button', { name: 'employer.campaigns.detail.attemptRules.increase' })).toBeInTheDocument();
    expect(screen.queryByText('employer.campaigns.form.duration')).not.toBeInTheDocument();
  });
});
