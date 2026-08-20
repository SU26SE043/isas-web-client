import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminInterviewService } from '../services/adminInterview.service';

export const adminPromptKeys = { all: ['admin-prompts'] as const, list: () => ['admin-prompts', 'list'] as const, history: (key: string) => ['admin-prompts', 'history', key] as const };
const retry = (count: number, error: unknown) => getApiStatusCode(error) === 401 || getApiStatusCode(error) === 403 ? false : count < 2;

export function useAdminPrompts(selectedKey?: string) {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: adminPromptKeys.list(), queryFn: adminInterviewService.listPrompts, retry });
  const history = useQuery({ queryKey: adminPromptKeys.history(selectedKey ?? ''), queryFn: () => adminInterviewService.getPromptHistory(selectedKey!), enabled: Boolean(selectedKey), retry });
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminPromptKeys.all });
  const update = useMutation({ mutationFn: ({ key, body, changeNote }: { key: string; body: string; changeNote: string }) => adminInterviewService.updatePrompt(key, { body, changeNote }), onSuccess: refresh });
  const reset = useMutation({ mutationFn: (key: string) => adminInterviewService.resetPrompt(key), onSuccess: refresh });
  return { list, history, update, reset };
}
