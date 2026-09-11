import type { CampaignSlotResponse } from '../types/campaign.api.types';

/**
 * Ca thi nằm NGOÀI cửa sổ chiến dịch — ứng viên được gán vào đó sẽ không bao giờ thi được.
 *
 * ⚠ Backend KHÔNG chặn ca này: `CampaignService.ValidateSlot` chỉ kiểm `ends > starts` và
 * `capacity > 0`. Lúc ứng viên bấm Bắt đầu, `ParticipationService` chặn bằng cửa sổ chiến
 * dịch HOẶC cửa sổ ca, và câu báo lỗi nói về CA — không chỉ ra nguyên nhân là cửa sổ chiến
 * dịch. Nên đây là cảnh báo phía HR, không phải bản sao của một guard đã có.
 */
export function slotsOutsideCampaignWindow(
  slots: readonly CampaignSlotResponse[],
  campaignStartsAt: string,
  campaignExpiresAt: string,
): CampaignSlotResponse[] {
  const from = new Date(campaignStartsAt).getTime();
  const to = new Date(campaignExpiresAt).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return [];
  return slots.filter((slot) => {
    const starts = new Date(slot.startsAt).getTime();
    const ends = new Date(slot.endsAt).getTime();
    if (Number.isNaN(starts) || Number.isNaN(ends)) return false;
    return starts < from || ends > to;
  });
}

/**
 * Tổng sức chứa các ca vượt trần ứng viên ⇒ những chỗ dư KHÔNG BAO GIỜ dùng được:
 * `EnsureCandidateCapacityAsync` chặn ở `min(campaign.MaxCandidates, entitlement cap)`
 * trước khi lời mời chạm tới ca.
 */
export function slotCapacityOverflow(totalSlotCapacity: number, maxCandidates: number | null): number {
  if (maxCandidates == null || maxCandidates <= 0) return 0;
  return Math.max(0, totalSlotCapacity - maxCandidates);
}
