import { useEffect, useState, type RefObject } from 'react';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import type { QuestionPreviewContext } from '../../../types/questionPreview.types';
import { CampaignQuestionCard } from './CampaignQuestionCard';
import { CampaignQuestionCardMount } from './CampaignQuestionCardMount';

interface CampaignQuestionSectionsProps {
  questions: CampaignQuestion[];
  isDraft: boolean;
  disabled?: boolean;
  drawMode: boolean;
  listRef?: RefObject<HTMLUListElement | null>;
  onChangePrompt: (id: string, prompt: string) => void;
  onToggleRequired: (id: string, isRequired: boolean) => void;
  onChangeGroup: (id: string, group: string) => void;
  onMoveQuestion: (id: string, direction: 'up' | 'down') => void;
  onRemoveQuestion: (id: string) => void;
  /** SC2 — có rubric ⇒ card hiện picker nhãn + chip; có previewCtx ⇒ card có panel chấm thử. */
  rubric?: RubricCriterion[];
  onChangeTargets?: (id: string, next: string[] | null) => void;
  onChangeSampleAnswer?: (id: string, text: string) => void;
  onGoToCriteria?: () => void;
  previewCtx?: QuestionPreviewContext;
  /** Deep-link `?question=<id>`: mở đúng card + cuộn tới. Id lạ ⇒ bỏ qua im lặng. */
  initialOpenQuestionId?: string | null;
}

/**
 * Trạng thái mở/đóng là state CỤC BỘ (map id→bool), không lưu server. Mặc định chỉ MỘT card mở: card deep-link
 * nếu có, không thì card đầu. Câu mới xuất hiện với prompt RỖNG (thêm tay) tự mở để HR gõ ngay — chỉ lúc nó
 * xuất hiện, không phải mỗi lần render (gõ ký tự đầu không được làm nó đóng lại).
 */
export function useQuestionCardOpenState(questions: CampaignQuestion[], initialOpenQuestionId?: string | null) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const fresh = questions.filter((question) => !(question.id in openMap) && !question.prompt.trim());
    if (fresh.length === 0) return;
    setOpenMap((prev) => ({ ...prev, ...Object.fromEntries(fresh.map((question) => [question.id, true])) }));
    // `openMap` cố ý không vào deps: effect chỉ chạy khi DANH SÁCH đổi, không phải khi HR bấm mở/đóng.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);
  const deepLinkId = initialOpenQuestionId && questions.some((question) => question.id === initialOpenQuestionId)
    ? initialOpenQuestionId
    : null;
  const defaultOpenId = deepLinkId ?? questions[0]?.id ?? null;
  const isOpen = (id: string) => openMap[id] ?? id === defaultOpenId;
  const setOpen = (id: string, open: boolean) => setOpenMap((prev) => ({ ...prev, [id]: open }));
  return { isOpen, setOpen, deepLinkId };
}

type ListProps = Omit<CampaignQuestionSectionsProps, 'isDraft' | 'drawMode' | 'initialOpenQuestionId'> & {
  allQuestions: CampaignQuestion[];
  editLocked: boolean;
  title: string;
  description: string;
  isOpen: (id: string) => boolean;
  setOpen: (id: string, open: boolean) => void;
  deepLinkId: string | null;
};

function QuestionList({
  questions, allQuestions, editLocked, title, description, listRef, disabled,
  onChangePrompt, onToggleRequired, onChangeGroup, onMoveQuestion, onRemoveQuestion,
  rubric, onChangeTargets, onChangeSampleAnswer, onGoToCriteria, previewCtx, isOpen, setOpen, deepLinkId,
}: ListProps) {
  const { t } = useLanguage();
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{t(title)}</h3>
        <p className="text-xs text-muted-foreground">{t(description)}</p>
      </div>
      <ul ref={listRef} className="space-y-3">
        {questions.map((question) => {
          const index = allQuestions.findIndex((item) => item.id === question.id);
          const cardProps = {
            question,
            index,
            total: allQuestions.length,
            disabled: editLocked,
            busy: disabled,
            open: isOpen(question.id),
            onOpenChange: (open: boolean) => setOpen(question.id, open),
            scrollIntoViewOnMount: deepLinkId === question.id,
            onChangePrompt: (prompt: string) => onChangePrompt(question.id, prompt),
            onToggleRequired: (isRequired: boolean) => onToggleRequired(question.id, isRequired),
            onChangeGroup: (group: string) => onChangeGroup(question.id, group),
            onMoveUp: () => onMoveQuestion(question.id, 'up'),
            onMoveDown: () => onMoveQuestion(question.id, 'down'),
            onRemove: () => onRemoveQuestion(question.id),
            rubric,
            onChangeTargets: onChangeTargets ? (next: string[] | null) => onChangeTargets(question.id, next) : undefined,
            onChangeSampleAnswer: onChangeSampleAnswer ? (text: string) => onChangeSampleAnswer(question.id, text) : undefined,
            onGoToCriteria,
          };
          return previewCtx
            ? <CampaignQuestionCardMount key={question.id} {...cardProps} previewCtx={previewCtx} />
            : <CampaignQuestionCard key={question.id} {...cardProps} />;
        })}
      </ul>
    </section>
  );
}

export function CampaignQuestionSections({
  questions, isDraft, disabled = false, drawMode, listRef, initialOpenQuestionId,
  onChangePrompt, onToggleRequired, onChangeGroup, onMoveQuestion, onRemoveQuestion,
  rubric, onChangeTargets, onChangeSampleAnswer, onGoToCriteria, previewCtx,
}: CampaignQuestionSectionsProps) {
  const { isOpen, setOpen, deepLinkId } = useQuestionCardOpenState(questions, initialOpenQuestionId);
  const fixed = questions.filter((question) => question.isRequired);
  const pool = questions.filter((question) => !question.isRequired);
  const shared = {
    allQuestions: questions,
    editLocked: !isDraft || disabled,
    disabled,
    onChangePrompt, onToggleRequired, onChangeGroup, onMoveQuestion, onRemoveQuestion,
    rubric, onChangeTargets, onChangeSampleAnswer, onGoToCriteria, previewCtx,
    isOpen, setOpen, deepLinkId,
  };

  if (!drawMode) {
    return (
      <QuestionList
        {...shared}
        questions={questions}
        listRef={listRef}
        title="employer.campaigns.campaignQuestions.fixed.title"
        description="employer.campaigns.campaignQuestions.fixed.description"
      />
    );
  }

  return (
    <div className="space-y-6">
      <QuestionList
        {...shared}
        questions={fixed}
        listRef={listRef}
        title="employer.campaigns.campaignQuestions.fixed.title"
        description="employer.campaigns.campaignQuestions.fixed.description"
      />
      <QuestionList
        {...shared}
        questions={pool}
        title="employer.campaigns.campaignQuestions.pool.title"
        description="employer.campaigns.campaignQuestions.pool.description"
      />
    </div>
  );
}
