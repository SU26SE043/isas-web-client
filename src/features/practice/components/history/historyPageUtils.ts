import type { InterviewHistoryItem } from '../../types/history.types';

export const HISTORY_ITEMS_PER_PAGE = 5;

export const historyStatusConfig = {
  completed: {
    badge: 'bg-success-bg text-success',
    label: 'practice.history.status.completed',
  },
  'in-progress': {
    badge: 'bg-warning-bg text-warning',
    label: 'practice.history.status.inProgress',
  },
  pending: {
    badge: 'bg-surface-overlay text-muted-foreground',
    label: 'practice.history.status.pending',
  },
} as const;

export function getCompanyInitials(company: string): string {
  return company.charAt(0).toUpperCase();
}

const companyColors = [
  'bg-surface-raised',
  'bg-surface-overlay',
  'bg-surface-elevated',
  'bg-surface-highlight',
  'bg-surface-base',
];

export function getCompanyColor(index: number): string {
  return companyColors[index % companyColors.length];
}

export function formatInterviewDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(date)
    .replace(',', '');
}

export function formatInterviewDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function computeHistoryStats(interviews: InterviewHistoryItem[]) {
  const total = interviews.length;
  const completed = interviews.filter((i) => i.status === 'completed').length;
  const inProgress = interviews.filter((i) => i.status === 'in-progress').length;
  const scored = interviews.filter((i) => i.overallScore > 0);
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((sum, i) => sum + i.overallScore, 0) / scored.length)
      : 0;
  return { total, completed, inProgress, avgScore };
}
