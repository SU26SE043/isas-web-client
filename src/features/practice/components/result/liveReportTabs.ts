export type LiveReportTab = 'overview' | 'criteria' | 'questions' | 'summary';

export const LIVE_REPORT_TABS: readonly LiveReportTab[] = [
  'overview',
  'criteria',
  'questions',
  'summary',
] as const;

const TAB_LABEL_KEYS: Record<LiveReportTab, string> = {
  overview: 'practice.result.quickOverview',
  criteria: 'practice.result.quickCriteria',
  questions: 'practice.result.quickQuestions',
  summary: 'practice.result.quickFeedback',
};

export function liveReportTabLabelKey(tab: LiveReportTab): string {
  return TAB_LABEL_KEYS[tab];
}

export function parseLiveReportTab(value: string | null): LiveReportTab {
  if (value === 'overview' || value === 'criteria' || value === 'questions' || value === 'summary') {
    return value;
  }
  return 'overview';
}

/** URL uses 1-based question numbers; returns 0-based index. */
export function parseQuestionIndex(value: string | null, questionCount: number): number {
  if (questionCount <= 0) return 0;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 0;
  return Math.min(parsed - 1, questionCount - 1);
}
