import * as React from 'react';
import { FlaskConical, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, EmployerCampaignStatus, RubricCriterion } from '../../../types/campaignManagement.types';
import type { RubricPreviewBlocker, RubricPreviewRequest, UseRubricPreviewApi } from '../../../types/rubricPreview.types';
import { computeBlocker, computeVerdict, criteriaMissingLevels, freeRunsForVersion, hasVerifiedRun, latestSeenRubricVersion } from '../../../utils/rubricPreviewVerdict';
import { RubricPreviewHistory, runNumberOf } from './RubricPreviewHistory';
import { formatPct, RubricPreviewResult } from './RubricPreviewResult';
import { RubricPreviewRunForm } from './RubricPreviewRunForm';

export interface RubricPreviewCardProps {
  preview: UseRubricPreviewApi;
  campaignId: string | null;
  campaignStatus: EmployerCampaignStatus | null;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  passScorePct: number | null;
  /** `compact` = một dòng trạng thái + nút (bước 8). */
  variant?: 'full' | 'compact';
  /**
   * Wizard truyền hàm lưu (đã đưa vào hook qua `beforeRun`). Card KHÔNG gọi nó — chỉ dựa vào sự CÓ MẶT để
   * đổi nhãn thành "Lưu & chấm thử" và hỏi trước khi lưu lên campaign đang mở (tạo bản thước đo mới).
   */
  onBeforeRun?: () => Promise<string | null>;
  onGoToCriteria?: () => void;
  onGoToQuestions?: () => void;
  /** Bản thước đo hiện tại nếu campaign mang field đó; không có thì suy từ lượt mới nhất đã thấy. */
  currentRubricVersion?: number | null;
  className?: string;
}

export function RubricPreviewCard({
  preview,
  campaignId,
  campaignStatus,
  rubric,
  questions,
  passScorePct,
  variant = 'full',
  onBeforeRun,
  onGoToCriteria,
  onGoToQuestions,
  currentRubricVersion,
  className,
}: RubricPreviewCardProps) {
  const { t } = useLanguage();
  const [selectedRunId, setSelectedRunId] = React.useState<string | null>(null);
  const [rerunOpen, setRerunOpen] = React.useState(false);
  // "Mở" một lượt cũ render nó ở ĐẦU card (ngoài viewport khi lịch sử nằm dưới bảng) ⇒ cuộn lên, không thì bấm mà không thấy gì đổi.
  React.useEffect(() => {
    if (!selectedRunId) return;
    const anchor = document.getElementById('rubric-preview-title');
    if (anchor && typeof anchor.scrollIntoView === 'function') anchor.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [selectedRunId]);
  const { runs, latest, isRunning } = preview;
  const blocker = computeBlocker({ campaignId, canPersist: Boolean(onBeforeRun), campaignStatus, rubric, questions, isRunning });
  const viewing = (selectedRunId ? runs.find((run) => run.id === selectedRunId) : null) ?? latest;
  const version = currentRubricVersion ?? latestSeenRubricVersion(runs);
  const savesBeforeRun = Boolean(onBeforeRun);
  const requireConfirm = savesBeforeRun && campaignStatus === 'active';
  const freeLeft = freeRunsForVersion(preview.freeRunsRemaining, latest, version);

  const blockedReason = (item: RubricPreviewBlocker): string =>
    item.kind === 'missingLevels'
      ? t('employer.campaigns.rubricPreview.blocked.missingLevels').replace('{{criteria}}', item.criteria.join(', '))
      : t(`employer.campaigns.rubricPreview.blocked.${item.kind}`);

  const handleRun = (input: RubricPreviewRequest) => {
    void preview.run(input).then((result) => {
      if (result) {
        setSelectedRunId(null);
        setRerunOpen(false);
      }
    });
  };

  // Nguyên văn BE là tiếng kỹ thuật ("AIService /score-preview trả 502") — HR cần biết NÊN LÀM GÌ, chi tiết để dòng phụ.
  const errorHeadline = preview.error ? t(`employer.campaigns.rubricPreview.error.${preview.error.code}`) : '';
  const errorDetail = preview.error?.message && preview.error.message !== errorHeadline ? preview.error.message : null;
  const errorAlert = preview.error ? (
    <Alert variant="error" data-testid="preview-error">
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
  ) : null;

  const runningStatus = (
    <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {t('employer.campaigns.rubricPreview.running')}
    </div>
  );

  const form = (initialQuestionId: string | null, onCancel?: () => void) => (
    <RubricPreviewRunForm
      questions={questions}
      isRunning={isRunning}
      disabled={Boolean(blocker)}
      savesBeforeRun={savesBeforeRun}
      requireConfirm={requireConfirm}
      currentRubricVersion={version}
      freeRunsLeft={freeLeft}
      compact={variant === 'compact'}
      initialQuestionId={initialQuestionId}
      onRun={handleRun}
      onCancel={onCancel}
    />
  );

  if (variant === 'compact') {
    const verified = latest?.status === 'Succeeded' ? computeVerdict(latest, passScorePct) : null;
    // Cảnh báo MỀM (không chặn Phát hành): thước đo có mốc mà chưa lượt Succeeded nào ở bản hiện tại.
    const softWarning = !blocker && rubric.length > 0 && criteriaMissingLevels(rubric).length === 0 && !hasVerifiedRun(runs, version);
    return (
      <div className={cn('frame-satin space-y-2 rounded-xl bg-surface-overlay px-4 py-3', className)}>
        {softWarning ? (
          <Alert variant="warning" data-testid="preview-soft-warning">
            <AlertDescription>{t('employer.campaigns.rubricPreview.softWarning')}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FlaskConical className="size-4" aria-hidden />
              {t('employer.campaigns.rubricPreview.title')}
            </p>
            <p
              className={cn(
                'text-xs',
                blocker || verified?.verdict === 'inconclusive' ? 'text-warning' : verified?.verdict === 'weak' ? 'text-error' : verified ? 'text-success' : 'text-muted-foreground',
              )}
              data-testid="preview-compact-status"
            >
              {blocker
                ? blockedReason(blocker)
                : verified && latest
                  ? t('employer.campaigns.rubricPreview.compact.verified')
                      .replace('{{version}}', String(latest.rubricVersion))
                      .replace('{{verdict}}', t(`employer.campaigns.rubricPreview.verdict.${verified.verdict}`).replace('{{range}}', formatPct(verified.range)))
                  : t('employer.campaigns.rubricPreview.compact.none')}
            </p>
            {/* Kết luận xấu mà hành động duy nhất là chạy lại (tốn lượt) thì HR không sửa được gì ⇒ đưa đường về bước 3. */}
            {verified && verified.verdict !== 'discriminates' && onGoToCriteria ? (
              <button type="button" className="text-xs font-medium text-foreground underline underline-offset-4" onClick={onGoToCriteria}>
                {t('employer.campaigns.rubricPreview.compact.editLevels')}
              </button>
            ) : null}
          </div>
          {isRunning ? runningStatus : form(null)}
        </div>
        {errorAlert}
      </div>
    );
  }

  return (
    <section className={cn('frame-satin space-y-4 rounded-xl bg-surface-raised p-4', className)} aria-labelledby="rubric-preview-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 id="rubric-preview-title" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FlaskConical className="size-4" aria-hidden />
            {t('employer.campaigns.rubricPreview.title')}
          </h3>
          {/* Mô tả LUÔN hiện (lần đầu gặp HR phải biết tính năng làm gì); lý do chặn là dòng riêng, không thay thế mô tả. */}
          <div className="max-w-3xl space-y-1 text-sm leading-relaxed" data-testid="preview-description">
            <p className="text-muted-foreground">{t('employer.campaigns.rubricPreview.description')}</p>
            {blocker && blocker.kind !== 'running' ? <p className="font-medium text-warning">{blockedReason(blocker)}</p> : null}
          </div>
          {blocker?.kind === 'missingLevels' && onGoToCriteria ? (
            <Button type="button" size="sm" variant="outline" onClick={onGoToCriteria}>
              {t('employer.campaigns.rubricPreview.goToCriteria')}
            </Button>
          ) : null}
          {blocker?.kind === 'noQuestions' && onGoToQuestions ? (
            <Button type="button" size="sm" variant="outline" onClick={onGoToQuestions}>
              {t('employer.campaigns.rubricPreview.goToQuestions')}
            </Button>
          ) : null}
        </div>
        {/* `ml-auto`: khi khối quota rớt xuống dòng hai (mô tả dài) nó vẫn dính mép phải thay vì lơ lửng giữa card. */}
        {freeLeft != null && !blocker ? (
          <div className="ml-auto space-y-0.5 text-right">
            <Badge variant={freeLeft > 0 ? 'success' : 'info'} data-testid="preview-quota">
              {freeLeft > 0 ? t('employer.campaigns.rubricPreview.quota.free').replace('{{n}}', String(freeLeft)) : t('employer.campaigns.rubricPreview.quota.paid')}
            </Badge>
            {freeLeft <= 0 ? <p className="text-xs text-muted-foreground">{t('employer.campaigns.rubricPreview.quota.paidHint')}</p> : null}
            {freeLeft <= 0 ? <p className="text-xs text-muted-foreground">{t('employer.campaigns.rubricPreview.quota.resetHint')}</p> : null}
          </div>
        ) : null}
      </div>

      {errorAlert}

      {/* Form đứng TRÊN kết quả khi chấm lại (bấm "Chấm lại" mà form mọc dưới bảng 7 hàng là ngoài màn hình), và GIỮ
          mount trong lúc chạy (disabled) — unmount là mất bài đối chứng HR vừa dán nếu AI lỗi. */}
      {isRunning ? runningStatus : null}
      {!viewing || rerunOpen || isRunning ? form(viewing?.questionId ?? null, viewing && !isRunning ? () => setRerunOpen(false) : undefined) : null}

      {viewing ? (
        <RubricPreviewResult
          run={viewing}
          runNumber={runNumberOf(runs, viewing.id) || runs.length || 1}
          passScorePct={passScorePct}
          onRerun={!isRunning && !rerunOpen ? () => setRerunOpen(true) : undefined}
          onEditLevels={onGoToCriteria}
          onBackToLatest={latest && viewing.id !== latest.id ? () => setSelectedRunId(null) : undefined}
          dimmed={isRunning}
        />
      ) : null}

      {latest && viewing ? (
        <RubricPreviewHistory runs={runs} latest={latest} viewingId={viewing.id} isLoading={preview.isLoadingHistory} onOpen={setSelectedRunId} />
      ) : null}
    </section>
  );
}
