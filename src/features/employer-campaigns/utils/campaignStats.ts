import type { EmployerCampaign } from '../types/campaignManagement.types';

export interface CampaignStats {
  total: number;
  active: number;
  draft: number;
  /** closed + paused + archived — "không còn nhận ứng viên". */
  closed: number;
  invited: number;
  completed: number;
}

/** Công thức chung cho thẻ số liệu trang chiến dịch VÀ dashboard employer — hai chỗ phải ra cùng một số. */
export function computeCampaignStats(campaigns: EmployerCampaign[]): CampaignStats {
  return {
    total: campaigns.length,
    active: campaigns.filter((item) => item.status === 'active').length,
    draft: campaigns.filter((item) => item.status === 'draft').length,
    closed: campaigns.filter((item) => item.status === 'closed' || item.status === 'paused' || item.status === 'archived').length,
    invited: campaigns.reduce((sum, item) => sum + (item.invitedCount ?? 0), 0),
    completed: campaigns.reduce((sum, item) => sum + (item.completedCount ?? 0), 0),
  };
}
