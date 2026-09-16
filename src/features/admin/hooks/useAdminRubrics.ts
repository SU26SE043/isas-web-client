import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminRubricService } from '../services/adminRubric.service';
import type { AdminRubricJobCategory, AdminRubricLanguage, AdminRubricPreviewRequest, AdminRubricUpsertInput } from '../types/adminApi.types';

export const adminRubricKeys = {
  all: ['admin-rubrics'] as const,
  matrix: () => ['admin-rubrics', 'matrix'] as const,
  detail: (category: string, language: string) => ['admin-rubrics', category, language] as const,
  history: (category: string, language: string) => ['admin-rubrics', 'history', category, language] as const,
  previewHistory: (category: string, language: string) => ['admin-rubrics', 'preview-history', category, language] as const,
};
const retry = (count: number, error: unknown) => getApiStatusCode(error) === 401 || getApiStatusCode(error) === 403 ? false : count < 2;

export function useAdminRubrics(category: AdminRubricJobCategory, language: AdminRubricLanguage) {
  const queryClient = useQueryClient();
  const matrix = useQuery({ queryKey: adminRubricKeys.matrix(), queryFn: () => adminRubricService.list(), retry });
  const detail = useQuery({ queryKey: adminRubricKeys.detail(category, language), queryFn: () => adminRubricService.get(category, language), retry });
  const history = useQuery({ queryKey: adminRubricKeys.history(category, language), queryFn: () => adminRubricService.history(category, language), retry });
  const previewHistory = useQuery({ queryKey: adminRubricKeys.previewHistory(category, language), queryFn: () => adminRubricService.previewHistory(category, language), retry });
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminRubricKeys.all });
  const update = useMutation({ mutationFn: (input: AdminRubricUpsertInput) => adminRubricService.update(category, language, input), onSuccess: refresh });
  const reset = useMutation({ mutationFn: () => adminRubricService.reset(category, language), onSuccess: refresh });
  const suggest = useMutation({ mutationFn: (seniority?: string) => adminRubricService.suggest(category, language, seniority) });
  // Lượt chấm thử (kể cả Failed) là một dòng lịch sử mới ⇒ nạp lại lịch sử sau MỌI kết cục.
  const preview = useMutation({
    mutationFn: (input: AdminRubricPreviewRequest) => adminRubricService.preview(category, language, input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminRubricKeys.previewHistory(category, language) }),
  });
  return { matrix, detail, history, previewHistory, update, reset, suggest, preview };
}
