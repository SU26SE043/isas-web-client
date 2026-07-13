import { mockDelay, usesMockData } from '@/shared/mock';
import type {
  InterviewHistoryItem,
  InterviewHistoryQuery,
  InterviewHistoryResponse,
} from '../types/history.types';
import { MOCK_INTERVIEW_HISTORY } from '../mocks/history.fixtures';

let historyStore: InterviewHistoryItem[] = MOCK_INTERVIEW_HISTORY.map((item) => ({ ...item }));

function getVisibleInterviews(includeDeleted: boolean) {
  return historyStore.filter((item) => includeDeleted || !item.deletedAt);
}

export async function fetchInterviewHistory(
  query: InterviewHistoryQuery = {},
): Promise<InterviewHistoryResponse> {
  if (!usesMockData('practice')) {
    throw new Error('Practice history API is not wired yet. Keep usesMockData("practice") true.');
  }

  await mockDelay(300);

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const visible = getVisibleInterviews(query.includeDeleted ?? false);

  return {
    interviews: visible,
    total: visible.length,
    page,
    pageSize,
  };
}

export async function softDeleteInterview(interviewId: string): Promise<void> {
  if (!usesMockData('practice')) {
    throw new Error('Practice history API is not wired yet. Keep usesMockData("practice") true.');
  }

  await mockDelay(200);
  historyStore = historyStore.map((item) =>
    item.id === interviewId ? { ...item, deletedAt: new Date().toISOString() } : item,
  );
}

export async function restoreInterview(interviewId: string): Promise<void> {
  if (!usesMockData('practice')) {
    throw new Error('Practice history API is not wired yet. Keep usesMockData("practice") true.');
  }

  await mockDelay(200);
  historyStore = historyStore.map((item) =>
    item.id === interviewId ? { ...item, deletedAt: null } : item,
  );
}
