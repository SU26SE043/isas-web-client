import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { RubricPreviewRun, UseQuestionPreviewApi } from '../types/rubricPreview.types';
import { freeRunsForQuestion } from '../utils/rubricPreviewVerdict';
import { getRubricPreviewHistory } from '../services/campaignRubricPreview.service';
import { rubricPreviewQueryKey, useRubricPreview } from './useRubricPreview';

const EMPTY_RUNS: RubricPreviewRun[] = [];

export type UseQuestionPreviewArgs = {
  campaignId: string | null;
  /**
   * `null` = KHÔNG lọc theo câu — trả nguyên lịch sử của cả campaign (bề mặt "tất cả câu"), khớp
   * `useRubricPreview`'s hành vi. Một GUID câu hỏi thật ⇒ chỉ trả lượt của ĐÚNG câu đó.
   */
  questionId: string | null;
  /** `EmployerCampaign.rubricVersion` hiện hành — biết quota của lượt cũ có còn đáng tin hay đã sang bản mới. */
  currentRubricVersion?: number | null;
  /** Xem `useRubricPreview` — lưu thước đo + câu hỏi lên server TRƯỚC khi POST. */
  beforeRun?: () => Promise<string | null>;
};

function selectRunsForQuestion(
  data: RubricPreviewRun[] | undefined,
  questionId: string | null,
): RubricPreviewRun[] {
  const runs = data ?? EMPTY_RUNS;
  return questionId == null ? runs : runs.filter((run) => run.questionId === questionId);
}

/**
 * SC2 — chấm thử THEO CÂU. Xây trên `useRubricPreview` (dùng lại `run`/`error`/`clearError`/lịch sử
 * TẢI) + một quan sát `useQuery` RIÊNG cùng `queryKey`/`queryFn` với `select` lọc theo câu — TanStack
 * dedupe request theo key nên vẫn CHỈ MỘT lần gọi mạng (`vẫn 1 query cache chung`), và `select` được
 * bọc `useCallback` để không chạy lại vô ích khi `data` chưa đổi (TanStack chỉ re-run `select` khi
 * `data` đổi HOẶC tham chiếu hàm `select` đổi).
 *
 * Nhiều instance của hook này (một / câu hỏi) có thể cùng render trên một trang — mỗi instance chỉ
 * re-render khi PHẦN của NÓ (lượt của đúng câu đó) đổi nội dung, không phải mỗi khi MỘT câu bất kỳ
 * trong campaign có lượt mới.
 */
export function useQuestionPreview({
  campaignId,
  questionId,
  currentRubricVersion = null,
  beforeRun,
}: UseQuestionPreviewArgs): UseQuestionPreviewApi {
  const base = useRubricPreview({ campaignId, beforeRun });

  const select = useCallback(
    (data: RubricPreviewRun[]) => selectRunsForQuestion(data, questionId),
    [questionId],
  );

  const scoped = useQuery({
    queryKey: rubricPreviewQueryKey(campaignId),
    queryFn: () => getRubricPreviewHistory(campaignId as string),
    enabled: Boolean(campaignId),
    select,
  });

  const runs = scoped.data ?? EMPTY_RUNS;
  const latest = runs[0] ?? null;
  // "Bất kỳ lượt Running nào TRONG TOÀN CHIẾN DỊCH" — `base.latest` là lượt MỚI NHẤT không lọc theo
  // câu (BE chỉ cho phép 1 lượt Running/campaign tại một thời điểm, 409 nếu đang có lượt khác chạy).
  const runningQuestionId = base.latest?.status === 'Running' ? base.latest.questionId : null;

  const run = useCallback(
    (customAnswer?: string | null) => base.run({ questionId, customAnswer: customAnswer ?? null }),
    [base.run, questionId],
  );

  return {
    runs,
    latest,
    isLoadingHistory: base.isLoadingHistory,
    isRunning: base.isRunning,
    runningQuestionId,
    freeRunsRemaining: freeRunsForQuestion(runs, currentRubricVersion, questionId),
    error: base.error,
    run,
    clearError: base.clearError,
  };
}
