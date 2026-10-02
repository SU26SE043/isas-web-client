/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { campaignsTranslations } from '../languages/translations';

/**
 * ATT1-F3 — khe nối danh sách: GET my-campaigns (mock apiClient) → service map [C6] → useMyCampaigns THẬT →
 * trang → MyCampaignCard. Ba thẻ với số khác nhau để khoá đúng x/y của TỪNG thẻ.
 */
const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: api.get, post: vi.fn() } }));

const VI = campaignsTranslations.vi as Record<string, string>;
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => VI[key] ?? key }),
}));

const { CandidateCampaignsPage } = await import('./CandidateCampaignsPage');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const item = (campaignId: string, extra: Record<string, unknown>) => ({
  campaignId, title: `Chiến dịch ${campaignId}`, membershipStatus: 'Joined', interviewStatus: 'NotStarted', ...extra,
});

describe('CandidateCampaignsPage → MyCampaignCard: dòng lượt (ATT1-F3)', () => {
  it('mỗi thẻ hiện đúng "Còn x/y lượt" / "Hết lượt" của chính nó; Backend cũ ⇒ không có dòng', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        item('a', { maxAttempts: 3, attemptsUsed: 1, lastAttemptAbandoned: true, timeLimitMinutes: 30 }),
        item('b', { maxAttempts: 2, attemptsUsed: 2, lastAttemptAbandoned: true, timeLimitMinutes: 30 }),
        item('c', {}),
      ],
      headers: {},
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter><CandidateCampaignsPage /></MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText('Chiến dịch a');
    const card = (id: string) => container.querySelector(`[data-campaign-id="${id}"]`) as HTMLElement;

    expect(within(card('a')).getByTestId('my-campaign-attempts-text').textContent).toBe('Còn 2/3 lượt');
    expect(within(card('b')).getByTestId('my-campaign-attempts-text').textContent).toBe('Hết lượt');
    expect(within(card('c')).queryByTestId('my-campaign-attempts')).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/api/v1/campaign/my-campaigns', expect.anything());
  });
});
