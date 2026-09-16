import { useMemo, useState } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { RubricPreviewHistory, runNumberOf } from '@/features/employer-campaigns/components/wizard/preview/RubricPreviewHistory';
import { RubricPreviewResult } from '@/features/employer-campaigns/components/wizard/preview/RubricPreviewResult';
import { useRubricTryFlow, type RubricTryQuestionInput } from '../../hooks/useRubricTryFlow';
import type { AdminRubricPreviewRequest, AdminRubricPreviewRun, AdminRubricSet } from '../../types/adminApi.types';
import { toEmployerPreviewRun } from '../../utils/adminRubricApi';
import { RubricTryAnswerInput } from './RubricTryAnswerInput';
import { RubricTryQuestionRow, type RubricTryQuestionState } from './RubricTryQuestionRow';
import { RubricTryYourScore } from './RubricTryYourScore';

interface AdminRubricPreviewPanelProps {
  rubric: AdminRubricSet;
  /** Có thay đổi chưa lưu ⇒ chấm thử vẫn chạy trên bản ĐÃ LƯU — phải nói ra, không chặn. */
  hasUnsavedChanges: boolean;
  preview: UseMutationResult<AdminRubricPreviewRun, unknown, AdminRubricPreviewRequest>;
  history: UseQueryResult<AdminRubricPreviewRun[], unknown>;
}

/**
 * "Tự thử thước đo" (BC-8): người dùng chọn câu hỏi → NÓI (hoặc dán) → sửa bản chép lời → CHẤM bằng
 * đúng bộ chấm thật → đọc kết quả BÀI CỦA MÌNH. 3 bài AI (yếu/khá/xuất sắc) là tuỳ chọn tắt mặc định.
 * Chủ sản phẩm chốt 2026-09-16: "3 bài mẫu không cần lắm — cái cần là tự tạo câu hỏi, tự trả lời
 * bằng giọng nói, xem hệ chấm mình thế nào".
 */
export function AdminRubricPreviewPanel({ rubric, hasUnsavedChanges, preview, history }: AdminRubricPreviewPanelProps) {
  const { t } = useLanguage();
  const [question, setQuestion] = useState<RubricTryQuestionState>({ mode: 'sample', sampleQuestionId: rubric.sampleQuestions[0]?.id ?? '', customQuestion: '', seniority: '' });
  const [pendingQuestion, setPendingQuestion] = useState<RubricTryQuestionState | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const flow = useRubricTryFlow({ category: rubric.jobCategory, language: rubric.language, preview });

  // Chỉ CẢNH BÁO, không chặn, và CHỈ với tiêu chí AI chấm: tiêu chí đo bằng số (`DeliveryMetrics`) cố ý
  // 0 mốc — BE không đòi (`MeasuredCriteriaSplit.ForAi`), nêu tên nó ở đây là báo thiếu một thứ không cần.
  const missingLevels = useMemo(
    () => rubric.criteria.filter((c) => c.scoringMethod !== 'DeliveryMetrics' && c.levels.length < 2).map((c) => c.name),
    [rubric.criteria],
  );
  const runs = history.data ?? [];
  const latest = preview.data ?? runs[0] ?? null;
  const viewing = (viewingId ? runs.find((run) => run.id === viewingId) : null) ?? latest;
  const freeRuns = latest && latest.rubricVersion === rubric.version ? latest.freeRunsRemaining : null;
  const employerRuns = useMemo(() => runs.map(toEmployerPreviewRun), [runs]);
  const questionKey = question.mode === 'custom' ? `custom:${question.customQuestion.trim()}` : `sample:${question.sampleQuestionId}`;
  const questionReady = question.mode === 'sample' ? Boolean(question.sampleQuestionId) || rubric.sampleQuestions.length === 0 : question.customQuestion.trim().length > 0;

  // Đổi câu hỏi khi ĐÃ có bài ⇒ bản ghi/bản chép mất theo (`useAudioRecorder` reset theo questionId) → hỏi trước.
  const requestQuestionChange = (next: RubricTryQuestionState) => {
    const onlySeniority = next.mode === question.mode && next.sampleQuestionId === question.sampleQuestionId && next.customQuestion === question.customQuestion;
    if (onlySeniority || !flow.hasAnswer) { setQuestion(next); return; }
    setPendingQuestion(next);
  };
  const confirmQuestionChange = () => { if (pendingQuestion) { setQuestion(pendingQuestion); flow.resetAnswer(); } setPendingQuestion(null); };

  const questionInput: RubricTryQuestionInput = {
    ...(question.mode === 'custom' ? { question: question.customQuestion.trim() } : question.sampleQuestionId ? { sampleQuestionId: question.sampleQuestionId } : {}),
    ...(question.seniority ? { seniority: question.seniority } : {}),
  };
  const grade = () => flow.grade(questionInput, () => setViewingId(null));
  // Admin không có ví ⇒ hết 5 lượt/phiên bản là hết thật; nút tắt và nói cách có lượt mới (lưu bản mới) thay vì để bấm rồi ăn 429.
  const canGrade = questionReady && flow.canGrade && freeRuns !== 0;
  const gradeLabel = freeRuns === null || freeRuns > 0
    ? t('admin.rubrics.try.run.free').replace('{count}', freeRuns === null ? '5' : String(freeRuns))
    : t('admin.rubrics.try.run.none');
  const errorKey = () => {
    const status = getApiStatusCode(preview.error);
    return status && [400, 404, 409, 429, 502].includes(status) ? `admin.rubrics.preview.error.${status}` : 'admin.rubrics.preview.error.default';
  };
  const viewingCustom = viewing?.samples.find((s) => s.band === 'Custom') ?? null;
  const viewingHasAi = Boolean(viewing?.samples.some((s) => s.band !== 'Custom'));

  return (
    <section className="space-y-5 rounded-xl border border-satin bg-surface-raised p-4" aria-label={t('admin.rubrics.try.title')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-foreground">{t('admin.rubrics.try.title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('admin.rubrics.try.description')}</p>
        </div>
        <span className="rounded-full border border-satin bg-surface-overlay px-3 py-1 text-xs tabular-nums text-muted-foreground">
          {freeRuns !== null
            ? t('admin.rubrics.preview.free').replace('{count}', String(freeRuns)).replace('{version}', String(rubric.version))
            : t('admin.rubrics.preview.freeUnknown').replace('{version}', String(rubric.version))}
        </span>
      </div>

      {missingLevels.length ? <Alert variant="warning"><AlertDescription>{t('admin.rubrics.preview.needsLevels').replace('{names}', missingLevels.join(', '))}</AlertDescription></Alert> : null}
      {hasUnsavedChanges ? <Alert variant="info"><AlertDescription>{t('admin.rubrics.preview.unsaved')}</AlertDescription></Alert> : null}

      <RubricTryQuestionRow rubric={rubric} value={question} onChange={requestQuestionChange} disabled={preview.isPending} />
      <RubricTryAnswerInput flow={flow} questionKey={questionKey} disabled={preview.isPending} />

      <div className="flex flex-wrap items-center justify-end gap-3">
        {preview.isPending ? <span className="mr-auto text-sm text-muted-foreground" role="status">{t('admin.rubrics.try.grading')}</span> : null}
        <Button type="button" onClick={grade} disabled={!canGrade} loading={preview.isPending}>{gradeLabel}</Button>
      </div>
      {preview.isError ? <Alert variant="error"><AlertDescription>{t(errorKey())} {getApiErrorMessage(preview.error, '')}</AlertDescription></Alert> : null}

      {viewing ? (
        <div className={`space-y-4 ${preview.isPending ? 'opacity-60' : ''}`} aria-busy={preview.isPending}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <p className="font-medium text-foreground">
              {t('admin.rubrics.try.result.run').replace('{n}', String(runNumberOf(employerRuns, viewing.id) || runs.length + 1))}
              <span className="font-normal text-muted-foreground"> · v{viewing.rubricVersion}</span>
            </p>
            <p className="text-muted-foreground">{t('admin.rubrics.try.result.question')}: {viewing.questionText}</p>
          </div>
          {latest && viewing.id !== latest.id ? <button type="button" className="text-xs text-info underline" onClick={() => setViewingId(null)}>{t('employer.campaigns.rubricPreview.result.backToLatest')}</button> : null}
          {viewingCustom ? <RubricTryYourScore run={viewing} sample={viewingCustom} /> : null}
          {viewingHasAi ? (
            <details className="rounded-xl border border-satin p-3" open={!viewingCustom}>
              <summary className="cursor-pointer text-sm font-medium text-foreground">{t('admin.rubrics.try.result.aiSection')}</summary>
              <div className="mt-3">
                <RubricPreviewResult run={toEmployerPreviewRun(viewing)} runNumber={runNumberOf(employerRuns, viewing.id) || runs.length + 1} passScorePct={null} dimmed={preview.isPending} />
              </div>
            </details>
          ) : null}
        </div>
      ) : null}
      {latest ? <RubricPreviewHistory runs={employerRuns} latest={toEmployerPreviewRun(latest)} viewingId={viewing?.id ?? latest.id} isLoading={history.isLoading} onOpen={setViewingId} /> : null}

      <ConfirmDialog
        open={pendingQuestion !== null}
        onOpenChange={(open) => { if (!open) setPendingQuestion(null); }}
        title={t('admin.rubrics.try.changeQuestion.title')}
        description={t('admin.rubrics.try.changeQuestion.description')}
        confirmLabel={t('admin.rubrics.try.changeQuestion.confirm')}
        cancelLabel={t('admin.rubrics.cancel')}
        destructive
        onConfirm={confirmQuestionChange}
      />
    </section>
  );
}
