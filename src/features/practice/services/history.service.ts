import { apiClient } from '@/shared/api/apiClient';
import { mockDelay, usesMockData } from '@/shared/mock';
import type {
  GetPracticeSessionHistoryParams,
  InterviewHistoryItem,
  InterviewHistoryQuery,
  InterviewHistoryResponse,
  PracticeSessionHistoryPage,
} from '../types/history.types';
import { MOCK_INTERVIEW_HISTORY } from '../mocks/history.fixtures';
import { b2cPracticeSessionEndpoints } from './b2cPracticeSession.endpoints';
import { parsePracticeSessionHistoryPage } from '../utils/practiceSessionHistoryApi';
import {
  clampPracticeHistoryLimit,
  mapPracticeHistoryToInterviewItem,
} from '../utils/practiceSessionHistoryActions';

let historyStore: InterviewHistoryItem[] = MOCK_INTERVIEW_HISTORY.map((item) => ({ ...item }));

function getVisibleInterviews(includeDeleted: boolean) {
  return historyStore.filter((item) => includeDeleted || !item.deletedAt);
}

export async function getPracticeSessionHistory(
  params: GetPracticeSessionHistoryParams = {},
): Promise<PracticeSessionHistoryPage> {
  const limit = clampPracticeHistoryLimit(params.limit);
  const response = await apiClient.get<unknown>(b2cPracticeSessionEndpoints.history, {
    params: {
      cursor: params.cursor || undefined,
      limit,
    },
  });
  return parsePracticeSessionHistoryPage(response.data, response.headers);
}

/**
 * Legacy adapter used by roadmap wizard / reports hub.
 * Live mode maps practice session history into InterviewHistoryItem.
 */
export async function fetchInterviewHistory(
  query: InterviewHistoryQuery = {},
): Promise<InterviewHistoryResponse> {
  const page = query.page ?? 1;
  const pageSize = clampPracticeHistoryLimit(query.pageSize ?? 10);

  if (!usesMockData('practice')) {
    const pageData = await getPracticeSessionHistory({
      cursor: query.cursor || undefined,
      limit: pageSize,
    });
    return {
      interviews: pageData.items.map(mapPracticeHistoryToInterviewItem),
      total: pageData.items.length,
      page,
      pageSize,
      nextCursor: pageData.nextCursor,
    };
  }

  await mockDelay(300);
  const visible = getVisibleInterviews(query.includeDeleted ?? false);
  return {
    interviews: visible,
    total: visible.length,
    page,
    pageSize,
    nextCursor: null,
  };
}

export async function softDeleteInterview(interviewId: string): Promise<void> {
  if (!usesMockData('practice')) {
    throw new Error('Practice history hide is not supported by the live API.');
  }

  await mockDelay(200);
  historyStore = historyStore.map((item) =>
    item.id === interviewId ? { ...item, deletedAt: new Date().toISOString() } : item,
  );
}

export async function restoreInterview(interviewId: string): Promise<void> {
  if (!usesMockData('practice')) {
    throw new Error('Practice history restore is not supported by the live API.');
  }

  await mockDelay(200);
  historyStore = historyStore.map((item) =>
    item.id === interviewId ? { ...item, deletedAt: null } : item,
  );
}
