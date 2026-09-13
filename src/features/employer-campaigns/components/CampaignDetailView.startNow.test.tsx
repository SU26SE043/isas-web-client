/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignSlotResponse } from '../types/campaign.api.types';
import type { EmployerCampaign } from '../types/campaignManagement.types';

/**
 * T13 R2 — Tester M4: `CampaignDetailStatusNotices` có test cho `slotCount`, nhưng chỗ ĐẤU DÂY
 * (`CampaignDetailView` đọc `useCampaignSlots` rồi truyền `slotCount`) thì không — ghi cứng
 * `slotCount = 0` ở view vẫn XANH mọi tầng, tức "Mở ngay" trên trang chi tiết không bao giờ
 * bị khoá dù campaign có ca. Test này đứng đúng ở khe nối đó.
 */
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => (key === 'employer.campaigns.detail.startNowBlockedHasSlots' ? `${key} {{n}}` : key),
    language: 'vi',
  }),
}));

const slotsState = vi.hoisted(() => ({ data: [] as CampaignSlotResponse[] | undefined }));
vi.mock('../hooks/useCampaignSlots', () => ({
  useCampaignSlots: () => ({ data: slotsState.data, isLoading: false, isError: false }),
  useCampaignSlotMutations: () => ({ create: {}, update: {}, remove: {} }),
}));

// Các card con gọi service/react-query riêng — không thuộc khe nối đang đo, cắt để test không cần provider.
vi.mock('./slots/CampaignSlotsPanel', () => ({ CampaignSlotsPanel: () => null }));
vi.mock('./CampaignAttachmentsCard', () => ({ CampaignAttachmentsCard: () => null }));
vi.mock('./CampaignJobNeedsCard', () => ({ CampaignJobNeedsCard: () => null }));
// SC2 T10 thay `CampaignRubricPreviewSection` bằng section card theo câu (cần Router + react-query) — cùng lý do cắt.
vi.mock('./detail/CampaignDetailQuestionsSection', () => ({ CampaignDetailQuestionsSection: () => null }));
vi.mock('./CampaignScoringRulesCard', () => ({ CampaignScoringRulesCard: () => null }));
vi.mock('./CampaignDetailActions', () => ({ CampaignDetailActions: () => null }));

const { CampaignDetailView } = await import('./CampaignDetailView');

afterEach(() => {
  cleanup();
  slotsState.data = [];
});

const slot = (id: string): CampaignSlotResponse => ({
  id, startsAt: '2099-01-02T09:00:00.000Z', endsAt: '2099-01-02T11:00:00.000Z', capacity: 5, assignedCount: 0, startedCount: 0,
});

const campaign = {
  id: 'cmp-1',
  title: 'T13',
  status: 'active',
  startsAt: '2099-01-01T10:00:00.000Z',
  deadline: '2099-02-01T10:00:00.000Z',
  durationMinutes: 60,
  capacity: 10,
  cvCount: 0,
  questions: [],
  rubric: [],
  jobDescription: 'JD',
} as unknown as EmployerCampaign;

function renderView() {
  return render(
    <CampaignDetailView
      campaign={campaign}
      published={false}
      warnings={[]}
      onPublish={async () => undefined}
      onChangeStatus={async () => undefined}
      onStartNow={async () => undefined}
    />,
  );
}

describe('CampaignDetailView → slotCount → "Mở ngay" (T13 R2)', () => {
  it('useCampaignSlots trả 2 ca ⇒ nút Mở ngay DISABLED + lý do nêu đúng 2 ca', () => {
    slotsState.data = [slot('s1'), slot('s2')];
    renderView();
    expect(screen.getByRole('button', { name: 'employer.campaigns.detail.startNow' })).toBeDisabled();
    expect(screen.getByTestId('start-now-blocked')).toHaveTextContent('employer.campaigns.detail.startNowBlockedHasSlots 2');
  });

  it('0 ca ⇒ nút Mở ngay ENABLED, không có dòng lý do', () => {
    slotsState.data = [];
    renderView();
    expect(screen.getByRole('button', { name: 'employer.campaigns.detail.startNow' })).toBeEnabled();
    expect(screen.queryByTestId('start-now-blocked')).not.toBeInTheDocument();
  });
});
