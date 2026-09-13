import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import type { QuestionCoverageWarning } from '../../../types/questionPreview.types';
import { computeLocalCoverageWarnings, computeLocalKRule, splitQuestionBankWarnings } from '../../../utils/questionCoverage';

export interface QuestionCoverageNoticeProps {
  questions: CampaignQuestion[];
  questionsPerSession: number | null | undefined;
  /** Thước đo hiện tại — có ⇒ bao phủ tính CỤC BỘ (kể cả nhãn chưa lưu); vắng ⇒ dùng số server trả. */
  rubric?: RubricCriterion[];
  /** `questionBank.coverageWarnings` server trả (sau PUT). Vắng ⇒ `[]`. */
  serverCoverageWarnings?: QuestionCoverageWarning[];
  /** `questionBank.warnings` server trả — K-rule bên trong CHẶN publish. */
  questionBankWarnings?: string[];
}

/**
 * SC2 · T9 — dưới danh sách câu hỏi: (1) tiêu chí `WhenTargeted` chưa câu nào nhắm (thông tin — sẽ bị LOẠI khỏi
 * điểm, không tính 0); (2) K-rule `K_BELOW_CRITERIA_GROUPS` (CHẶN publish — hiện như lỗi). Cả hai đều có bản
 * cục bộ (tính từ state, thấy ngay khi HR chưa lưu) và bản server (sau PUT). Cục bộ THẮNG khi biết rubric —
 * nó phản ánh nhãn mới nhất; server chỉ biết tới lần lưu gần nhất.
 */
export function QuestionCoverageNotice({ questions, questionsPerSession, rubric, serverCoverageWarnings = [], questionBankWarnings = [] }: QuestionCoverageNoticeProps) {
  const { t } = useLanguage();
  const coverage = rubric ? computeLocalCoverageWarnings(rubric, questions) : serverCoverageWarnings;
  const localK = computeLocalKRule(questions, questionsPerSession);
  const { blocking } = splitQuestionBankWarnings(questionBankWarnings);
  const kMessages = localK
    ? [t('employer.campaigns.questionCard.coverage.kRule').replace('{{k}}', String(localK.k)).replace('{{n}}', String(localK.primary))]
    : blocking;

  if (coverage.length === 0 && kMessages.length === 0) return null;

  return (
    <div className="space-y-3" data-testid="question-coverage-notice">
      {kMessages.length > 0 ? (
        <div role="alert" className="rounded-lg border border-error/50 bg-error/10 p-3 text-sm text-error" data-testid="question-k-rule">
          <p className="font-medium">{t('employer.campaigns.questionCard.coverage.kRuleTitle')}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {kMessages.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}
          </ul>
        </div>
      ) : null}
      {coverage.length > 0 ? (
        <div role="status" className="rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-warning" data-testid="question-coverage">
          <p className="font-medium">{t('employer.campaigns.questionCard.coverage.title')}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {coverage.map((item) => (
              <li key={item.criterionId}>{t('employer.campaigns.questionCard.coverage.item').replace('{{name}}', item.name)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
