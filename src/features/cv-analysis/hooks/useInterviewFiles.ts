import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import type { FileRecord, InterviewFileType } from '../types/cvAnalysis.types';

export const INTERVIEW_FILES_QUERY_KEY = ['cv-analysis', 'files'] as const;

export interface UseInterviewFilesParams {
  /** Filtered in SQL by the backend — do not fetch everything and filter here (P14). */
  fileType?: InterviewFileType;
  limit?: number;
}

export function interviewFilesQueryKey(params: UseInterviewFilesParams = {}) {
  return [
    ...INTERVIEW_FILES_QUERY_KEY,
    { fileType: params.fileType ?? null, limit: params.limit ?? null },
  ] as const;
}

export interface UseInterviewFilesResult {
  files: FileRecord[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  /** `X-Next-Cursor` was present on the last page (P21). */
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;
}

/**
 * Uploaded CV/JD files.
 *
 * The `{ files, isLoading, error, reload }` shape is a contract with the
 * Profile and Report screens — extend it, never change it.
 */
export function useInterviewFiles(params: UseInterviewFilesParams = {}): UseInterviewFilesResult {
  const { fileType, limit } = params;
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: interviewFilesQueryKey({ fileType, limit }),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      cvAnalysisService.listFilesPage({
        ...(fileType ? { fileType } : {}),
        ...(limit ? { limit } : {}),
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const files = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const reload = useCallback(async () => {
    // Drop the cursor pages first so a reload cannot show a stale tail.
    await queryClient.resetQueries({ queryKey: interviewFilesQueryKey({ fileType, limit }) });
  }, [fileType, limit, queryClient]);

  const loadMore = useCallback(async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    await query.fetchNextPage();
  }, [query]);

  return {
    files,
    isLoading: query.isPending,
    error: query.error ? (query.error as Error).message || 'Could not load files.' : null,
    reload,
    hasMore: Boolean(query.hasNextPage),
    isLoadingMore: query.isFetchingNextPage,
    loadMore,
  };
}
