import { campaignManagementService, isLiveCampaignId } from '@/features/employer-campaigns/services/campaignManagement.service';
import { MOCK_PIPELINE_CANDIDATES } from '../mocks/employerAnalytics.fixtures';
import type {
  CampaignCandidateListItem,
  CampaignScoredResult,
  CampaignTranscriptResponse,
} from '@/features/employer-campaigns/types/campaign.api.types';
import type {
  AnalyticsFilters,
  AnalyticsSnapshot,
  CandidateReport,
  ExportFormat,
  ExportResult,
  PipelineCandidate,
  PipelineFilters,
  PipelineStatus,
} from '../types/employerAnalytics.types';

const STATUS_ORDER: PipelineStatus[] = [
  'invite_pending',
  'invited',
  'in_progress',
  'paused_violation',
  'auto_submitted',
  'completed',
];

function normalizeStatus(status: string | undefined, hasResult: boolean): PipelineStatus {
  if (hasResult) return 'completed';
  const value = (status ?? '').toLowerCase().replace(/[-\s]/g, '_');
  if (value.includes('pending')) return 'invite_pending';
  if (value.includes('invite')) return 'invited';
  if (value.includes('pause') || value.includes('violation')) return 'paused_violation';
  if (value.includes('submit') || value.includes('complete')) return 'auto_submitted';
  return 'in_progress';
}

function scoreBand(score: number, band: PipelineFilters['scoreBand']) {
  if (band === 'top') return score >= 85;
  if (band === 'mid') return score >= 70 && score < 85;
  if (band === 'risk') return score > 0 && score < 70;
  return true;
}

function toCandidate(
  campaignId: string,
  item: CampaignCandidateListItem,
  result?: CampaignScoredResult,
): PipelineCandidate {
  const score = result?.totalScore ?? item.overallMatchScore ?? 0;
  return {
    id: item.id,
    campaignId,
    candidateCode: `CAND-${item.id.slice(0, 8).toUpperCase()}`,
    name: item.fullName || 'Candidate',
    email: item.email || '',
    role: 'Candidate',
    status: normalizeStatus(item.status, Boolean(result)),
    score,
    rank: result?.rank ?? 0,
    completedAt: result?.scoredAt ?? '',
    location: '',
    experienceYears: 0,
    skills: item.skills ?? [],
    summary: '',
    blindHiring: true,
    shortlisted: result?.result === 'Pass',
    internalNotes: [],
    sessionId: result?.sessionId,
  };
}

async function loadCampaign(campaignId: string) {
  const [items, results] = await Promise.all([
    campaignManagementService.getCampaignCandidates(campaignId, { limit: 100 }),
    campaignManagementService.getCampaignResults(campaignId),
  ]);
  const byCandidate = new Map(results.results.map((item) => [item.candidateId, item]));
  const candidates = items.map((item) => toCandidate(campaignId, item, byCandidate.get(item.id)));
  return { items, results, candidates, byCandidate };
}

function sortCandidates(items: PipelineCandidate[], sortBy: PipelineFilters['sortBy']) {
  return [...items].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'completedAt') return (b.completedAt || '').localeCompare(a.completedAt || '');
    if (sortBy === 'status') return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    return (a.rank || Number.MAX_SAFE_INTEGER) - (b.rank || Number.MAX_SAFE_INTEGER);
  });
}

function toReport(candidate: PipelineCandidate, result: CampaignScoredResult, transcript?: CampaignTranscriptResponse): CandidateReport {
  const scores = transcript?.questions.flatMap((question) => question.scores) ?? [];
  const breakdown = scores.length
    ? scores.map((score) => ({ label: score.criterionName || score.criterionId, value: score.score }))
    : [{ label: 'Overall score', value: result.totalScore }];
  const rubricEvidence = scores.map((score) => ({
    criterion: score.criterionName || score.criterionId,
    weight: score.maxScore ? Math.round((score.maxScore / 100) * 100) : 0,
    score: score.score,
    evidence: score.reasoning || 'No evidence provided.',
  }));
  const transcriptHighlights = transcript?.questions
    .filter((question) => question.transcript)
    .map((question) => question.transcript as string) ?? [];
  return {
    candidateId: candidate.id,
    reviewed: Boolean(result.overrideScore != null || result.overrideResult),
    score: result.aiScore,
    overrideScore: result.overrideScore ?? null,
    overrideNote: result.overrideNote ?? null,
    recommendation: result.result === 'Pass' ? 'strong_yes' : result.result === 'Fail' ? 'no' : 'hold',
    breakdown,
    rubricEvidence,
    strengths: result.flags.filter((flag) => flag.type.toLowerCase().includes('strength')).map((flag) => flag.note || flag.type),
    risks: result.flags.filter((flag) => !flag.type.toLowerCase().includes('strength')).map((flag) => flag.note || flag.type),
    transcriptHighlights,
  };
}

async function findCandidate(campaignId: string, candidateId: string) {
  const [{ results }, detail] = await Promise.all([
    loadCampaign(campaignId),
    campaignManagementService.getCampaignCandidateDetail(campaignId, candidateId),
  ]);
  const result = results.results.find((item) => item.candidateId === candidateId);
  const candidate = toCandidate(campaignId, detail, result);
  candidate.experienceYears = detail.yearsExperience ?? 0;
  candidate.summary = detail.summary ?? '';
  candidate.skills = detail.skills ?? candidate.skills;
  return { candidate, result };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const employerAnalyticsService = {
  async listPipelineCandidates(campaignId: string, filters: PipelineFilters): Promise<PipelineCandidate[]> {
    // Slug-based campaigns are the in-app demo/E2E contract; only GUID campaigns
    // are backed by the live campaign API.
    if (!isLiveCampaignId(campaignId)) {
      const search = filters.search.trim().toLowerCase();
      const filtered = MOCK_PIPELINE_CANDIDATES.filter((candidate) => {
        const haystack = [candidate.candidateCode, candidate.name, candidate.email, candidate.status, ...candidate.skills].join(' ').toLowerCase();
        return (filters.status === 'all' || candidate.status === filters.status)
          && scoreBand(candidate.score, filters.scoreBand)
          && (!search || haystack.includes(search));
      });
      return sortCandidates(filtered, filters.sortBy);
    }
    const { candidates } = await loadCampaign(campaignId);
    const search = filters.search.trim().toLowerCase();
    const filtered = candidates.filter((candidate) => {
      const haystack = [candidate.candidateCode, candidate.name, candidate.email, candidate.status, ...candidate.skills].join(' ').toLowerCase();
      return (filters.status === 'all' || candidate.status === filters.status)
        && scoreBand(candidate.score, filters.scoreBand)
        && (!search || haystack.includes(search));
    });
    return sortCandidates(filtered, filters.sortBy);
  },

  async getCandidate(campaignId: string, candidateId: string): Promise<PipelineCandidate | null> {
    try {
      return (await findCandidate(campaignId, candidateId)).candidate;
    } catch {
      return null;
    }
  },

  async getCandidateReport(campaignId: string, candidateId: string): Promise<CandidateReport | null> {
    const { candidate, result } = await findCandidate(campaignId, candidateId);
    if (!result) return null;
    const transcript = await campaignManagementService.getCampaignResultTranscript(campaignId, result.sessionId);
    return toReport(candidate, result, transcript);
  },

  async getAnalytics(campaignId: string, filters: AnalyticsFilters): Promise<AnalyticsSnapshot> {
    const { candidates } = await loadCampaign(campaignId);
    const completed = candidates.filter((candidate) => candidate.status === 'completed');
    const scoped = filters.status === 'all' ? candidates : candidates.filter((candidate) => candidate.status === filters.status);
    const averageScore = completed.length ? Math.round(completed.reduce((sum, item) => sum + item.score, 0) / completed.length) : 0;
    const counts = STATUS_ORDER.map((status) => ({ status, count: scoped.filter((item) => item.status === status).length }));
    const bands = [
      { band: '0-69', count: scoped.filter((item) => item.score > 0 && item.score < 70).length },
      { band: '70-84', count: scoped.filter((item) => item.score >= 70 && item.score < 85).length },
      { band: '85-100', count: scoped.filter((item) => item.score >= 85).length },
    ];
    const skillMap = new Map<string, { demand: number; total: number }>();
    scoped.forEach((candidate) => candidate.skills.forEach((skill) => {
      const current = skillMap.get(skill) ?? { demand: 0, total: 0 };
      skillMap.set(skill, { demand: current.demand + 1, total: current.total + candidate.score });
    }));
    return {
      totalCandidates: scoped.length,
      completionRate: candidates.length ? Math.round((completed.length / candidates.length) * 100) : 0,
      averageScore,
      timeToHireDays: 0,
      exportableRows: scoped.length,
      funnel: counts,
      scoreDistribution: bands,
      topSkills: [...skillMap.entries()].sort((a, b) => b[1].demand - a[1].demand).slice(0, 5).map(([skill, value]) => ({ skill, demand: value.demand, averageScore: value.demand ? Math.round(value.total / value.demand) : 0 })),
      weeklyTrend: [],
    };
  },

  async overrideCandidateScore(campaignId: string, candidateId: string, score: number, note: string): Promise<CandidateReport> {
    if (note.trim().length < 20) throw new Error('OVERRIDE_NOTE_TOO_SHORT');
    const { candidate, result } = await findCandidate(campaignId, candidateId);
    if (!result) throw new Error('REPORT_NOT_FOUND');
    await campaignManagementService.overrideCampaignResult(campaignId, result.sessionId, {
      score,
      result: score >= 70 ? 'Pass' : 'Fail',
      note,
    });
    return toReport(candidate, { ...result, overrideScore: score, overrideNote: note, totalScore: score }, undefined);
  },

  async exportAnalytics(campaignId: string, format: ExportFormat, rowCount: number): Promise<ExportResult> {
    if (rowCount > 10000) return { ok: false, async: true, messageKey: 'employerAnalytics.export.tooLarge' };
    const { blob, filename } = await campaignManagementService.exportCampaignResults(campaignId, format);
    triggerDownload(blob, filename || `campaign-results.${format}`);
    return { ok: true, async: false, messageKey: format === 'csv' ? 'employerAnalytics.export.csvReady' : 'employerAnalytics.export.pdfReady' };
  },
};
