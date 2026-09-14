import * as React from 'react';
import { FlaskConical, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion } from '../../../types/campaignManagement.types';
import type { QuestionPreviewContext } from '../../../types/questionPreview.types';
import type { RubricPreviewBlocker, UseQuestionPreviewApi } from '../../../types/rubricPreview.types';
import { computeBlocker, scopedCriteriaForQuestion } from '../../../utils/rubricPreviewVerdict';
import { projectRunToCriteria, scopedCriterionIdsForRun } from '../../../utils/questionPreviewScope';
import { RubricPreviewHistory, runNumberOf } from '../preview/RubricPreviewHistory';
import { RubricPreviewResult } from '../preview/RubricPreviewResult';
import { QuestionPreviewRunControls } from './QuestionPreviewRunControls';

export interface QuestionPreviewPanelProps {
  question: CampaignQuestion;
  /** Vị trí 0-based trong toàn bộ danh sách — hiện "#k" (1-based) cho người đọc. */
  index: number;
  ctx: QuestionPreviewContext;
  preview: UseQuestionPreviewApi;
  /** Màn đang bận (AI sinh / đang lưu) — chỉ khoá nút, không đổi lý do chặn. */
  disabled?: boolean;
}

/**
 * SC2 · T9 — chấm thử THEO CÂU bên trong card bước 4 (D-1). Nhận `preview` qua props (Mount nối hook), nên
 * test không cần QueryClient. I6: chỉ lọc TIÊU CHÍ HIỂN THỊ theo `run.scopedCriterionIds` — không tính lại điểm.
 * I7: mọi lý do chặn tính ở FE trước khi gọi API; hết lượt miễn phí ⇒ hỏi trước (trong RunControls).
 */
export function QuestionPreviewPanel({ question, index, ctx, preview, disabled = false }: QuestionPreviewPanelProps) {
  const { t } = useLanguage();
  const [selectedRunId, setSelectedRunId] = React.useState<string | null>(null);
  const { runs, latest } = preview;
  const runningOther = ctx.runningQuestionId != null && ctx.runningQuestionId !== question.id;
  const anyRunning = preview.isRunning || ctx.runningQuestionId != null;
  const scoped = scopedCriteriaForQuestion(ctx.rubric, question);
  const blocker: RubricPreviewBlocker | null = computeBlocker({
    campaignId: ctx.campaignId,
    canPersist: Boolean(ctx.beforeRun),
    campaignStatus: ctx.campaignStatus,
    rubric: ctx.rubric,
    scopedCriteria: scoped,
    questions: ctx.questions,
    isRunning: anyRunning,
  });
  const emptyPrompt = !question.prompt.trim();

  const blockedReason = (): string | null => {
    if (runningOther) {
      const position = ctx.questions.findIndex((item) => item.id === ctx.runningQuestionId);
      return t('employer.campaigns.questionCard.preview.blocked.runningOther').replace('{{n}}', String(position >= 0 ? position + 1 : '?'));
    }
    if (blocker?.kind === 'running') return null;
    if (blocker?.kind === 'missingLevels') {
      return t('employer.campaigns.rubricPreview.blocked.missingLevels').replace('{{criteria}}', blocker.criteria.join(', '));
    }
    if (blocker) return t(`employer.campaigns.rubricPreview.blocked.${blocker.kind}`);
    if (emptyPrompt) return t('employer.campaigns.questionCard.preview.blocked.emptyPrompt');
    return null;
  };
  const reason = blockedReason();
  const canRun = !blocker && !emptyPrompt && !runningOther;

  const handleRun = (customAnswer: string | null, confirmBilled: boolean) => {
    ctx.onRunningChange(question.id);
    // Chỉ đính tuỳ chọn khi có cờ — lượt miễn phí gọi `run(customAnswer)` y như trước.
    const pending = confirmBilled ? preview.run(customAnswer, { confirmBilled: true }) : preview.run(customAnswer);
    void pending
      .then((result) => { if (result) setSelectedRunId(null); })
      .finally(() => ctx.onRunningChange(null));
  };

  const viewing = (selectedRunId ? runs.find((run) => run.id === selectedRunId) : null) ?? latest;
  const scopedIds = viewing ? scopedCriterionIdsForRun(viewing, ctx.rubric, question) : null;
  const projected = viewing ? projectRunToCriteria(viewing, scopedIds) : null;
  const scopedCount = projected?.rubric.length ?? scoped.length;
  const totalCount = viewing?.rubric.length || ctx.rubric.length;

  const errorHeadline = preview.error ? t(`employer.campaigns.rubricPreview.error.${preview.error.code}`) : '';
  const errorDetail = preview.error?.message && preview.error.message !== errorHeadline ? preview.error.message : null;

  return (
    <section className="frame-satin space-y-3 rounded-xl bg-surface-raised p-3" aria-label={t('employer.campaigns.questionCard.preview.title')} data-testid="question-preview-panel">
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FlaskConical className="size-4" aria-hidden />
          {t('employer.campaigns.questionCard.preview.title')}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">{t('employer.campaigns.questionCard.preview.description')}</p>
        <p className="text-xs text-muted-foreground" data-testid="question-preview-scoped">
          {t('employer.campaigns.questionCard.preview.scoped').replace('{{n}}', String(scopedCount)).replace('{{total}}', String(totalCount))}
        </p>
        {reason ? <p className="text-xs font-medium text-warning" data-testid="question-preview-blocked">{reason}</p> : null}
        {blocker?.kind === 'missingLevels' && ctx.onGoToCriteria ? (
          <Button type="button" size="sm" variant="outline" onClick={ctx.onGoToCriteria}>
            {t('employer.campaigns.rubricPreview.goToCriteria')}
          </Button>
        ) : null}
      </div>

      {preview.error ? (
        <Alert variant="error" data-testid="question-preview-error">
          <AlertDescription className="flex flex-wrap items-start justify-between gap-2">
            <span className="min-w-0 space-y-0.5">
              <span className="block">{errorHeadline}</span>
              {errorDetail ? <span className="block text-xs opacity-80">{errorDetail}</span> : null}
            </span>
            <Button type="button" size="sm" variant="ghost" onClick={preview.clearError}>
              {t('employer.campaigns.rubricPreview.error.dismiss')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {preview.isRunning && !runningOther ? (
        <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('employer.campaigns.questionCard.previewRunning').replace('{{n}}', String(index + 1))}
        </div>
      ) : null}

      <QuestionPreviewRunControls
        questionId={question.id}
        sampleAnswer={question.sampleAnswer ?? ''}
        savesBeforeRun={Boolean(ctx.beforeRun)}
        requireConfirm={Boolean(ctx.beforeRun) && ctx.campaignStatus === 'active'}
        currentRubricVersion={ctx.currentRubricVersion}
        freeRunsLeft={preview.freeRunsRemaining}
        billingConfirmPending={preview.billingConfirm != null}
        onCancelBillingConfirm={preview.clearBillingConfirm}
        disabled={disabled || !canRun}
        isRunning={anyRunning}
        onRun={handleRun}
      />

      {projected && viewing ? (
        <RubricPreviewResult
          run={projected}
          runNumber={runNumberOf(runs, viewing.id) || runs.length || 1}
          passScorePct={ctx.passScorePct}
          onEditLevels={ctx.onGoToCriteria}
          onBackToLatest={latest && viewing.id !== latest.id ? () => setSelectedRunId(null) : undefined}
          dimmed={preview.isRunning}
        />
      ) : null}

      {latest && viewing ? (
        <RubricPreviewHistory runs={runs} latest={latest} viewingId={viewing.id} isLoading={preview.isLoadingHistory} onOpen={setSelectedRunId} />
      ) : null}
    </section>
  );
}
