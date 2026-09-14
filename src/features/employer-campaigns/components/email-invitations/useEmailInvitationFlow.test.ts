/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignSlotResponse } from '../../types/campaign.api.types';
import type { EmployerCampaign } from '../../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

// Hook thật (`useCampaignSlots`) dùng react-query — mock để không cần QueryClientProvider,
// mẫu theo `CampaignReviewStep.test.tsx`.
const slotsState = vi.hoisted(() => ({ data: undefined as CampaignSlotResponse[] | undefined }));
vi.mock('../../hooks/useCampaignSlots', () => ({
  useCampaignSlots: () => ({ data: slotsState.data }),
}));

vi.mock('../../hooks/useCreateCampaignInvitations', () => ({
  useCreateCampaignInvitations: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  }),
}));

import { useEmailInvitationFlow } from './useEmailInvitationFlow';

afterEach(() => {
  cleanup();
  slotsState.data = undefined;
});

function campaign(overrides: Partial<EmployerCampaign> = {}): EmployerCampaign {
  return { id: 'c-1', status: 'active', ...overrides } as EmployerCampaign;
}

function slot(capacity: number, assignedCount: number): CampaignSlotResponse {
  return {
    id: `cap${capacity}-assigned${assignedCount}`,
    startsAt: '2099-01-10T09:00Z',
    endsAt: '2099-01-10T11:00Z',
    capacity,
    assignedCount,
    startedCount: 0,
  };
}

/**
 * SC2 R1 — bug có sẵn: campaign KHÔNG khai ca nào (`slotsQuery.data = []`) từng bị tính
 * `available = 0` rồi so `validEmails.length > 0` ⇒ LUÔN cảnh báo "vượt 0 chỗ", kể cả khi
 * ca thi là tuỳ chọn và chưa ai bật. `inviteSlotShortfall` phân biệt đúng ca "không cần
 * slot" khỏi ca "hết slot".
 */
describe('useEmailInvitationFlow — capacityWarning (SC2 R1)', () => {
  it('KHÔNG có ca nào ⇒ KHÔNG cảnh báo dù mời nhiều người', () => {
    slotsState.data = [];
    const { result } = renderHook(() =>
      useEmailInvitationFlow(campaign(), ['a@x.com', 'b@x.com', 'c@x.com']),
    );
    expect(result.current.capacityWarning).toBeNull();
  });

  it('có ca nhưng KHÔNG đủ chỗ ⇒ cảnh báo', () => {
    slotsState.data = [slot(2, 0)];
    const { result } = renderHook(() =>
      useEmailInvitationFlow(campaign(), ['a@x.com', 'b@x.com', 'c@x.com']),
    );
    expect(result.current.capacityWarning).not.toBeNull();
  });

  it('có ca và đủ chỗ ⇒ KHÔNG cảnh báo', () => {
    slotsState.data = [slot(5, 0)];
    const { result } = renderHook(() =>
      useEmailInvitationFlow(campaign(), ['a@x.com', 'b@x.com']),
    );
    expect(result.current.capacityWarning).toBeNull();
  });

  it('chưa tải xong danh sách ca (`data` undefined) ⇒ KHÔNG cảnh báo', () => {
    slotsState.data = undefined;
    const { result } = renderHook(() =>
      useEmailInvitationFlow(campaign(), ['a@x.com']),
    );
    expect(result.current.capacityWarning).toBeNull();
  });
});
