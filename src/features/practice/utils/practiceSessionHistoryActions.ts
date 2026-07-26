import type {
  InterviewHistoryItem,
  PracticeHistorySort,
  PracticeHistoryStatusFilter,
  PracticeHistoryStatusGroup,
  PracticeSessionHistoryItem,
} from '../types/history.types';

export function getPracticeHistoryStatusGroup(
  status: string,
): PracticeHistoryStatusGroup {
  const normalizedStatus = status.trim().toLowerCase().replace(/[\s_-]+/g, '');

  if (
    normalizedStatus === 'completed' ||
    normalizedStatus === 'scored' ||
    normalizedStatus === 'done'
  ) {
    return 'completed';
  }

  if (
    normalizedStatus === 'inprogress' ||
    normalizedStatus === 'practicing' ||
    normalizedStatus === 'started' ||
    normalizedStatus === 'created'
  ) {
    return 'inProgress';
  }

  if (
    normalizedStatus === 'submitted' ||
    normalizedStatus === 'processing' ||
    normalizedStatus === 'scoring' ||
    normalizedStatus === 'pending'
  ) {
    return 'pendingScore';
  }

  if (
    normalizedStatus === 'failed' ||
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'canceled' ||
    normalizedStatus === 'expired'
  ) {
    return 'failed';
  }

  return 'unknown';
}

export function clampPracticeHistoryLimit(limit?: number): number {
  const value = limit ?? 20;
  return Math.min(Math.max(value, 1), 500);
}

export function formatSessionDateTime(value?: string | null, locale = 'vi'): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatSessionDuration(
  createdAt: string,
  completedAt?: string | null,
): number | null {
  if (!completedAt) return null;
  const start = new Date(createdAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return Math.round((end - start) / 60000);
}

export function formatDurationLabel(
  minutes: number | null,
  t: (key: string) => string,
): string {
  if (minutes == null) return t('practice.history.durationUnknown');
  if (minutes < 60) {
    return t('practice.history.durationMinutes').replace('{{n}}', String(minutes));
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins <= 0) {
    return t('practice.history.durationHours').replace('{{n}}', String(hours));
  }
  return t('practice.history.durationHoursMinutes')
    .replace('{{h}}', String(hours))
    .replace('{{m}}', String(mins));
}

export function formatOverallScoreLabel(
  score?: number | null,
  t?: (key: string) => string,
): string {
  if (score === null || score === undefined) {
    return t ? t('practice.history.scoreUnavailable') : '—';
  }
  return `${Number(score).toFixed(1)} / 100`;
}

export function filterAndSortPracticeHistory(
  items: PracticeSessionHistoryItem[],
  options: {
    search: string;
    status: PracticeHistoryStatusFilter;
    sort: PracticeHistorySort;
    datePrefix?: string;
  },
): PracticeSessionHistoryItem[] {
  const keyword = options.search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (keyword && !item.jobCategory.toLowerCase().includes(keyword)) return false;
    if (options.status !== 'all') {
      if (getPracticeHistoryStatusGroup(item.status) !== options.status) return false;
    }
    if (options.datePrefix && !item.createdAt.startsWith(options.datePrefix)) return false;
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (options.sort) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'scoreDesc': {
        const aScore = a.overallScore;
        const bScore = b.overallScore;
        if (aScore == null && bScore == null) return 0;
        if (aScore == null) return 1;
        if (bScore == null) return -1;
        return bScore - aScore;
      }
      case 'scoreAsc': {
        const aScore = a.overallScore;
        const bScore = b.overallScore;
        if (aScore == null && bScore == null) return 0;
        if (aScore == null) return 1;
        if (bScore == null) return -1;
        return aScore - bScore;
      }
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  return sorted;
}

export function mapPracticeHistoryToInterviewItem(
  item: PracticeSessionHistoryItem,
): InterviewHistoryItem {
  const group = getPracticeHistoryStatusGroup(item.status);
  const uiStatus =
    group === 'completed' ? 'completed' : group === 'inProgress' ? 'in-progress' : 'pending';
  const duration = formatSessionDuration(item.createdAt, item.completedAt) ?? 0;

  return {
    id: item.id,
    jobTitle: item.jobCategory || 'Practice session',
    company: '',
    date: item.createdAt,
    status: uiStatus,
    overallScore: item.overallScore ?? 0,
    duration,
    domainId: '',
    level: 'junior',
    deletedAt: null,
    jobCategory: item.jobCategory,
    createdAt: item.createdAt,
    completedAt: item.completedAt ?? null,
    rawStatus: item.status,
    overallScoreNullable: item.overallScore ?? null,
  };
}

export function computePracticeHistoryPageStats(items: PracticeSessionHistoryItem[]) {
  const completed = items.filter(
    (item) => getPracticeHistoryStatusGroup(item.status) === 'completed',
  ).length;
  const inProgress = items.filter(
    (item) => getPracticeHistoryStatusGroup(item.status) === 'inProgress',
  ).length;
  const scored = items.filter((item) => item.overallScore != null);
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum, item) => sum + (item.overallScore ?? 0), 0) / scored.length
      : null;
  return {
    pageCount: items.length,
    completed,
    inProgress,
    avgScore,
  };
}

