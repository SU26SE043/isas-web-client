export function formatSessionDuration(
  seconds?: number | null,
  labels?: {
    seconds: (n: number) => string;
    minutes: (n: number) => string;
    minutesSeconds: (m: number, s: number) => string;
  },
): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const total = Math.round(seconds);
  if (total < 60) {
    return labels?.seconds(total) ?? `${total}s`;
  }
  const minutes = Math.floor(total / 60);
  const rem = total % 60;
  if (rem === 0) {
    return labels?.minutes(minutes) ?? `${minutes}m`;
  }
  return labels?.minutesSeconds(minutes, rem) ?? `${minutes}m ${rem}s`;
}

export function formatResultDateTime(value?: string | null, locale = 'vi'): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatScore(score?: number | null, maxScore?: number | null): string {
  if (score == null || !Number.isFinite(score)) return '—';
  const max = maxScore != null && Number.isFinite(maxScore) ? maxScore : null;
  const scoreText = Number.isInteger(score) ? String(score) : score.toFixed(1);
  if (max == null) return scoreText;
  const maxText = Number.isInteger(max) ? String(max) : max.toFixed(1);
  return `${scoreText}/${maxText}`;
}

export function formatPercentage(value?: number | null): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return `${Math.round(value)}%`;
}

export function getSessionStatusGroup(
  status: string,
): 'completed' | 'graded' | 'inProgress' | 'cancelled' | 'processing' | 'unknown' {
  const normalized = status.trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (normalized === 'scored' || normalized === 'graded' || normalized === 'done') return 'graded';
  if (normalized === 'completed') return 'completed';
  if (
    normalized === 'inprogress' ||
    normalized === 'practicing' ||
    normalized === 'created' ||
    normalized === 'started'
  ) {
    return 'inProgress';
  }
  if (normalized === 'cancelled' || normalized === 'canceled') return 'cancelled';
  if (normalized === 'submitted' || normalized === 'scoring' || normalized === 'processing') {
    return 'processing';
  }
  return 'unknown';
}

export function getQuestionStatusGroup(
  status?: string | null,
  answered?: boolean,
): 'answered' | 'graded' | 'skipped' | 'processing' | 'failed' | 'unknown' {
  const normalized = (status ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (
    normalized === 'skipped' ||
    normalized === 'skip' ||
    normalized === 'unanswered' ||
    (!normalized && answered === false)
  ) {
    return 'skipped';
  }
  if (normalized === 'scored' || normalized === 'graded' || normalized === 'evaluated') {
    return 'graded';
  }
  if (normalized === 'answered' || normalized === 'submitted' || (!normalized && answered)) {
    return 'answered';
  }
  if (normalized === 'scoring' || normalized === 'processing' || normalized === 'pending') {
    return 'processing';
  }
  if (normalized === 'failed' || normalized === 'error') return 'failed';
  return 'unknown';
}

export function scoreTone(pct: number): 'high' | 'mid' | 'low' {
  if (pct >= 70) return 'high';
  if (pct >= 40) return 'mid';
  return 'low';
}
