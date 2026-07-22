import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import type { AnalyzeCvRequest } from '../types/cvAnalysis.types';
import { cvAnalysisDetailQueryKey } from './useCvAnalysisDetail';
import { invalidateCvAnalyses, prependCvAnalysisToCache } from './useCvAnalyses';

export function useCreateCvAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AnalyzeCvRequest) => cvAnalysisService.createAnalysis(input),
    onSuccess: (created) => {
      prependCvAnalysisToCache(queryClient, created);
      queryClient.setQueryData(cvAnalysisDetailQueryKey(created.id), created);
      void invalidateCvAnalyses(queryClient);
    },
  });
}
