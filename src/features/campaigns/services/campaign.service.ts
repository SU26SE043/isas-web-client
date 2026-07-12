import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_CAMPAIGNS, MOCK_INVITES } from '../mocks/campaign.fixtures';
import type {
  Campaign,
  CampaignFilters,
  CampaignInvite,
  EnrollmentInput,
  EnrollmentResult,
} from '../types/campaign.types';

const enrolledCampaigns = new Set<string>();

function assertMockMode() {
  if (!usesMockData('enterprise')) {
    throw new Error('Campaign API is not wired yet. Keep usesMockData("enterprise") true.');
  }
}

function applyFilters(campaigns: Campaign[], filters: CampaignFilters) {
  const query = filters.query.trim().toLowerCase();
  return campaigns.filter((campaign) => {
    const matchesQuery = !query
      || campaign.title.toLowerCase().includes(query)
      || campaign.company.toLowerCase().includes(query)
      || campaign.skills.some((skill) => skill.toLowerCase().includes(query));
    const matchesMode = filters.mode === 'all' || campaign.mode === filters.mode;
    const matchesSeniority = filters.seniority === 'all' || campaign.seniority === filters.seniority;
    return matchesQuery && matchesMode && matchesSeniority;
  });
}

function withEnrollment(campaign: Campaign): Campaign {
  return {
    ...campaign,
    hasEnrolled: enrolledCampaigns.has(campaign.id),
    status: enrolledCampaigns.has(campaign.id) ? 'enrolled' : campaign.status,
  };
}

export const campaignService = {
  async listCampaigns(filters: CampaignFilters): Promise<Campaign[]> {
    assertMockMode();
    await mockDelay(350);
    return applyFilters(MOCK_CAMPAIGNS.map(withEnrollment), filters);
  },

  async getCampaign(id: string): Promise<Campaign | null> {
    assertMockMode();
    await mockDelay(250);
    const campaign = MOCK_CAMPAIGNS.find((item) => item.id === id);
    return campaign ? withEnrollment(campaign) : null;
  },

  async enrollCampaign(campaignId: string, _input: EnrollmentInput): Promise<EnrollmentResult> {
    assertMockMode();
    await mockDelay(500);
    const campaign = MOCK_CAMPAIGNS.find((item) => item.id === campaignId);
    if (!campaign || campaign.status === 'filled') {
      throw new Error('campaign_unavailable');
    }
    enrolledCampaigns.add(campaignId);
    return {
      enrollmentId: `enroll-${campaignId}`,
      sessionId: `campaign-${campaignId}`,
    };
  },

  async validateInvite(token: string): Promise<(CampaignInvite & { campaign: Campaign }) | null> {
    assertMockMode();
    await mockDelay(300);
    const invite = MOCK_INVITES.find((item) => item.token === token);
    if (!invite) return null;
    const campaign = MOCK_CAMPAIGNS.find((item) => item.id === invite.campaignId);
    return campaign ? { ...invite, campaign: withEnrollment(campaign) } : null;
  },
};
