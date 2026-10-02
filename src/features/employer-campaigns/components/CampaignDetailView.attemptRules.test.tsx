/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';

/**
 * ATT1-F2 — khe nối: trang chi tiết render thẻ "Luật làm bài" bằng CHÍNH campaign đang xem, và ô số
 * liệu "Thời lượng" cũ đã bị thay (một chỗ hiển thị cho một giá trị). Ca "tăng" đi XUYÊN
 * trang → thẻ → hộp thoại → hook → service tới tận `apiClient.put` để khoá đúng id / title / hiện tại
 * mà thẻ truyền vào hộp thoại.
 */
const api = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { put: api.put, get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock('@/shared/config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/config')>()),
  isCampaignSlotsUiEnabled: () => false,
}));
const WITH_N = new Set([
  'employer.campaigns.detail.attemptRules.attemptsValueMany',
  'employer.campaigns.detail.attemptRules.confirm',
  'employer.campaigns.detail.attemptRules.dialogCurrentOne',
  'employer.campaigns.detail.attemptRules.dialogCurrentMany',
  'employer.campaigns.form.attemptRules.attemptOptionMany',
]);
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => (WITH_N.has(key) ? `${key}:{{n}}` : key), language: 'vi' }),
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const K = 'employer.campaigns.detail.attemptRules';
const OPTION = 'employer.campaigns.form.attemptRules.attemptOptionMany';

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

function renderPage(value: EmployerCampaign) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CampaignDetailView
          campaign={value}
          published={false}
          warnings={[]}
          onPublish={async () => undefined}
          onChangeStatus={async () => undefined}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CampaignDetailView → thẻ "Luật làm bài" (ATT1-F2)', () => {
  it('thẻ nhận đúng campaign (45 phút · tối đa 2 lần · nút Tăng) và ô số liệu Thời lượng cũ không còn', () => {
    renderPage(campaign);
    const card = screen.getByTestId('campaign-attempt-rules-card');
    expect(within(card).getByTestId('attempt-rules-duration')).toHaveTextContent('45 employer.campaigns.detail.minutes');
    expect(within(card).getByTestId('attempt-rules-attempts')).toHaveTextContent(
      'employer.campaigns.detail.attemptRules.attemptsValueMany:2',
    );
    expect(within(card).getByRole('button', { name: 'employer.campaigns.detail.attemptRules.increase' })).toBeInTheDocument();
    expect(screen.queryByText('employer.campaigns.form.duration')).not.toBeInTheDocument();
  });

  it('Active, đang 2: bấm Tăng trong thẻ ⇒ hộp thoại chỉ cho 3, nêu hiện tại 2; xác nhận ⇒ PUT /api/v1/campaign/cmp-9 body ĐÚNG { title: "ATT1", maxAttempts: 3 }', async () => {
    api.put.mockResolvedValueOnce({ data: { id: 'cmp-9', title: 'ATT1', status: 'Active', maxAttempts: 3 } });
    const user = userEvent.setup();
    renderPage(campaign);

    const card = screen.getByTestId('campaign-attempt-rules-card');
    await user.click(within(card).getByRole('button', { name: `${K}.increase` }));
    const dialog = await screen.findByRole('dialog');

    const options = within(within(dialog).getByRole('group')).getAllByRole('button');
    expect(options.map((button) => button.getAttribute('aria-label'))).toEqual([`${OPTION}:3`]);
    expect(dialog).toHaveTextContent(`${K}.dialogCurrentMany:2`);

    await user.click(within(dialog).getByRole('button', { name: `${K}.confirm:3` }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.put).toHaveBeenCalledTimes(1);
    const [url, body] = api.put.mock.calls[0] as [string, Record<string, unknown>];
    expect(url).toBe('/api/v1/campaign/cmp-9');
    expect(body).toStrictEqual({ title: 'ATT1', maxAttempts: 3 });
  });

  it('Draft ⇒ trang vẫn có thẻ, trong thẻ có link "Sửa ở bước 5" tới /employer/campaigns/cmp-9/edit?step=5 và KHÔNG có nút Tăng', () => {
    renderPage({ ...campaign, status: 'draft' } as EmployerCampaign);

    const card = screen.getByTestId('campaign-attempt-rules-card');
    expect(within(card).getByRole('link', { name: `${K}.editInStep5` })).toHaveAttribute(
      'href',
      '/employer/campaigns/cmp-9/edit?step=5',
    );
    expect(within(card).queryByRole('button', { name: `${K}.increase` })).not.toBeInTheDocument();
  });
});
