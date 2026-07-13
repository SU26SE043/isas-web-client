import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_BRIEFINGS, MOCK_CAMPAIGNS, MOCK_INVITES } from '../mocks/campaign.fixtures';
import type {
  Campaign,
  CampaignBriefing,
  CampaignFilters,
  CampaignInvite,
  CandidateCampaignInvite,
  CandidateInviteStatus,
  EnrollmentInput,
  EnrollmentResult,
  InviteAuthResolution,
} from '../types/campaign.types';

const enrolledCampaigns = new Set<string>();

const BLOCKED_INVITE_EMAILS = new Set(['organize@isas.dev', 'hr@isas.dev', 'admin@isas.dev']);

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

function findInvite(token: string): (CampaignInvite & { campaign: Campaign }) | null {
  const invite = MOCK_INVITES.find((item) => item.token === token);
  if (!invite) return null;
  const campaign = MOCK_CAMPAIGNS.find((item) => item.id === invite.campaignId);
  return campaign ? { ...invite, campaign: withEnrollment(campaign) } : null;
}

function resolveInviteStatus(invite: CampaignInvite): CandidateInviteStatus {
  if (invite.status === 'expired') return 'expired';
  if (invite.status !== 'valid') return 'expired';

  if (typeof sessionStorage !== 'undefined') {
    const stored = sessionStorage.getItem(`isas-invite-status-${invite.token}`);
    if (stored === 'completed' || stored === 'in_progress') {
      return stored as CandidateInviteStatus;
    }
  }

  return 'invited';
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
    return findInvite(token);
  },

  async validateMagicLink(token: string): Promise<(CampaignInvite & { campaign: Campaign }) | null> {
    return this.validateInvite(token);
  },

  async resolveInviteAuth(token: string): Promise<InviteAuthResolution> {
    assertMockMode();
    await mockDelay(200);
    const invite = findInvite(token);
    if (!invite) return { mode: 'invalid' };
    if (invite.status === 'expired') return { mode: 'invalid', invite };

    const email = invite.candidateEmail.toLowerCase();
    if (BLOCKED_INVITE_EMAILS.has(email)) {
      return { mode: 'role_blocked', invite, candidateEmail: email };
    }

    const authMode = invite.authMode ?? (email === 'candidate@isas.dev' ? 'sign_in' : 'register');
    return {
      mode: authMode,
      invite,
      candidateEmail: email,
    };
  },

  async getCampaignBriefing(token: string): Promise<CampaignBriefing | null> {
    assertMockMode();
    await mockDelay(250);
    const invite = findInvite(token);
    if (!invite || invite.status !== 'valid') return null;

    const template = MOCK_BRIEFINGS[invite.campaignId];
    if (!template) return null;

    return {
      token,
      sessionId: `campaign-${invite.campaignId}`,
      campaignId: invite.campaignId,
      candidateEmail: invite.candidateEmail,
      ...template,
    };
  },

  async listMyInvitedCampaigns(candidateEmail: string): Promise<CandidateCampaignInvite[]> {
    assertMockMode();
    await mockDelay(300);
    const email = candidateEmail.trim().toLowerCase();
    if (!email) return [];

    return MOCK_INVITES.filter((invite) => invite.candidateEmail.toLowerCase() === email)
      .map((invite) => {
        const campaign = MOCK_CAMPAIGNS.find((item) => item.id === invite.campaignId);
        if (!campaign) return null;

        return {
          inviteToken: invite.token,
          campaignId: invite.campaignId,
          title: campaign.title,
          company: campaign.company,
          deadline: invite.expiresAt,
          status: resolveInviteStatus(invite),
          sessionId: `campaign-${invite.campaignId}`,
        } satisfies CandidateCampaignInvite;
      })
      .filter((item): item is CandidateCampaignInvite => item !== null);
  },
};
