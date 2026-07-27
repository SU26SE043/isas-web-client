import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import type {
  CampaignResultExportFormat,
  CampaignResultItem,
  CampaignResultStatus,
} from '../types/campaign.api.types';

export type ResultsOutcomeFilter = 'all' | 'pass' | 'fail' | 'undetermined';
export type ResultsReviewFilter =
  | 'all'
  | 'overridden'
  | 'notOverridden'
  | 'flagged'
  | 'notFlagged';
export type ResultsSort =
  | 'rankAsc'
  | 'rankDesc'
  | 'scoreDesc'
  | 'scoreAsc'
  | 'scoredDesc'
  | 'scoredAsc';

export function hasResultOverride(item: CampaignResultItem): boolean {
  return (
    item.overrideScore != null ||
    item.overrideResult != null ||
    Boolean(item.overrideNote?.trim()) ||
    Boolean(item.overriddenAt)
  );
}

export function formatResultScore(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatResultDateTime(value: string | null | undefined, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function downloadResultBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function defaultExportFileName(
  campaignId: string,
  format: CampaignResultExportFormat,
): string {
  return `campaign_${campaignId}_results.${format}`;
}

export function filterAndSortResults(
  results: CampaignResultItem[],
  options: {
    search: string;
    outcome: ResultsOutcomeFilter;
    review: ResultsReviewFilter;
    sort: ResultsSort;
  },
): CampaignResultItem[] {
  const query = options.search.trim().toLowerCase();
  const filtered = results.filter((item) => {
    if (query) {
      const name = (item.fullName ?? '').toLowerCase();
      const email = (item.email ?? '').toLowerCase();
      if (!name.includes(query) && !email.includes(query)) return false;
    }
    if (options.outcome === 'pass' && item.result !== 'Pass') return false;
    if (options.outcome === 'fail' && item.result !== 'Fail') return false;
    if (options.outcome === 'undetermined' && item.result != null) return false;
    const overridden = hasResultOverride(item);
    const flagged = item.flags.length > 0;
    if (options.review === 'overridden' && !overridden) return false;
    if (options.review === 'notOverridden' && overridden) return false;
    if (options.review === 'flagged' && !flagged) return false;
    if (options.review === 'notFlagged' && flagged) return false;
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (options.sort) {
      case 'rankDesc':
        return b.rank - a.rank;
      case 'scoreDesc':
        return b.totalScore - a.totalScore;
      case 'scoreAsc':
        return a.totalScore - b.totalScore;
      case 'scoredDesc':
        return new Date(b.scoredAt).getTime() - new Date(a.scoredAt).getTime();
      case 'scoredAsc':
        return new Date(a.scoredAt).getTime() - new Date(b.scoredAt).getTime();
      case 'rankAsc':
      default:
        return a.rank - b.rank;
    }
  });
  return sorted;
}

export function parseOverrideScoreInput(value: string): {
  score: number | null;
  error: boolean;
} {
  const trimmed = value.trim();
  if (!trimmed) return { score: null, error: false };
  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) return { score: null, error: true };
  return { score: parsed, error: false };
}

export function getResultsLoadErrorKey(error: unknown): string {
  const status = getApiStatusCode(error);
  if (status === 404) return 'employer.campaigns.results.errors.notFound';
  return 'employer.campaigns.results.errors.loadFailed';
}

export function getExportErrorKey(error: unknown): string {
  const status = getApiStatusCode(error);
  if (status === 400) return 'employer.campaigns.results.errors.exportBadFormat';
  if (status === 404) return 'employer.campaigns.results.errors.exportNotFound';
  return 'employer.campaigns.results.errors.exportFailed';
}

export function getTranscriptErrorKey(error: unknown): string {
  const status = getApiStatusCode(error);
  if (status === 404) return 'employer.campaigns.results.errors.transcriptNotFound';
  if (status === 502) return 'employer.campaigns.results.errors.transcriptUnavailable';
  return 'employer.campaigns.results.errors.transcriptFailed';
}

export function getOverrideErrorMessage(error: unknown, fallback: string): string {
  const status = getApiStatusCode(error);
  if (status === 400) {
    const backend = getApiErrorMessage(error, '');
    if (
      backend &&
      !/axios|status code|network error|request failed/i.test(backend)
    ) {
      return backend;
    }
    return fallback;
  }
  if (status === 404) return 'employer.campaigns.results.errors.overrideNotFound';
  return 'employer.campaigns.results.errors.overrideFailed';
}

export type OverrideResultChoice = CampaignResultStatus | 'keep';

export function toOverrideResultPayload(
  choice: OverrideResultChoice,
): 'Pass' | 'Fail' | null {
  if (choice === 'keep') return null;
  return choice;
}
