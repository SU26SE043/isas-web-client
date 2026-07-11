import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_EMPLOYER_CAMPAIGNS, QUESTION_BANK } from '../mocks/campaignManagement.fixtures';
import type {
  CampaignDraftInput,
  CampaignFilters,
  CampaignQuestion,
  EmployerCampaign,
  InviteResult,
  PublishResult,
} from '../types/campaignManagement.types';

let campaigns = [...MOCK_EMPLOYER_CAMPAIGNS];

function matchesFilters(campaign: EmployerCampaign, filters: CampaignFilters) {
  const query = filters.query.trim().toLowerCase();
  const matchesQuery =
    !query ||
    [campaign.title, campaign.company, campaign.location, campaign.summary].some((value) =>
      value.toLowerCase().includes(query),
    );
  const matchesStatus = filters.status === 'all' || campaign.status === filters.status;
  return matchesQuery && matchesStatus;
}

function validatePublish(campaign: EmployerCampaign): string[] {
  const warnings: string[] = [];
  const totalWeight = campaign.rubric.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight !== 100) warnings.push('RUBRIC_WEIGHT_INVALID');
  if (campaign.questions.length === 0) warnings.push('QUESTIONS_REQUIRED');
  if (!campaign.jobDescription.trim()) warnings.push('JOB_DESCRIPTION_REQUIRED');
  if (campaign.capacity <= 0) warnings.push('CAPACITY_REQUIRED');
  if (campaigns.filter((item) => item.status === 'active').length >= 5) warnings.push('ACTIVE_LIMIT_REACHED');
  return warnings;
}

export const campaignManagementService = {
  async listCampaigns(filters: CampaignFilters): Promise<EmployerCampaign[]> {
    if (!usesMockData('enterprise')) {
      throw new Error('Campaign API is not wired yet. Keep usesMockData("enterprise") true.');
    }
    await mockDelay(250);
    return campaigns.filter((campaign) => matchesFilters(campaign, filters));
  },

  async getCampaign(id: string): Promise<EmployerCampaign | null> {
    if (!usesMockData('enterprise')) {
      throw new Error('Campaign API is not wired yet. Keep usesMockData("enterprise") true.');
    }
    await mockDelay(200);
    return campaigns.find((campaign) => campaign.id === id) ?? null;
  },

  async listQuestions(): Promise<CampaignQuestion[]> {
    await mockDelay(150);
    return QUESTION_BANK;
  },

  async saveDraft(input: CampaignDraftInput, id?: string): Promise<EmployerCampaign> {
    await mockDelay(500);
    const now = new Date().toISOString();
    if (id) {
      const existing = campaigns.find((campaign) => campaign.id === id);
      if (!existing) throw new Error('CAMPAIGN_NOT_FOUND');
      if (existing.status !== 'draft') throw new Error('ONLY_DRAFT_EDITABLE');
      const updated = { ...existing, ...input, updatedAt: now };
      campaigns = campaigns.map((campaign) => (campaign.id === id ? updated : campaign));
      return updated;
    }

    const campaign: EmployerCampaign = {
      ...input,
      id: `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`,
      status: 'draft',
      applicants: 0,
      invitedEmails: [],
      createdAt: now,
      updatedAt: now,
    };
    campaigns = [campaign, ...campaigns];
    return campaign;
  },

  async publishCampaign(id: string): Promise<PublishResult> {
    await mockDelay(450);
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');
    const warnings = validatePublish(campaign);
    if (warnings.length > 0) return { campaign, warnings };
    const updated = { ...campaign, status: 'active' as const, updatedAt: new Date().toISOString() };
    campaigns = campaigns.map((item) => (item.id === id ? updated : item));
    return { campaign: updated, warnings: [] };
  },

  async inviteCandidates(id: string, emails: string[]): Promise<InviteResult> {
    await mockDelay(400);
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');
    const invited = emails.filter((email) => email.includes('@'));
    const updated = {
      ...campaign,
      invitedEmails: Array.from(new Set([...campaign.invitedEmails, ...invited])),
      updatedAt: new Date().toISOString(),
    };
    campaigns = campaigns.map((item) => (item.id === id ? updated : item));
    return { campaign: updated, invited };
  },
};
