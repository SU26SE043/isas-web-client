import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlaskConical, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import type { QuestionPreviewContext } from '../../types/questionPreview.types';
import { CollapsibleDetailCard } from '../CollapsibleDetailCard';
import { CampaignQuestionCardMount } from '../wizard/questions/CampaignQuestionCardMount';
import { useQuestionCardOpenState } from '../wizard/questions/CampaignQuestionSections';
import { QuestionCoverageNotice } from '../wizard/questions/QuestionCoverageNotice';

export interface CampaignDetailQuestionsSectionProps {
  campaign: EmployerCampaign;
  /** Draft: mở wizard ở bước 3 (thiếu mốc / chưa có tiêu chí WhenTargeted). Active không có đường sửa mốc ⇒ vắng. */
  onEditCriteria?: () => void;
}

/** Wizard chỉnh sửa, mở đúng bước 4 + đúng card (`CampaignWizardPage` đọc `?step=` 1-based và `?question=`). */
export function editQuestionPath(campaignId: string, questionId: string): string {
  return `/employer/campaigns/${campaignId}/edit?step=4&question=${encodeURIComponent(questionId)}`;
}

const noop = () => undefined;

/**
 * SC2 · T10 (D-1) — tab Chi tiết dùng CHÍNH card câu hỏi của bước 4 (`CampaignQuestionCard` qua Mount), ở chế
 * độ `readOnly`: không sửa nội dung/nhãn/câu mẫu (việc đó thuộc wizard), nhưng chấm thử THEO CÂU vẫn chạy ở
 * Draft LẪN Active — không `beforeRun` (dữ liệu đã ở server ⇒ nhãn "Chấm thử", không hỏi xác nhận đổi bản),
 * không `resolveQuestionId` (mọi câu ở đây đều có id server). `closed`/`archived` ⇒ card vẫn hiện để đọc,
 * panel tự chặn (`computeBlocker` → `closed`, I7: không POST). Bao phủ lấy số SERVER trả (`questionBank`) —
 * trang chi tiết không có state cục bộ để tính. State "câu đang chạy" sống ở đây vì POST 20–60s trong MỘT card.
 */
export function CampaignDetailQuestionsSection({ campaign, onEditCriteria }: CampaignDetailQuestionsSectionProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [runningQuestionId, setRunningQuestionId] = useState<string | null>(null);
  const questions = campaign.questions;
  const isDraft = campaign.status === 'draft';
  const initialOpenQuestionId = searchParams.get('question')?.trim() || null;
  const { isOpen, setOpen, deepLinkId } = useQuestionCardOpenState(questions, initialOpenQuestionId);

  const previewCtx: QuestionPreviewContext = {
    campaignId: campaign.id,
    campaignStatus: campaign.status,
    rubric: campaign.rubric,
    questions,
    passScorePct: campaign.passScorePct ?? null,
    currentRubricVersion: campaign.rubricVersion ?? null,
    onGoToCriteria: onEditCriteria,
    runningQuestionId,
    onRunningChange: setRunningQuestionId,
    readOnly: true,
  };

  return (
    <CollapsibleDetailCard title={t('employer.campaigns.detail.questions.title')} icon={FlaskConical} className="frame-satin bg-chart-cat-6/[0.025]">
      <div className="space-y-4" data-testid="campaign-detail-questions">
        <p className="text-xs text-muted-foreground">
          {t(isDraft ? 'employer.campaigns.detail.questions.description' : 'employer.campaigns.detail.questions.descriptionLocked')}
        </p>

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid="campaign-detail-questions-empty">
            {t('employer.campaigns.detail.questions.empty')}
          </p>
        ) : (
          <ul className="space-y-4">
            {questions.map((question, index) => (
              // Card là một `<li>` (Collapsible.Root render li) ⇒ bọc thêm một tầng list để đặt hàng nút
              // "Sửa câu này" NGOÀI card mà HTML vẫn hợp lệ (li chỉ được đứng trong ul/ol).
              <li key={question.id} className="space-y-1.5">
                <ul>
                  <CampaignQuestionCardMount
                    question={question}
                    index={index}
                    total={questions.length}
                    disabled
                    open={isOpen(question.id)}
                    onOpenChange={(open) => setOpen(question.id, open)}
                    scrollIntoViewOnMount={deepLinkId === question.id}
                    onChangePrompt={noop}
                    onToggleRequired={noop}
                    onChangeGroup={noop}
                    onMoveUp={noop}
                    onMoveDown={noop}
                    onRemove={noop}
                    rubric={campaign.rubric}
                    onGoToCriteria={onEditCriteria}
                    previewCtx={previewCtx}
                  />
                </ul>
                {isDraft ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(editQuestionPath(campaign.id, question.id))}
                      data-testid="campaign-detail-question-edit"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      {t('employer.campaigns.detail.questions.editQuestion')}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <QuestionCoverageNotice
          questions={questions}
          questionsPerSession={campaign.questionBank?.questionsPerSession ?? campaign.questionsPerSession ?? null}
          serverCoverageWarnings={campaign.questionBank?.coverageWarnings}
          questionBankWarnings={campaign.questionBank?.warnings ?? campaign.questionBankWarnings}
        />
      </div>
    </CollapsibleDetailCard>
  );
}
