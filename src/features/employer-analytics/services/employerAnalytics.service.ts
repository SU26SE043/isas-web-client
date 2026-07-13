import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_ANALYTICS } from '../mocks/employerAnalytics.analytics.fixture';
import { MOCK_PIPELINE_CANDIDATES, MOCK_REPORTS, STATUS_ORDER } from '../mocks/employerAnalytics.fixtures';
import type {
  AnalyticsFilters,
  AnalyticsSnapshot,
  CandidateReport,
  ExportFormat,
  ExportResult,
  PipelineCandidate,
  PipelineFilters,
} from '../types/employerAnalytics.types';

let candidates: PipelineCandidate[] = structuredClone(MOCK_PIPELINE_CANDIDATES);
let reports: CandidateReport[] = structuredClone(MOCK_REPORTS);

function ensureMock() {
  if (!usesMockData('enterprise')) {
    throw new Error('Employer analytics API is not wired yet. Keep usesMockData("enterprise") true.');
  }
}

function inScoreBand(score: number, band: PipelineFilters['scoreBand']) {
  if (band === 'top') return score >= 85;
  if (band === 'mid') return score >= 70 && score < 85;
  if (band === 'risk') return score > 0 && score < 70;
  return true;
}

function sanitizeSearch(value: string) {
  return value.replace(/[<>]/g, '').trim().toLowerCase();
}

function sortCandidates(items: PipelineCandidate[], sortBy: PipelineFilters['sortBy']) {
  return [...items].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'completedAt') return (b.completedAt || '').localeCompare(a.completedAt || '');
    if (sortBy === 'status') return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    return a.rank - b.rank;
  });
}

export const employerAnalyticsService = {
  async listPipelineCandidates(campaignId: string, filters: PipelineFilters): Promise<PipelineCandidate[]> {
    ensureMock();
    await mockDelay(250);
    const search = sanitizeSearch(filters.search);
    const filtered = candidates.filter((candidate) => {
      const haystack = [
        candidate.candidateCode,
        candidate.name,
        candidate.email,
        candidate.role,
        candidate.status,
        candidate.location,
        ...candidate.skills,
      ].join(' ').toLowerCase();
      return (
        candidate.campaignId === campaignId &&
        (filters.status === 'all' || candidate.status === filters.status) &&
        inScoreBand(candidate.score, filters.scoreBand) &&
        (!search || haystack.includes(search))
      );
    });
    return structuredClone(sortCandidates(filtered, filters.sortBy));
  },

  async getCandidate(candidateId: string): Promise<PipelineCandidate | null> {
    ensureMock();
    await mockDelay(220);
    return structuredClone(candidates.find((candidate) => candidate.id === candidateId) ?? null);
  },

  async getCandidateReport(candidateId: string): Promise<CandidateReport | null> {
    ensureMock();
    await mockDelay(260);
    return structuredClone(reports.find((report) => report.candidateId === candidateId) ?? null);
  },

  async getAnalytics(_filters: AnalyticsFilters): Promise<AnalyticsSnapshot> {
    ensureMock();
    await mockDelay(280);
    return structuredClone(MOCK_ANALYTICS);
  },

  async overrideCandidateScore(candidateId: string, score: number, note: string): Promise<CandidateReport> {
    ensureMock();
    if (note.trim().length < 20) {
      throw new Error('OVERRIDE_NOTE_TOO_SHORT');
    }
    const report = reports.find((item) => item.candidateId === candidateId);
    if (!report) throw new Error('REPORT_NOT_FOUND');
    if (report.reviewed) throw new Error('REPORT_LOCKED');

    await mockDelay(420);
    reports = reports.map((item) => item.candidateId === candidateId ? { ...item, overrideScore: score, overrideNote: note } : item);
    candidates = candidates.map((item) => item.id === candidateId ? { ...item, score } : item);
    return structuredClone(reports.find((item) => item.candidateId === candidateId)!);
  },

  async exportAnalytics(format: ExportFormat, rowCount: number): Promise<ExportResult> {
    ensureMock();
    await mockDelay(300);
    if (rowCount > 10000) {
      return { ok: false, async: true, messageKey: 'employerAnalytics.export.tooLarge' };
    }
    return { ok: true, async: false, messageKey: format === 'csv' ? 'employerAnalytics.export.csvReady' : 'employerAnalytics.export.pdfReady' };
  },
};
