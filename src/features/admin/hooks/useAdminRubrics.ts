import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminRubricService } from '../services/adminRubric.service';
import type { RubricPreviewInput, RubricSet } from '../types/adminApi.types';

export const adminRubricKeys = { all: ['admin-rubrics'] as const, matrix: (language: string) => ['admin-rubrics', 'matrix', language] as const, detail: (category: string, language: string) => ['admin-rubrics', category, language] as const, history: (category: string, language: string) => ['admin-rubrics', 'history', category, language] as const };
const retry = (count: number, error: unknown) => getApiStatusCode(error) === 401 || getApiStatusCode(error) === 403 ? false : count < 2;

export function useAdminRubrics(category: string, language: 'vi' | 'en') {
  const queryClient = useQueryClient();
  const matrix = useQuery({ queryKey: adminRubricKeys.matrix(language), queryFn: () => adminRubricService.list(language), retry });
  const detail = useQuery({ queryKey: adminRubricKeys.detail(category, language), queryFn: () => adminRubricService.get(category, language), enabled: Boolean(category), retry });
  const history = useQuery({ queryKey: adminRubricKeys.history(category, language), queryFn: () => adminRubricService.history(category, language), enabled: Boolean(category), retry });
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminRubricKeys.all });
  const update = useMutation({ mutationFn: (input: RubricSet) => adminRubricService.update(category, language, input), onSuccess: refresh });
  const reset = useMutation({ mutationFn: () => adminRubricService.reset(category, language), onSuccess: refresh });
  const suggest = useMutation({ mutationFn: (seniority?: string) => adminRubricService.suggest(category, language, seniority) });
  const preview = useMutation({ mutationFn: (input: RubricPreviewInput) => adminRubricService.preview(category, language, input) });
  return { matrix, detail, history, update, reset, suggest, preview };
}
