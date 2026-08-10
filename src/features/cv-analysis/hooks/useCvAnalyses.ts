import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import type { CvAnalysisResult } from '../types/cvAnalysis.types';
import type { CvAnalysisPage } from '../types/cvAnalysis.types';

export const CV_ANALYSES_QUERY_KEY = ['cv-analysis', 'list'] as const;

export function cvAnalysesPageQueryKey(cursor?: string, limit?: number) {
  return [...CV_ANALYSES_QUERY_KEY, { cursor: cursor ?? null, limit: limit ?? null }] as const;
}

export function useCvAnalyses() {
  return useQuery({
    queryKey: CV_ANALYSES_QUERY_KEY,
    queryFn: () => cvAnalysisService.listAnalyses(),
  });
}

export function useCvAnalysesPage(params?: { cursor?: string; limit?: number }) {
  return useQuery<CvAnalysisPage>({
    queryKey: cvAnalysesPageQueryKey(params?.cursor, params?.limit),
    queryFn: () => cvAnalysisService.listAnalysesPage(params),
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
