import { useCallback, useEffect, useState } from 'react';
import { fetchInterviewHistory } from '../services/history.service';
import type { InterviewHistoryItem } from '../types/history.types';

export function useInterviewHistory() {
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchInterviewHistory();
      setInterviews(response.interviews);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInterviews();
  }, [loadInterviews]);

  const refresh = useCallback(() => {
    void loadInterviews();
  }, [loadInterviews]);

  return { interviews, isLoading, refresh };
}
