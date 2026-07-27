import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import type { CvAnalysisResult } from '../types/cvAnalysis.types';

export const CV_ANALYSES_QUERY_KEY = ['cv-analysis', 'list'] as const;

export function useCvAnalyses() {
  return useQuery({
    queryKey: CV_ANALYSES_QUERY_KEY,
    queryFn: () => cvAnalysisService.listAnalyses(),
  });
}

export function prependCvAnalysisToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  analysis: CvAnalysisResult,
) {
  queryClient.setQueryData<CvAnalysisResult[]>(CV_ANALYSES_QUERY_KEY, (current) => {
    const items = current ?? [];
    const without = items.filter((item) => item.id !== analysis.id);
    return [analysis, ...without];
  });
}

export function invalidateCvAnalyses(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: CV_ANALYSES_QUERY_KEY });
}
