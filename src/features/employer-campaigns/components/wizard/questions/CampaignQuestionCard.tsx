import * as React from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import type { QuestionPreviewContext } from '../../../types/questionPreview.types';
import type { UseQuestionPreviewApi } from '../../../types/rubricPreview.types';
import { QuestionCardHeader, resolveTargetNames } from './QuestionCardHeader';
import { QuestionPreviewPanel } from './QuestionPreviewPanel';
import { QuestionScopePicker } from './QuestionScopePicker';

export interface CampaignQuestionCardProps {
  question: CampaignQuestion;
  index: number;
  total: number;
  /** Khoá SỬA (không phải nháp / đang bận). */
  disabled?: boolean;
  /** Màn đang bận tạm thời (AI sinh, đang lưu) — chỉ khoá nút chấm thử, KHÔNG phải khoá sửa vĩnh viễn. */
  busy?: boolean;
  onChangePrompt: (prompt: string) => void;
  onToggleRequired: (isRequired: boolean) => void;
  onChangeGroup: (group: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  /** Controlled mở/đóng (Sections giữ map id→bool). Vắng ⇒ uncontrolled, mặc định mở card đầu. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Cuộn tới card này khi mount (deep-link `?question=`). */
  scrollIntoViewOnMount?: boolean;
  /** SC2 — thước đo bước 3: có ⇒ picker nhãn + chip tiêu chí ở hàng đầu. Vắng ⇒ card như trước SC2. */
  rubric?: RubricCriterion[];
  onChangeTargets?: (next: string[] | null) => void;
  onChangeSampleAnswer?: (text: string) => void;
  onGoToCriteria?: () => void;
  /** Chấm thử theo câu — cả hai cùng có (Mount nối hook) thì panel mới hiện. */
  previewCtx?: QuestionPreviewContext;
  preview?: UseQuestionPreviewApi;
}

/**
 * SC2 · T9 — card câu hỏi bước 4 = Base UI `Collapsible`. Trigger là hàng đầu (xem `QuestionCardHeader`);
 * panel `keepMounted` để textarea/kết quả chấm thử không bị unmount khi đóng (mất state đang gõ, mất lượt đang
 * poll). CỐ Ý KHÔNG animate chiều cao: `--collapsible-panel-height` được ghim px lúc mở ⇒ kết quả AI về sau
 * 20–60s sẽ bị cắt.
 */
export function CampaignQuestionCard({
  question, index, total, disabled = false, busy = false,
  onChangePrompt, onToggleRequired, onChangeGroup, onMoveUp, onMoveDown, onRemove,
  open, onOpenChange, scrollIntoViewOnMount = false,
  rubric, onChangeTargets, onChangeSampleAnswer, onGoToCriteria, previewCtx, preview,
}: CampaignQuestionCardProps) {
  const { t } = useLanguage();
  const rootRef = React.useRef<HTMLLIElement | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(index === 0);
  const isOpen = open ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  React.useEffect(() => {
    if (!scrollIntoViewOnMount) return;
    const node = rootRef.current;
    if (node && typeof node.scrollIntoView === 'function') node.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [scrollIntoViewOnMount]);

  const readOnly = disabled || Boolean(previewCtx?.readOnly);
  const targetNames = rubric ? resolveTargetNames(rubric, question.targetCriterionIds) : [];
  const hasPreviewRun = Boolean(preview?.runs.some((run) => run.status === 'Succeeded'));
  const runningId = previewCtx?.runningQuestionId ?? preview?.runningQuestionId ?? null;
  const runningIndex = runningId && previewCtx ? previewCtx.questions.findIndex((item) => item.id === runningId) : -1;

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={(next) => setOpen(next)}
      render={<li ref={rootRef} id={`question-card-${question.id}`} data-testid="question-card" />}
      className="space-y-3 rounded-xl border border-satin bg-surface-overlay p-4"
    >
      <QuestionCardHeader
        question={question}
        index={index}
        total={total}
        open={isOpen}
        disabled={disabled}
        targetNames={targetNames}
        hasPreviewRun={hasPreviewRun}
        runningPosition={runningIndex >= 0 ? runningIndex + 1 : null}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />

      <Collapsible.Panel keepMounted className="space-y-3" data-testid="question-card-panel">
        <div className="space-y-2">
          <Label htmlFor={`q-${question.id}`} className="sr-only">
            {t('employer.campaigns.campaignQuestions.question.contentLabel')}
          </Label>
          <textarea
            id={`q-${question.id}`}
            rows={3}
            disabled={readOnly}
            className="w-full whitespace-normal rounded-lg border border-satin bg-surface-base px-3 py-2 text-sm outline-none transition focus-visible:border-[var(--border-focus)]"
            style={{ overflowWrap: 'anywhere' }}
            value={question.prompt}
            placeholder={t('employer.campaigns.campaignQuestions.question.contentPlaceholder')}
            onChange={(e) => onChangePrompt(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`q-group-${question.id}`}>{t('employer.campaigns.campaignQuestions.question.group')}</Label>
          <Input id={`q-group-${question.id}`} list="campaign-question-groups" value={question.questionGroup ?? ''} disabled={readOnly} placeholder={t('employer.campaigns.campaignQuestions.question.commonGroup')} onChange={(event) => onChangeGroup(event.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`q-placement-${question.id}`}>{t('employer.campaigns.campaignQuestions.question.placement')}</Label>
          <select
            id={`q-placement-${question.id}`}
            aria-label={t('employer.campaigns.campaignQuestions.question.placement')}
            value={question.isRequired ? 'fixed' : 'pool'}
            disabled={readOnly}
            onChange={(event) => onToggleRequired(event.target.value === 'fixed')}
            className="h-9 w-full rounded-xl border border-satin bg-surface-overlay/80 px-3 text-sm text-foreground"
          >
            <option value="fixed">{t('employer.campaigns.campaignQuestions.question.fixed')}</option>
            <option value="pool">{t('employer.campaigns.campaignQuestions.question.pool')}</option>
          </select>
        </div>

        {rubric && onChangeTargets ? (
          <QuestionScopePicker
            questionId={question.id}
            rubric={rubric}
            value={question.targetCriterionIds}
            disabled={readOnly}
            onChange={onChangeTargets}
            onGoToCriteria={onGoToCriteria}
          />
        ) : null}

        {onChangeSampleAnswer ? (
          <div className="space-y-1.5">
            <Label htmlFor={`q-sample-${question.id}`}>{t('employer.campaigns.questionCard.sampleAnswer.label')}</Label>
            <Textarea
              id={`q-sample-${question.id}`}
              rows={4}
              value={question.sampleAnswer ?? ''}
              disabled={readOnly}
              placeholder={t('employer.campaigns.questionCard.sampleAnswer.placeholder')}
              onChange={(event) => onChangeSampleAnswer(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t('employer.campaigns.questionCard.sampleAnswer.hint')}</p>
          </div>
        ) : null}

        {previewCtx && preview ? (
          <QuestionPreviewPanel question={question} index={index} ctx={previewCtx} preview={preview} disabled={busy} />
        ) : null}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
