import { useQuery } from '@tanstack/react-query';
import { cvAnalysisService } from '../services/cvAnalysis.service';

export function cvAnalysisDetailQueryKey(analysisId: string) {
  return ['cv-analysis', 'detail', analysisId] as const;
}

export function useCvAnalysisDetail(analysisId: string | null, enabled = true) {
  return useQuery({
    queryKey: analysisId ? cvAnalysisDetailQueryKey(analysisId) : ['cv-analysis', 'detail', 'none'],
    queryFn: () => cvAnalysisService.getAnalysisResult(analysisId ?? undefined),
    enabled: Boolean(analysisId && enabled),
    staleTime: 5 * 60_000,
  });
}
