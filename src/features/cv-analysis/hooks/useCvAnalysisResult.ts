import { useCallback, useEffect, useState } from 'react';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import type { CvAnalysisResult } from '../types/cvAnalysis.types';
import { getApiErrorMessage } from '@/shared/api/apiError';

export function useCvAnalysisResult(analysisId?: string) {
  const [result, setResult] = useState<CvAnalysisResult | null>(null);
  const [history, setHistory] = useState<CvAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
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
      const items = await loadHistory();

      if (analysisId) {
        const fromHistory = items.find((item) => item.id === analysisId);
        if (fromHistory) {
          setResult(fromHistory);
        } else {
          const data = await cvAnalysisService.getAnalysisResult(analysisId);
          setResult(data);
        }
      } else if (items.length > 0) {
        setResult(items[0]);
      } else {
        setResult(null);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'failed'));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [analysisId, loadHistory]);

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
