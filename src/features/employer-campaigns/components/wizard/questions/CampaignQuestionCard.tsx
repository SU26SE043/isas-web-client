import * as React from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import type { QuestionPreviewContext } from '../../../types/questionPreview.types';
import type { UseQuestionPreviewApi } from '../../../types/rubricPreview.types';
import { QuestionCardHeader, resolveTargetNames } from './QuestionCardHeader';
import { QuestionCardTabs, questionTabId, questionTabPanelId, type QuestionCardTab } from './QuestionCardTabs';
import { QuestionContentFields } from './QuestionContentFields';
import { QuestionPreviewPanel } from './QuestionPreviewPanel';

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
 * 20–60s sẽ bị cắt. Có chấm thử ⇒ thân card chia hai tab (Nội dung · Chấm thử); tab ẩn vẫn mount vì cùng lý do.
 */
export function CampaignQuestionCard({
  question, index, total, disabled = false, busy = false,
  onChangePrompt, onToggleRequired, onChangeGroup, onMoveUp, onMoveDown, onRemove,
  open, onOpenChange, scrollIntoViewOnMount = false,
  rubric, onChangeTargets, onChangeSampleAnswer, onGoToCriteria, previewCtx, preview,
}: CampaignQuestionCardProps) {
  const rootRef = React.useRef<HTMLLIElement | null>(null);
  // Trang chi tiết (readOnly) không sửa được nội dung ⇒ mở thẳng tab chấm thử; wizard mở tab soạn.
  const [tab, setTab] = React.useState<QuestionCardTab>(previewCtx?.readOnly ? 'preview' : 'content');
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
  const isRunningHere = runningId === question.id;
  // "Lưu & chấm thử" đổi id tạm → GUID ⇒ card mount lại giữa lượt, và id đang chấm chỉ được chuyển SAU render đầu
  // (`useQuestionIdMigration`) ⇒ bắt lúc câu NÀY thành câu đang chấm để không bị trả về tab soạn.
  React.useEffect(() => {
    if (isRunningHere) setTab('preview');
  }, [isRunningHere]);

  const content = (
    <QuestionContentFields
      question={question}
      readOnly={readOnly}
      onChangePrompt={onChangePrompt}
      onToggleRequired={onToggleRequired}
      onChangeGroup={onChangeGroup}
      rubric={rubric}
      onChangeTargets={onChangeTargets}
      onChangeSampleAnswer={onChangeSampleAnswer}
      onGoToCriteria={onGoToCriteria}
    />
  );

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={(next) => setOpen(next)}
      render={<li ref={rootRef} id={`question-card-${question.id}`} data-testid="question-card" />}
      className="space-y-3 rounded-xl border border-satin bg-surface-overlay p-3 sm:p-4"
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
        compactPrompt={!(previewCtx && preview) || tab === 'content'}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />

      <Collapsible.Panel keepMounted className="space-y-3" data-testid="question-card-panel">
        {previewCtx && preview ? (
          <div className="flex flex-col gap-4">
            <QuestionCardTabs
              questionId={question.id}
              active={tab}
              onChange={setTab}
              previewStatus={runningId === question.id ? 'running' : hasPreviewRun ? 'done' : 'idle'}
            />
            <div role="tabpanel" id={questionTabPanelId(question.id, 'content')} aria-labelledby={questionTabId(question.id, 'content')} hidden={tab !== 'content'}>
              {content}
            </div>
            <div role="tabpanel" id={questionTabPanelId(question.id, 'preview')} aria-labelledby={questionTabId(question.id, 'preview')} hidden={tab !== 'preview'}>
              <QuestionPreviewPanel question={question} index={index} ctx={previewCtx} preview={preview} disabled={busy} />
            </div>
          </div>
        ) : content}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
