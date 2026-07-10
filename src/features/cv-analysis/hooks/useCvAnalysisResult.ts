import { useCallback, useEffect, useState } from 'react';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import type { CvAnalysisResult } from '../types/cvAnalysis.types';

export function useCvAnalysisResult(analysisId?: string) {
  const [result, setResult] = useState<CvAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cvAnalysisService.getAnalysisResult(analysisId);
      setResult(data);
    } catch {
      setError('failed');
    } finally {
      setIsLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { result, isLoading, error, reload: load };
}
