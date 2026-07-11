import type { InterviewHistoryItem } from '@/features/practice/types/history.types';

export interface HeatmapCell {
  date: string;
  count: number;
  interviews: InterviewHistoryItem[];
  avgScore: number;
  inYear: boolean;
}

export type ActivityLevel = 0 | 1 | 2 | 3;

export function getActivityLevel(count: number): ActivityLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

export function groupInterviewsByDate(interviews: InterviewHistoryItem[]): Map<string, InterviewHistoryItem[]> {
  const map = new Map<string, InterviewHistoryItem[]>();
  for (const item of interviews) {
    const key = item.date.slice(0, 10);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildHeatmapWeeks(year: number, interviews: InterviewHistoryItem[]): HeatmapCell[][] {
  const byDate = groupInterviewsByDate(interviews);
  const weeks: HeatmapCell[][] = [];
  const yearEnd = new Date(year, 11, 31);
  const cursor = new Date(year, 0, 1);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  while (cursor <= yearEnd || cursor.getDay() !== 0) {
    const week: HeatmapCell[] = [];
    for (let day = 0; day < 7; day += 1) {
      const dateKey = toDateKey(cursor);
      const dayInterviews = byDate.get(dateKey) ?? [];
      const scored = dayInterviews.filter((item) => item.overallScore > 0);
      week.push({
        date: dateKey,
        count: dayInterviews.length,
        interviews: dayInterviews,
        avgScore:
          scored.length > 0
            ? Math.round(scored.reduce((sum, item) => sum + item.overallScore, 0) / scored.length)
            : 0,
        inYear: cursor.getFullYear() === year,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor > yearEnd && cursor.getDay() === 0) break;
  }

  return weeks;
}

export function getMonthLabels(year: number, weekCount: number): { label: string; column: number }[] {
  const labels: { label: string; column: number }[] = [];
  let lastMonth = -1;
  const cursor = new Date(year, 0, 1);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  for (let week = 0; week < weekCount; week += 1) {
    const month = cursor.getMonth();
    if (month !== lastMonth) {
      labels.push({
        label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(cursor),
        column: week,
      });
      lastMonth = month;
    }
    cursor.setDate(cursor.getDate() + 7);
  }

  return labels;
}

export interface InterviewActivityStats {
  total: number;
  averageScore: number;
  passed: number;
  failed: number;
}

const PASS_THRESHOLD = 70;

export function computeInterviewActivityStats(interviews: InterviewHistoryItem[]): InterviewActivityStats {
  const completed = interviews.filter((item) => item.status === 'completed');
  const scored = completed.filter((item) => item.overallScore > 0);
  const passed = completed.filter((item) => item.overallScore >= PASS_THRESHOLD);
  const failed = completed.filter(
    (item) => item.overallScore > 0 && item.overallScore < PASS_THRESHOLD,
  );

  const averageScore =
    scored.length > 0
      ? Math.round(scored.reduce((sum, item) => sum + item.overallScore, 0) / scored.length)
      : 0;

  return {
    total: interviews.length,
    averageScore,
    passed: passed.length,
    failed: failed.length,
  };
}

export const ACTIVITY_LEVEL_CLASS: Record<ActivityLevel, string> = {
  0: 'bg-surface-overlay',
  1: 'bg-emerald-950/80 ring-1 ring-emerald-900/50',
  2: 'bg-emerald-700/80',
  3: 'bg-emerald-500',
};
