import { mockDelay, usesMockData } from '@/shared/mock';
import { employerService } from '@/features/employer/services/employer.service';
import { DEFAULT_PROCTORING, MOCK_EMPLOYER_CAMPAIGNS, QUESTION_BANK } from '../mocks/campaignManagement.fixtures';
import type {
  CampaignCandidateRow,
  CampaignDraftInput,
  CampaignFilters,
  CampaignQuestion,
  EmployerCampaign,
  InviteRejectedEmail,
  InviteResolution,
  PublishResult,
} from '../types/campaignManagement.types';

let campaigns = [...MOCK_EMPLOYER_CAMPAIGNS];

const MOCK_REGISTERED_CANDIDATES: Record<string, { candidateId: string; displayName: string }> = {
  'candidate@isas.dev': { candidateId: 'e2e-candidate', displayName: 'E2E Candidate' },
  'mai.nguyen@example.com': { candidateId: 'cand-mai', displayName: 'Mai Nguyen' },
  'new.candidate@example.com': { candidateId: 'cand-new', displayName: 'New Candidate' },
};

const EMPLOYER_EMAILS = new Set(['hrmember@isas.dev', 'orgadmin@isas.dev', 'admin@isas.dev']);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

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

function resolveEmail(email: string): { row?: CampaignCandidateRow; rejected?: InviteRejectedEmail } {
  const normalized = normalizeEmail(email);
  if (!normalized.includes('@')) {
    return { rejected: { email, reason: 'INVALID_EMAIL' } };
  }
  if (EMPLOYER_EMAILS.has(normalized)) {
    return { rejected: { email: normalized, reason: 'EMPLOYER_EMAIL' } };
  }
  const registered = MOCK_REGISTERED_CANDIDATES[normalized];
  if (registered) {
    return {
      row: {
        email: normalized,
        displayName: registered.displayName,
        candidateId: registered.candidateId,
        status: 'invited',
      },
    };
  }
  return { row: { email: normalized, status: 'invite_pending' } };
}

function mergeCandidates(existing: CampaignCandidateRow[], incoming: CampaignCandidateRow[]) {
  const map = new Map(existing.map((row) => [row.email, row]));
  for (const row of incoming) {
    map.set(row.email, row);
  }
  return Array.from(map.values());
}

async function validatePublish(campaign: EmployerCampaign): Promise<string[]> {
  const warnings: string[] = [];
  const workspace = await employerService.getWorkspace();
  if (workspace.verification.status !== 'verified') warnings.push('ORG_NOT_VERIFIED');
  const totalWeight = campaign.rubric.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight !== 100) warnings.push('RUBRIC_WEIGHT_INVALID');
  if (campaign.questions.length === 0) warnings.push('QUESTIONS_REQUIRED');
  if (!campaign.jobDescription.trim()) warnings.push('JOB_DESCRIPTION_REQUIRED');
  if (campaign.capacity <= 0) warnings.push('CAPACITY_REQUIRED');
  if (campaigns.filter((item) => item.status === 'active' && item.id !== campaign.id).length >= 5) {
    warnings.push('ACTIVE_LIMIT_REACHED');
  }
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
    const proctoring = input.proctoring ?? DEFAULT_PROCTORING;
    if (id) {
      const existing = campaigns.find((campaign) => campaign.id === id);
      if (!existing) throw new Error('CAMPAIGN_NOT_FOUND');
      if (existing.status !== 'draft') throw new Error('ONLY_DRAFT_EDITABLE');
      const updated = { ...existing, ...input, proctoring, updatedAt: now };
      campaigns = campaigns.map((campaign) => (campaign.id === id ? updated : campaign));
      return updated;
    }

    const campaign: EmployerCampaign = {
      ...input,
      proctoring,
      id: `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`,
      status: 'draft',
      applicants: 0,
      invitedEmails: [],
      candidates: [],
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
    const warnings = await validatePublish(campaign);
    if (warnings.length > 0) return { campaign, warnings };
    const updated = { ...campaign, status: 'active' as const, updatedAt: new Date().toISOString() };
    campaigns = campaigns.map((item) => (item.id === id ? updated : item));
    return { campaign: updated, warnings: [] };
  },

  async inviteCandidates(id: string, emails: string[]): Promise<InviteResolution> {
    await mockDelay(400);
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');

    const linked: CampaignCandidateRow[] = [];
    const pending: CampaignCandidateRow[] = [];
    const rejected: InviteRejectedEmail[] = [];
    const accepted: CampaignCandidateRow[] = [];

    for (const rawEmail of emails) {
      const result = resolveEmail(rawEmail);
      if (result.rejected) {
        rejected.push(result.rejected);
        continue;
      }
      if (!result.row) continue;
      accepted.push(result.row);
      if (result.row.status === 'invited') linked.push(result.row);
      else pending.push(result.row);
    }

    const candidates = mergeCandidates(campaign.candidates, accepted);
    const invitedEmails = Array.from(new Set([...campaign.invitedEmails, ...accepted.map((row) => row.email)]));
    const updated = {
      ...campaign,
      candidates,
      invitedEmails,
      updatedAt: new Date().toISOString(),
    };
    campaigns = campaigns.map((item) => (item.id === id ? updated : item));
    return { campaign: updated, linked, pending, rejected };
  },
};
