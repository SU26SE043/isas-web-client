import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import type { CvAnalysisResult } from '../types/cvAnalysis.types';
import { cvAnalysisDetailQueryKey } from './useCvAnalysisDetail';

/**
 * Loads a single analysis via GET /practice/cv-analysis/{id}.
 * History list is optional (best-effort) when the catalogue endpoint exists.
 */
export function useCvAnalysisResult(analysisId?: string) {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<CvAnalysisResult | null>(null);
  const [history, setHistory] = useState<CvAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const items = await cvAnalysisService.listAnalyses();
      setHistory(items);
      return items;
    } catch {
      setHistory([]);
      return [] as CvAnalysisResult[];
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!analysisId) {
        setResult(null);
        setError('missing');
        return;
      }

      const cachedResult = queryClient.getQueryData<CvAnalysisResult>(
        cvAnalysisDetailQueryKey(analysisId),
      );
      if (cachedResult) {
        setResult(cachedResult);
        return;
      }

      const data = await cvAnalysisService.getAnalysisResult(analysisId);
      setResult(data);
      void loadHistory();
    } catch (err) {
      setError(getApiErrorMessage(err, 'failed'));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [analysisId, loadHistory, queryClient]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectFromHistory = useCallback((item: CvAnalysisResult) => {
    setResult(item);
    setError(null);
  }, []);

  return {
    result,
    history,
    isLoading,
    isHistoryLoading,
    error,
    reload: load,
    selectFromHistory,
  };
}
