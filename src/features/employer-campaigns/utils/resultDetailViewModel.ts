import type { CampaignResultItem, TranscriptQuestion } from '../types/campaign.api.types';

export function questionAverageScore(question: TranscriptQuestion): number | null {
  const scored = question.scores.filter((score) => score.maxScore != null && score.maxScore > 0);
  if (!scored.length) return null;
  const total = scored.reduce((sum, score) => sum + score.score, 0);
  const max = scored.reduce((sum, score) => sum + (score.maxScore ?? 0), 0);
  return max > 0 ? (total / max) * 10 : null;
}

export function formatDuration(seconds: number | null | undefined, language = 'vi'): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  return language === 'en' ? `${minutes}m ${rounded % 60}s` : `${minutes} phút ${rounded % 60} giây`;
}

export function totalAnswerDuration(questions: TranscriptQuestion[]): number | null {
  const durations = questions.map((question) => question.durationSec).filter((value): value is number => value != null && Number.isFinite(value));
  return durations.length ? durations.reduce((sum, value) => sum + value, 0) : null;
}

export function resultNeighbors(results: CampaignResultItem[], sessionId: string) {
  const index = results.findIndex((item) => item.sessionId === sessionId);
  return { previous: index > 0 ? results[index - 1] : null, next: index >= 0 && index < results.length - 1 ? results[index + 1] : null };
}

export const questionKindKeys = {
  Seed: 'employer.campaigns.results.detail.kind.seed',
  FollowUp: 'employer.campaigns.results.detail.kind.followUp',
  Clarify: 'employer.campaigns.results.detail.kind.clarify',
  NewQuestion: 'employer.campaigns.results.detail.kind.newQuestion',
} as const;
