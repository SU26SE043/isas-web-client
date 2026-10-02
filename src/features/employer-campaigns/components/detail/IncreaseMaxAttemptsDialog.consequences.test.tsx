/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { employerCampaignTranslations } from '../../languages/translations';

/**
 * ATT1-F5b — luật CAMP-23: ứng viên đã NỘP BÀI (buổi Completed) không làm lại được dù HR tăng số
 * lần; tăng số lần chỉ cứu người bỏ ngang. Câu cũ "Áp dụng cho MỌI ứng viên, kể cả người đã hết
 * lượt" nói sai luật đó. Đo bằng CHỮ THẬT (vi + en) để câu sai không quay lại.
 */
const DICT = {
  vi: employerCampaignTranslations.vi as Record<string, string>,
  en: employerCampaignTranslations.en as Record<string, string>,
};
let language: 'vi' | 'en' = 'vi';
vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { put: vi.fn(), get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock('react-hot-toast', () => {
  const toastFn = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() });
  return { default: toastFn };
});
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language, t: (key: string) => DICT[language][key] ?? key }),
}));

const { IncreaseMaxAttemptsDialog } = await import('./IncreaseMaxAttemptsDialog');

const CONSEQUENCES = {
  vi: [
    'Chỉ người bỏ ngang (lượt bị huỷ) dùng được lượt mới; người đã nộp bài không làm lại được.',
    'Mỗi lượt làm lại trừ 1 credit tổ chức.',
    'Không thể giảm lại sau khi lưu.',
  ],
  en: [
    'Only candidates who dropped out (attempt cancelled) can use the new attempts; anyone who already submitted cannot retake.',
    'Each retake uses 1 organization credit.',
    'It cannot be decreased after saving.',
  ],
};

afterEach(() => {
  cleanup();
  language = 'vi';
});

async function openDialog() {
  const user = userEvent.setup();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <IncreaseMaxAttemptsDialog campaignId="cmp-1" title="Backend Developer" current={1} />
    </QueryClientProvider>,
  );
  await user.click(screen.getByRole('button', { name: DICT[language]['employer.campaigns.detail.attemptRules.increase'] }));
  return screen.findByRole('dialog');
}

describe('IncreaseMaxAttemptsDialog — 3 câu hệ quả nói ĐÚNG luật CAMP-23', () => {
  it.each(['vi', 'en'] as const)('%s: đúng 3 dòng, dòng đầu nói người đã nộp bài KHÔNG làm lại được', async (lang) => {
    language = lang;
    const dialog = await openDialog();
    const list = within(dialog).getByTestId('increase-max-attempts-consequences');

    // So khớp TUYỆT ĐỐI cả 3 dòng: câu cũ "Áp dụng cho MỌI ứng viên…" phải làm test ĐỎ.
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(CONSEQUENCES[lang]);
  });

  it('không còn khoá i18n "consequenceAllCandidates" (câu sai luật) ở bất kỳ ngôn ngữ nào', () => {
    for (const dict of Object.values(DICT)) {
      expect(dict['employer.campaigns.detail.attemptRules.consequenceAllCandidates']).toBeUndefined();
    }
  });
});
