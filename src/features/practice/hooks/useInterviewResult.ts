import { useCallback, useEffect, useState } from 'react';
import { resultService } from '../services/result.service';
import type { InterviewResult } from '../types/result.types';

type ResultLoadState = 'idle' | 'scoring' | 'loading' | 'ready' | 'error';

interface UseInterviewResultOptions {
  resultId: string;
  pollWhenScoring?: boolean;
}

export function useInterviewResult({ resultId, pollWhenScoring = true }: UseInterviewResultOptions) {
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [state, setState] = useState<ResultLoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const loadResult = useCallback(async () => {
    if (!resultId) return;

    setState('loading');
    setError(null);

    try {
      const data = await resultService.getInterviewResult(resultId);
      setResult(data);
      setState('ready');
    } catch {
      setError('load_failed');
      setState('error');
    }
  }, [resultId]);

  useEffect(() => {
    if (!resultId) return;

    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      if (!active) return;

      try {
        const status = await resultService.pollAssessmentStatus(resultId);

        if (!active) return;

        if (status.status === 'scoring' && pollWhenScoring) {
          setState('scoring');
          timeoutId = setTimeout(() => {
            void poll();
          }, 1500);
          return;
        }

        if (status.status === 'failed') {
          setError('scoring_failed');
          setState('error');
          return;
        }

        await loadResult();
      } catch {
        if (!active) return;
        setError('load_failed');
        setState('error');
      }
    };

    void poll();

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loadResult, pollWhenScoring, resultId]);

  return {
    result,
    state,
    error,
    reload: loadResult,
  };
}
