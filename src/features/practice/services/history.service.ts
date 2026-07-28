import { apiClient } from '@/shared/api/apiClient';
import { DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { mockDelay, usesMockData } from '@/shared/mock';
import type {
  GetPracticeSessionHistoryParams,
  InterviewHistoryItem,
  InterviewHistoryQuery,
  InterviewHistoryResponse,
  PracticeSessionHistoryItem,
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

function mapInterviewItemToPracticeHistoryItem(
  item: InterviewHistoryItem,
): PracticeSessionHistoryItem {
  const statusByLegacy: Record<InterviewHistoryItem['status'], string> = {
    completed: 'Scored',
    'in-progress': 'InProgress',
    pending: 'Scoring',
  };

  return {
    id: item.id,
    status: item.rawStatus ?? statusByLegacy[item.status] ?? item.status,
    jobCategory: item.jobCategory ?? item.jobTitle,
    createdAt: item.createdAt ?? item.date,
    completedAt:
      item.completedAt ?? (item.status === 'completed' ? item.date : null),
    overallScore: item.overallScoreNullable ?? item.overallScore,
  };
}

export async function getPracticeSessionHistory(
  params: GetPracticeSessionHistoryParams = {},
): Promise<PracticeSessionHistoryPage> {
  const limit = clampPracticeHistoryLimit(params.limit);

  if (usesMockData('practice')) {
    await mockDelay(300);
    const all = getVisibleInterviews(false).map(mapInterviewItemToPracticeHistoryItem);
    const start = params.cursor ? Number.parseInt(params.cursor, 10) || 0 : 0;
    const items = all.slice(start, start + limit);
    const nextOffset = start + limit;
    return {
      items,
      nextCursor: nextOffset < all.length ? String(nextOffset) : null,
    };
  }

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
  const pageSize = clampPracticeHistoryLimit(query.pageSize ?? DEFAULT_PAGE_SIZE);

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
