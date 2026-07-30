const CAMPAIGN_API_PREFIX = '/api/v1/campaign';

export const adminCampaignEndpoints = {
  list: `${CAMPAIGN_API_PREFIX}/admin/campaigns`,
} as const;
