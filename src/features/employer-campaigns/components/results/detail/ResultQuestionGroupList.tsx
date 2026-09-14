import { useLanguage } from '@/shared/languages';
import type { QuestionGroup } from '@/shared/utils/questionNumbering';
import type { TranscriptQuestion } from '../../../types/campaign.api.types';
import { ResultQuestionCard } from './ResultQuestionCard';

/**
 * Thẻ câu theo NHÓM: thẻ câu gốc, rồi mọi câu theo sau (1.1, 1.2…) lồng ngay dưới với viền trái — HR đọc trọn
 * một chủ đề tại một chỗ, và rail bên phải chỉ cần trỏ tới câu gốc (`#q-{orderNo}` của gốc).
 */
export function ResultQuestionGroupList({
  groups,
  labels,
  campaignId,
  sessionId,
}: {
  groups: QuestionGroup<TranscriptQuestion>[];
  labels: Map<string, string>;
  campaignId: string;
  sessionId: string;
}) {
  const { t } = useLanguage();
  const labelOf = (question: TranscriptQuestion) => labels.get(question.questionId) ?? String(question.orderNo);
  return (
    <section className="space-y-4">
      {groups.map(({ root, children }) => (
        <div key={root.questionId} className="space-y-3">
          <ResultQuestionCard question={root} label={labelOf(root)} campaignId={campaignId} sessionId={sessionId} />
          {children.length ? (
            <div className="space-y-3 border-l-2 border-satin pl-3 sm:pl-4" aria-label={t('employer.campaigns.results.detail.followUps')}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('employer.campaigns.results.detail.followUps')} · {children.length}
              </p>
              {children.map((child) => (
                <ResultQuestionCard key={child.questionId} question={child} label={labelOf(child)} campaignId={campaignId} sessionId={sessionId} />
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
