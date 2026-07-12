export type PipelineStage = 'applied' | 'interviewed' | 'reviewed' | 'shortlisted' | 'rejected';
export type PipelineSortKey = 'rank' | 'score' | 'completedAt' | 'stage';
export type ScoreBand = 'all' | 'top' | 'mid' | 'risk';
export type ExportFormat = 'csv' | 'pdf';

export interface PipelineFilters {
  search: string;
  stage: PipelineStage | 'all';
  scoreBand: ScoreBand;
  sortBy: PipelineSortKey;
}

export interface PipelineCandidate {
  id: string;
  campaignId: string;
  candidateCode: string;
  name: string;
  email: string;
  role: string;
  stage: PipelineStage;
  score: number;
  rank: number;
  completedAt: string;
  location: string;
  experienceYears: number;
  skills: string[];
  summary: string;
  blindHiring: boolean;
  shortlisted: boolean;
  internalNotes: string[];
}

export interface CandidateReport {
  candidateId: string;
  reviewed: boolean;
  score: number;
  overrideScore: number | null;
  overrideNote: string | null;
  recommendation: 'strong_yes' | 'yes' | 'hold' | 'no';
  breakdown: Array<{ label: string; value: number }>;
  rubricEvidence: Array<{ criterion: string; weight: number; score: number; evidence: string }>;
  strengths: string[];
  risks: string[];
  transcriptHighlights: string[];
}

export interface AnalyticsFilters {
  dateRange: '30d' | '90d' | 'ytd';
  stage: PipelineStage | 'all';
}

export interface AnalyticsSnapshot {
  totalCandidates: number;
  completionRate: number;
  averageScore: number;
  timeToHireDays: number;
  exportableRows: number;
  funnel: Array<{ stage: PipelineStage; count: number }>;
  scoreDistribution: Array<{ band: string; count: number }>;
  topSkills: Array<{ skill: string; demand: number; averageScore: number }>;
  weeklyTrend: Array<{ week: string; completed: number; shortlisted: number }>;
}

export interface ExportResult {
  ok: boolean;
  async: boolean;
  messageKey: string;
}
