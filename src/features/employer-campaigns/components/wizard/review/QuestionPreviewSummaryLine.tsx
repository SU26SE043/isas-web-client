import { FlaskConical } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { useRubricPreview } from '../../../hooks/useRubricPreview';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import type { RubricPreviewRun } from '../../../types/rubricPreview.types';
import { isServerEntityId } from '../../../utils/campaignQuestionLimits';

export interface QuestionPreviewSummaryLineProps {
  campaignId: string | null;
  questions: CampaignQuestion[];
  /** Thước đo bước 3 — có ≥1 tiêu chí `WhenTargeted` thì mới có nghĩa để đếm câu chưa gắn nhãn. */
  rubric?: RubricCriterion[];
  onGoToQuestions?: () => void;
}

/** Số câu có ≥1 lượt `Succeeded` — khớp theo `run.questionId`; câu id tạm (chưa lưu) không bao giờ có lượt. */
export function countPreviewedQuestions(questions: CampaignQuestion[], runs: RubricPreviewRun[]): number {
  const succeeded = new Set(runs.filter((run) => run.status === 'Succeeded').map((run) => run.questionId));
  return questions.filter((question) => isServerEntityId(question.id) && succeeded.has(question.id)).length;
}

/** Câu chưa gắn nhãn tiêu chí: `null`/`undefined` (chưa chạm) HOẶC `[]` (đã chạm nhưng không nhắm tiêu chí nào). */
export function countUnlabeledQuestions(questions: CampaignQuestion[]): number {
  return questions.filter((question) => (question.targetCriterionIds?.length ?? 0) === 0).length;
}

/**
 * SC2 · T10 (D-1) — bước 8 chỉ TÓM TẮT chấm thử theo câu: "đã chấm thử n/K câu" + "m câu chưa gắn tiêu chí"
 * + link về bước 4. Thuần thông tin (`role="status"`) — KHÔNG chặn Phát hành, KHÔNG có nút chạy ở đây: chấm
 * thử sống trong từng card ở bước 4. Đọc lịch sử qua `useRubricPreview` (cùng `queryKey` với các card ⇒ một
 * cache chung, không thêm lần gọi mạng). `campaignId` null (chưa lưu nháp) ⇒ chưa thể có lượt nào.
 */
export function QuestionPreviewSummaryLine({ campaignId, questions, rubric, onGoToQuestions }: QuestionPreviewSummaryLineProps) {
  const { t } = useLanguage();
  const { runs } = useRubricPreview({ campaignId });
  const hasTargetable = Boolean(rubric?.some((criterion) => criterion.scoringScope === 'WhenTargeted'));
  const previewed = countPreviewedQuestions(questions, runs);
  const unlabeled = countUnlabeledQuestions(questions);

  // Cùng kiểu link chữ với `RubricPreviewCard` compact (bước 8 chỉ là dòng tóm tắt, không có nút hành động to).
  const link = onGoToQuestions ? (
    <button type="button" className="text-xs font-medium text-foreground underline underline-offset-4" onClick={onGoToQuestions}>
      {t('employer.campaigns.review.previewSummary.goToQuestions')}
    </button>
  ) : null;

  return (
    <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground" data-testid="question-preview-summary">
      <FlaskConical className="size-3.5 shrink-0" aria-hidden />
      {campaignId ? (
        <>
          <span data-testid="question-preview-summary-count">
            {t('employer.campaigns.review.previewSummary.count').replace('{{n}}', String(previewed)).replace('{{k}}', String(questions.length))}
          </span>
          {hasTargetable && unlabeled > 0 ? (
            <span className="text-warning" data-testid="question-preview-summary-unlabeled">
              {t('employer.campaigns.review.previewSummary.unlabeled').replace('{{m}}', String(unlabeled))}
            </span>
          ) : null}
        </>
      ) : (
        <span data-testid="question-preview-summary-unsaved">{t('employer.campaigns.review.previewSummary.unsaved')}</span>
      )}
      <span>{t('employer.campaigns.review.previewSummary.optional')}</span>
      {link}
    </div>
  );
}
