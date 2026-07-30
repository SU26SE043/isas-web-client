import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { getPracticeSessionHistory } from '../services/history.service';
import type { GetPracticeSessionHistoryParams } from '../types/history.types';

export const practiceHistoryKeys = {
  all: ['practice-session-history'] as const,
  list: (params: GetPracticeSessionHistoryParams) =>
    [...practiceHistoryKeys.all, params] as const,
};

export function usePracticeSessionHistory(params: GetPracticeSessionHistoryParams) {
  return useQuery({
    queryKey: practiceHistoryKeys.list({
      cursor: params.cursor || undefined,
      limit: params.limit ?? DEFAULT_PAGE_SIZE,
    }),
    queryFn: () =>
      getPracticeSessionHistory({
        cursor: params.cursor || undefined,
        limit: params.limit ?? DEFAULT_PAGE_SIZE,
      }),
    placeholderData: (previous) => previous,
  });
}
