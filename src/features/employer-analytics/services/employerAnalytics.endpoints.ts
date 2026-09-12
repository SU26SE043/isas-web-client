/**
 * Phân tích tuyển dụng theo tổ chức — đường công khai qua gateway (Employer: OrgAdmin + HrMember).
 * Gateway `campaign-route` chuyển `/api/v1/campaign/{rest}` → `/campaign/{rest}` phía CampaignService.
 */
const CAMPAIGN_API_PREFIX = '/api/v1/campaign';

export const employerAnalyticsEndpoints = {
  analytics: `${CAMPAIGN_API_PREFIX}/analytics`,
} as const;
