import * as React from 'react';
import { ChevronDown, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion } from '../../../types/campaignManagement.types';
import type { RubricPreviewRequest } from '../../../types/rubricPreview.types';
import { defaultPreviewQuestion } from '../../../utils/rubricPreviewVerdict';

const PROMPT_PREVIEW_CHARS = 80;

export function truncatePrompt(prompt: string, limit = PROMPT_PREVIEW_CHARS): string {
  const text = prompt.trim();
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}

export interface RubricPreviewRunFormProps {
  questions: CampaignQuestion[];
  isRunning: boolean;
  /** Bị chặn (lý do hiện ở card) — nút disabled, form vẫn hiện để HR thấy sẽ chọn được gì sau khi gỡ chặn. */
  disabled?: boolean;
  /** Có bước lưu trước khi chạy (wizard) ⇒ nhãn "Lưu & chấm thử"; không (trang chi tiết) ⇒ "Chấm thử". */
  savesBeforeRun: boolean;
  /** Campaign đang mở + có bước lưu ⇒ hỏi trước: lưu tạo bản thước đo mới cho ứng viên thi sau. */
  requireConfirm: boolean;
  currentRubricVersion: number | null;
  /** Hết lượt miễn phí (≤ 0) ⇒ nhãn nút nêu giá + hỏi trước khi trừ credit tổ chức. `null` = chưa biết. */
  freeRunsLeft?: number | null;
  /** Chỉ nút (+ confirm), không select/custom — cho bước 8. */
  compact?: boolean;
  initialQuestionId?: string | null;
  onRun: (input: RubricPreviewRequest) => void;
  onCancel?: () => void;
}

export function RubricPreviewRunForm({
  questions,
  isRunning,
  disabled = false,
  savesBeforeRun,
  requireConfirm,
  currentRubricVersion,
  freeRunsLeft = null,
  compact = false,
  initialQuestionId = null,
  onRun,
  onCancel,
}: RubricPreviewRunFormProps) {
  const { t } = useLanguage();
  const selectId = React.useId();
  const customId = React.useId();
  const fallbackId = defaultPreviewQuestion(questions)?.id ?? '';
  const [questionId, setQuestionId] = React.useState<string>(
    initialQuestionId && questions.some((question) => question.id === initialQuestionId) ? initialQuestionId : fallbackId,
  );
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customAnswer, setCustomAnswer] = React.useState('');
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Câu đang chọn bị xoá khỏi danh sách ⇒ rơi về mặc định, không gửi id ma.
  const effectiveQuestionId = questions.some((question) => question.id === questionId) ? questionId : fallbackId;

  const buildInput = (): RubricPreviewRequest => ({
    questionId: effectiveQuestionId || null,
    customAnswer: customOpen && customAnswer.trim() ? customAnswer.trim() : null,
  });
  // Trừ credit tổ chức là tiền thật: KHÔNG trừ trong im lặng — nhãn nút nêu giá, và hỏi trước khi chạy.
  const paid = freeRunsLeft != null && freeRunsLeft <= 0;
  const submit = () => {
    if (requireConfirm || paid) {
      setConfirmOpen(true);
      return;
    }
    onRun(buildInput());
  };
  const versionSentence =
    currentRubricVersion != null
      ? t('employer.campaigns.rubricPreview.confirm.description')
          .replace('{{next}}', String(currentRubricVersion + 1))
          .replace('{{current}}', String(currentRubricVersion))
      : t('employer.campaigns.rubricPreview.confirm.descriptionUnknown');
  const confirmTitle = paid ? t('employer.campaigns.rubricPreview.confirm.paidTitle') : t('employer.campaigns.rubricPreview.confirm.title');
  const confirmDescription = [paid ? t('employer.campaigns.rubricPreview.confirm.paidDescription') : null, requireConfirm ? versionSentence : null]
    .filter(Boolean)
    .join(' ');
  const baseLabel = savesBeforeRun ? t('employer.campaigns.rubricPreview.runSave') : t('employer.campaigns.rubricPreview.run');
  const runLabel = paid ? t('employer.campaigns.rubricPreview.runPaid').replace('{{label}}', baseLabel) : baseLabel;

  const button = (
    <Button type="button" disabled={disabled || isRunning || questions.length === 0} loading={isRunning} onClick={submit}>
      {!isRunning ? <FlaskConical className="size-4" aria-hidden /> : null}
      {isRunning ? t('employer.campaigns.rubricPreview.running') : runLabel}
    </Button>
  );
  const confirm = (
    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      title={confirmTitle}
      description={confirmDescription}
      confirmLabel={paid ? runLabel : t('employer.campaigns.rubricPreview.confirm.confirm')}
      cancelLabel={t('employer.campaigns.rubricPreview.confirm.cancel')}
      onConfirm={() => {
        setConfirmOpen(false);
        onRun(buildInput());
      }}
    />
  );

  if (compact) {
    return (
      <>
        {button}
        {confirm}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={selectId}>{t('employer.campaigns.rubricPreview.question.label')}</Label>
        <select
          id={selectId}
          value={effectiveQuestionId}
          disabled={disabled || isRunning || questions.length === 0}
          onChange={(event) => setQuestionId(event.target.value)}
          className="h-9 w-full rounded-lg border border-satin bg-surface-overlay/80 px-2 text-sm text-foreground disabled:opacity-50"
        >
          {questions.length === 0 ? <option value="">{t('employer.campaigns.rubricPreview.question.empty')}</option> : null}
          {questions.map((question) => (
            <option key={question.id} value={question.id}>
              {truncatePrompt(question.prompt)}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">{t('employer.campaigns.rubricPreview.question.defaultHint')}</p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground"
          aria-expanded={customOpen}
          aria-controls={customId}
          disabled={disabled || isRunning}
          onClick={() => setCustomOpen((open) => !open)}
        >
          <ChevronDown className={cn('size-3.5 transition-transform', customOpen && 'rotate-180')} aria-hidden />
          {t('employer.campaigns.rubricPreview.custom.toggle')}
        </button>
        {customOpen ? (
          <div id={customId} className="space-y-1.5">
            <p className="text-xs leading-relaxed text-muted-foreground">{t('employer.campaigns.rubricPreview.custom.hint')}</p>
            <Textarea
              rows={5}
              value={customAnswer}
              disabled={disabled || isRunning}
              placeholder={t('employer.campaigns.rubricPreview.custom.placeholder')}
              aria-label={t('employer.campaigns.rubricPreview.custom.toggle')}
              onChange={(event) => setCustomAnswer(event.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {button}
        {onCancel ? (
          <Button type="button" variant="ghost" disabled={isRunning} onClick={onCancel}>
            {t('employer.campaigns.rubricPreview.cancelRerun')}
          </Button>
        ) : null}
      </div>
      {confirm}
    </div>
  );
}
