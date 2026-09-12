import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isServerEntityId } from '../utils/campaignQuestionLimits';
import type {
  RubricPreviewError,
  RubricPreviewRequest,
  RubricPreviewRun,
  UseRubricPreviewApi,
} from '../types/rubricPreview.types';
import {
  getRubricPreviewHistory,
  mapRubricPreviewError,
  runRubricPreview,
} from '../services/campaignRubricPreview.service';

export const RUBRIC_PREVIEW_POLL_INTERVAL_MS = 5_000;

export function rubricPreviewQueryKey(campaignId: string | null) {
  return ['rubric-preview', campaignId] as const;
}

type UseRubricPreviewArgs = {
  campaignId: string | null;
  /**
   * Lưu thước đo + câu hỏi lên server TRƯỚC khi chấm (wizard chỉ PUT lúc Phát hành — không lưu
   * thì BE chấm bộ CŨ trong khi màn hình hiện bộ mới, sai im lặng). Trả null = đã có lỗi hiển thị
   * ở phía wizard, KHÔNG POST. Trả id = campaignId để POST (draft có thể vừa được tạo).
   */
  beforeRun?: () => Promise<string | null>;
};

const EMPTY_RUNS: RubricPreviewRun[] = [];

function latestOf(runs: RubricPreviewRun[]): RubricPreviewRun | null {
  return runs[0] ?? null;
}

/**
 * CAMP-19 — chấm thử thước đo. Lịch sử qua react-query; POST đồng bộ 20–60s qua mutation.
 * Poll GET mỗi 5s CHỈ khi lượt mới nhất còn `Running` (row Running tồn tại từ trước khi AI trả lời,
 * và sống sót kể cả khi tab HR đóng giữa chừng — reload là thấy).
 */
export function useRubricPreview({ campaignId, beforeRun }: UseRubricPreviewArgs): UseRubricPreviewApi {
  const queryClient = useQueryClient();
  const [error, setError] = useState<RubricPreviewError | null>(null);

  const history = useQuery({
    queryKey: rubricPreviewQueryKey(campaignId),
    queryFn: () => getRubricPreviewHistory(campaignId as string),
    enabled: Boolean(campaignId),
    refetchInterval: (query) => (
      latestOf(query.state.data ?? EMPTY_RUNS)?.status === 'Running'
        ? RUBRIC_PREVIEW_POLL_INTERVAL_MS
        : false
    ),
  });

  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: RubricPreviewRequest }) => runRubricPreview(id, input),
  });

  const runs = history.data ?? EMPTY_RUNS;
  const latest = useMemo(() => latestOf(runs), [runs]);
  const { mutateAsync, isPending } = mutation;

  const run = useCallback(async (input: RubricPreviewRequest): Promise<RubricPreviewRun | null> => {
    setError(null);
    let id = campaignId;
    if (beforeRun) {
      const persisted = await beforeRun();
      if (!persisted) return null;
      id = persisted;
    }
    if (!id) {
      setError({ code: 'notFound', message: '' });
      return null;
    }
    // Id câu hỏi đúc cục bộ (`question-N`, chưa qua PUT) không tồn tại trên server ⇒ BE 400 "không thuộc chiến
    // dịch"; null = BE tự lấy câu đầu tiên. Lọc theo HÌNH DẠNG GUID (cùng luật với tiêu chí ở create request).
    const questionId = isServerEntityId(input.questionId) ? input.questionId : null;
    try {
      const created = await mutateAsync({ id, input: { ...input, questionId } });
      const key = rubricPreviewQueryKey(id);
      // Ghi thẳng lượt vừa nhận vào cache (POST trả về đúng lượt đã xong) rồi mới đồng bộ lại lịch
      // sử — dùng id ĐÃ resolve, không phải closure: ở create mode `beforeRun` vừa mới tạo draft.
      queryClient.setQueryData<RubricPreviewRun[]>(key, (prev) => [
        created,
        ...(prev ?? []).filter((item) => item.id !== created.id),
      ]);
      await queryClient.invalidateQueries({ queryKey: key });
      return created;
    } catch (cause) {
      setError(mapRubricPreviewError(cause));
      // BE ghi lượt `Failed` (không tính quota, không trừ credit) TRƯỚC khi trả 502 ⇒ tải lại lịch sử để màn
      // hình khớp server ngay, không đợi reload. Lỗi 400/402/409 không tạo row — invalidate thừa là vô hại.
      await queryClient.invalidateQueries({ queryKey: rubricPreviewQueryKey(id) });
      return null;
    }
  }, [beforeRun, campaignId, mutateAsync, queryClient]);

  const clearError = useCallback(() => setError(null), []);

  return {
    runs,
    latest,
    isLoadingHistory: history.isLoading,
    isRunning: isPending || latest?.status === 'Running',
    freeRunsRemaining: latest?.freeRunsRemaining ?? null,
    error,
    run,
    clearError,
  };
}
