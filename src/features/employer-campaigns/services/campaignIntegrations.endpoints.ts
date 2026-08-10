const CAMPAIGN_API_PREFIX = '/api/v1/campaign';

export const campaignIntegrationsEndpoints = {
  apiKeys: `${CAMPAIGN_API_PREFIX}/api-keys`,
  apiKey: (id: string) => `${CAMPAIGN_API_PREFIX}/api-keys/${encodeURIComponent(id)}`,
  publicCampaigns: `${CAMPAIGN_API_PREFIX}/public/campaigns`,
  publicResults: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/public/campaigns/${encodeURIComponent(id)}/results`,
} as const;
