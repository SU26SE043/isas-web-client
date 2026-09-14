import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { RubricPreviewError, RubricPreviewRequest, RubricPreviewRun, UseQuestionPreviewApi } from '../types/rubricPreview.types';
import { isServerEntityId } from '../utils/campaignQuestionLimits';
import { freeRunsForQuestion, RUBRIC_PREVIEW_HISTORY_WINDOW } from '../utils/rubricPreviewVerdict';
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
  /**
   * SC2 · T9 — SAU `beforeRun`, câu đúc cục bộ (`client-…`) đã được server cấp id thật, nhưng `run` giữ
   * `questionId` từ lúc bấm nút. Không hỏi lại thì `useRubricPreview` lọc id không-GUID thành `null` ⇒ BE
   * chấm CÂU ĐẦU TIÊN ⇒ kết quả rơi vào card khác, im lặng. Wizard truyền hàm tra bảng alias local→server
   * (`useCampaignWizard.resolveQuestionId`); trang chi tiết (mọi câu đã có id server) không cần.
   */
  resolveQuestionId?: (localId: string) => string;
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
  resolveQuestionId,
}: UseQuestionPreviewArgs): UseQuestionPreviewApi {
  // Request đang bay — `useRubricPreview.run` đọc `input.questionId` SAU `await beforeRun()` (rồi mới lọc
  // GUID + spread vào body), nên ghi id đã resolve vào CHÍNH object này là đủ để POST mang id server.
  // Test `useQuestionPreview.test.tsx` khoá thứ tự đó; đổi `useRubricPreview` đọc id trước await ⇒ test ĐỎ.
  const pendingRef = useRef<RubricPreviewRequest | null>(null);
  const [localError, setLocalError] = useState<RubricPreviewError | null>(null);
  const wrappedBeforeRun = useMemo(() => {
    if (!beforeRun) return undefined;
    return async (): Promise<string | null> => {
      const persisted = await beforeRun();
      if (!persisted) return null;
      const pending = pendingRef.current;
      if (pending && resolveQuestionId && pending.questionId) {
        const resolved = resolveQuestionId(pending.questionId);
        if (!isServerEntityId(resolved)) {
          // Lưu xong mà câu vẫn không có id server (không được PUT vì prompt rỗng, PUT hụt…) — KHÔNG để
          // `useRubricPreview` gửi `null` rồi BE chấm câu đầu tiên thay cho câu HR đang đứng (I7).
          setLocalError({ code: 'noQuestions', message: '' });
          return null;
        }
        pending.questionId = resolved;
      }
      return persisted;
    };
  }, [beforeRun, resolveQuestionId]);
  const base = useRubricPreview({ campaignId, beforeRun: wrappedBeforeRun });

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
    async (customAnswer?: string | null, options?: { confirmBilled?: boolean }) => {
      setLocalError(null);
      const input: RubricPreviewRequest = {
        questionId,
        customAnswer: customAnswer ?? null,
        // R3 — chỉ đính cờ khi HR đã đồng ý; vắng khoá = false (body lượt miễn phí giữ nguyên hình dạng).
        ...(options?.confirmBilled ? { confirmBilled: true } : {}),
      };
      pendingRef.current = input;
      try {
        return await base.run(input);
      } finally {
        pendingRef.current = null;
      }
    },
    [base.run, questionId],
  );
  const clearError = useCallback(() => {
    setLocalError(null);
    base.clearError();
  }, [base.clearError]);

  return {
    runs,
    latest,
    isLoadingHistory: base.isLoadingHistory,
    isRunning: base.isRunning,
    runningQuestionId,
    // R3(a) — `null` khi KHÔNG BIẾT: lịch sử đang tải, hoặc cửa sổ 20 lượt (TOÀN campaign — `base.runs`, không phải
    // `runs` đã lọc theo câu) đã đầy mà không thấy lượt của câu này ⇒ UI hỏi trước; BE đếm thật (409 nếu chưa xác nhận).
    freeRunsRemaining: freeRunsForQuestion(runs, currentRubricVersion, questionId, {
      historyLoading: base.isLoadingHistory,
      historyWindowFull: base.runs.length >= RUBRIC_PREVIEW_HISTORY_WINDOW,
    }),
    error: base.error ?? localError,
    billingConfirm: base.billingConfirm,
    clearBillingConfirm: base.clearBillingConfirm,
    run,
    clearError,
  };
}
