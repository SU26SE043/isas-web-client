import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminInterviewService } from '../services/adminInterview.service';
import type { CreateKnowledgeInput, IngestContext7Input } from '../types/adminApi.types';

export const adminKnowledgeKey = ['admin-knowledge'] as const;
const listKey = (params: { jobCategory?: string; cursor?: string; limit?: number }) => [...adminKnowledgeKey, 'list', params] as const;

export function useAdminKnowledgeList(params: { jobCategory?: string; cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: listKey(params),
    queryFn: () => adminInterviewService.listKnowledge(params),
    placeholderData: (previous) => previous,
    retry: (count, error) => { const status = getApiStatusCode(error); return status === 401 || status === 403 ? false : count < 2; },
  });
}

/** Mọi mutation xong ⇒ làm mới danh sách (số đoạn/số nguồn đổi). Tìm Context7 là mutation vì chỉ chạy khi bấm Tìm. */
export function useAdminKnowledgeActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminKnowledgeKey });
  const create = useMutation({ mutationFn: (input: CreateKnowledgeInput) => adminInterviewService.createKnowledge(input), onSuccess: () => void refresh() });
  const remove = useMutation({ mutationFn: (id: string) => adminInterviewService.deleteKnowledge(id), onSuccess: () => void refresh() });
  const reindex = useMutation({ mutationFn: (id: string) => adminInterviewService.reindexKnowledge(id), onSuccess: () => void refresh() });
  const search = useMutation({ mutationFn: ({ libraryName, query }: { libraryName: string; query?: string }) => adminInterviewService.searchContext7(libraryName, query) });
  const ingest = useMutation({ mutationFn: (input: IngestContext7Input) => adminInterviewService.ingestContext7(input), onSuccess: () => void refresh() });
  return { create, remove, reindex, search, ingest };
}
