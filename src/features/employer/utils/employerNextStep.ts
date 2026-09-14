import type { EmployerCampaign } from '@/features/employer-campaigns/types/campaignManagement.types';
import { computeCampaignStats } from '@/features/employer-campaigns/utils/campaignStats';

export type EmployerNextStep =
  | { kind: 'createFirst'; to: '/employer/campaigns/new' }
  | { kind: 'buyCredits'; to: '/employer/billing/packages' }
  | { kind: 'invite'; to: string; campaignTitle: string }
  | { kind: 'viewResults'; to: '/employer/campaigns' };

/**
 * "Bước tiếp theo" tính từ tín hiệu THẬT (trước đây là 3 bước onboarding cố định của workspace mock):
 * chưa có chiến dịch → tạo · ví trả trước hết credit → nạp · có chiến dịch đang mở mà 0 lời mời → mời · còn lại → xem kết quả.
 * `remainingCredits` null = chưa đọc được ví (không kết luận "hết credit").
 */
export function computeEmployerNextStep(campaigns: EmployerCampaign[], remainingCredits: number | null, isPrepaid: boolean): EmployerNextStep {
  const stats = computeCampaignStats(campaigns);
  if (stats.total === 0) return { kind: 'createFirst', to: '/employer/campaigns/new' };
  if (isPrepaid && remainingCredits === 0) return { kind: 'buyCredits', to: '/employer/billing/packages' };
  const uninvited = campaigns.find((c) => c.status === 'active' && (c.invitedCount ?? 0) === 0);
  if (uninvited) return { kind: 'invite', to: `/employer/campaigns/${uninvited.id}/invitations`, campaignTitle: uninvited.title };
  return { kind: 'viewResults', to: '/employer/campaigns' };
}

/** 5 chiến dịch cập nhật gần nhất. */
export function recentCampaigns(campaigns: EmployerCampaign[], limit = 5): EmployerCampaign[] {
  return [...campaigns].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, limit);
}
