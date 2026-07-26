import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import {
  fetchInterviewHistory,
  restoreInterview,
  softDeleteInterview,
} from '../services/history.service';
import type { InterviewHistoryItem } from '../types/history.types';

interface UseInterviewHistoryOptions {
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export function useInterviewHistory(options: UseInterviewHistoryOptions = {}) {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, includeDeleted = false } = options;
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchInterviewHistory({ page, pageSize, includeDeleted });
      setInterviews(response.interviews);
      setTotal(response.total);
    } catch {
      setError('load_failed');
      setInterviews([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [includeDeleted, page, pageSize]);

  useEffect(() => {
    void loadInterviews();
  }, [loadInterviews]);

  const refresh = useCallback(() => {
    void loadInterviews();
  }, [loadInterviews]);

  const hideInterview = useCallback(
    async (interviewId: string) => {
      await softDeleteInterview(interviewId);
      await loadInterviews();
    },
    [loadInterviews],
  );

  const restoreHiddenInterview = useCallback(
    async (interviewId: string) => {
      await restoreInterview(interviewId);
      await loadInterviews();
    },
    [loadInterviews],
  );

  return {
    interviews,
    total,
    isLoading,
    error,
    refresh,
    hideInterview,
    restoreHiddenInterview,
  };
}
