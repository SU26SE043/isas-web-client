import type { CampaignSlotResponse } from '../types/campaign.api.types';
import { campaignSlotCapacity } from './campaignSlots';

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

/**
 * Bao nhiêu lời mời trong lượt này sẽ KHÔNG có ca nào chứa — số chỗ trống hiện có (`available`,
 * cùng cách `AssignSlotsAsync` (BE) đếm: `capacity − assignedCount` mỗi ca) ít hơn số đang mời.
 *
 * `slots.length === 0` (chiến dịch KHÔNG khai ca nào) trả `0`, KHÔNG PHẢI "thiếu vô hạn" —
 * phép trừ ngây thơ `0 (available) − inviteCount` từng cho ra số dương và bắn cảnh báo
 * "vượt 0 chỗ" ngay cả khi campaign chưa hề bật cơ chế ca thi (ca là tuỳ chọn).
 */
export function inviteSlotShortfall(
  slots: readonly CampaignSlotResponse[],
  inviteCount: number,
): number {
  if (slots.length === 0) return 0;
  const { available } = campaignSlotCapacity([...slots]);
  return Math.max(0, inviteCount - available);
}
