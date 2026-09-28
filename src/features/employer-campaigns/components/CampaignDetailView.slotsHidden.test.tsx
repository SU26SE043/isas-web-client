/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignSlotResponse } from '../types/campaign.api.types';
import type { EmployerCampaign } from '../types/campaignManagement.types';

/**
 * Ô "Khung giờ phỏng vấn" trên trang chi tiết TẠM ẨN sau cờ `VITE_ENABLE_CAMPAIGN_SLOTS_UI` (mặc định tắt,
 * chốt 2026-09-22 — cùng cờ đã ẩn bước wizard 17/09). Ba vế phải đúng CÙNG LÚC khi cờ tắt:
 * (1) không render panel, (2) KHÔNG gọi `/slots` (hook nhận `enabled=false`), (3) "Mở ngay" không bị khoá
 * vì ca kể cả khi cache còn dữ liệu ca. Thiếu (2) là trang vẫn bắn một request vô hình; thiếu (3) là
 * campaign cũ có ca bị khoá "Mở ngay" mà HR không thấy ca ở đâu để xoá.
 */
vi.mock('@/shared/config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/config')>()),
  isCampaignSlotsUiEnabled: () => false,
}));
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

const slotsHook = vi.hoisted(() => ({
  data: [] as CampaignSlotResponse[] | undefined,
  calls: [] as Array<{ campaignId: string | undefined; enabled: boolean | undefined }>,
}));
vi.mock('../hooks/useCampaignSlots', () => ({
  useCampaignSlots: (campaignId: string | undefined, enabled?: boolean) => {
    slotsHook.calls.push({ campaignId, enabled });
    return { data: slotsHook.data, isLoading: false, isError: false };
  },
  useCampaignSlotMutations: () => ({ create: {}, update: {}, remove: {} }),
}));

vi.mock('./slots/CampaignSlotsPanel', () => ({
  CampaignSlotsPanel: () => <div data-testid="campaign-slots-panel" />,
}));
vi.mock('./CampaignAttachmentsCard', () => ({ CampaignAttachmentsCard: () => null }));
vi.mock('./detail/CampaignDetailQuestionsSection', () => ({ CampaignDetailQuestionsSection: () => null }));
vi.mock('./CampaignScoringRulesCard', () => ({ CampaignScoringRulesCard: () => null }));
vi.mock('./CampaignDetailActions', () => ({ CampaignDetailActions: () => null }));

const { CampaignDetailView } = await import('./CampaignDetailView');

afterEach(() => {
  cleanup();
  slotsHook.data = [];
  slotsHook.calls = [];
});

const slot = (id: string): CampaignSlotResponse => ({
  id, startsAt: '2099-01-02T09:00:00.000Z', endsAt: '2099-01-02T11:00:00.000Z', capacity: 5, assignedCount: 0, startedCount: 0,
});

const campaign = {
  id: 'cmp-1',
  title: 'Ẩn khung giờ',
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

describe('CampaignDetailView — khung giờ tạm ẩn (cờ tắt)', () => {
  it('không render ô "Khung giờ phỏng vấn"', () => {
    renderView();
    expect(screen.queryByTestId('campaign-slots-panel')).not.toBeInTheDocument();
  });

  it('không gọi /slots: hook nhận enabled=false', () => {
    renderView();
    expect(slotsHook.calls.length).toBeGreaterThan(0);
    expect(slotsHook.calls.every((call) => call.enabled === false)).toBe(true);
  });

  it('cache còn 2 ca vẫn KHÔNG khoá "Mở ngay" (ca không hiện thì không được chặn theo ca)', () => {
    slotsHook.data = [slot('s1'), slot('s2')];
    renderView();
    expect(screen.getByRole('button', { name: 'employer.campaigns.detail.startNow' })).toBeEnabled();
    expect(screen.queryByTestId('start-now-blocked')).not.toBeInTheDocument();
  });
});
