import { Eye, MicOff } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { TranscriptQuestion } from '../../../types/campaign.api.types';
import { questionAverageScore } from '../../../utils/resultDetailViewModel';

/**
 * Nhảy câu: ≥lg là rail dính bên phải; dưới lg là DẢI CHIP NGANG DÍNH TRÊN ĐẦU (order-first) — trước đây
 * dải này rơi xuống DƯỚI toàn bộ thẻ câu trên mobile, tức xuất hiện đúng lúc không còn gì để nhảy tới.
 * Nền đục + blur để chữ thẻ câu cuộn phía sau không xuyên qua.
 */
export function ResultQuestionNav({ questions, labels }: { questions: TranscriptQuestion[]; labels?: Map<string, string> }) {
  const { t } = useLanguage();
  return (
    <nav
      className="order-first sticky top-0 z-10 -mx-4 bg-surface-base/95 px-4 py-2 backdrop-blur lg:order-none lg:top-6 lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
      aria-label={t('employer.campaigns.results.detail.questionNavigation')}
    >
      <p className="sr-only mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:not-sr-only">
        {t('employer.campaigns.results.detail.questions')}
      </p>
      <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2 lg:overflow-visible">
        {questions.map((question) => (
          <a
            key={question.questionId}
            href={`#q-${question.orderNo}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-satin bg-surface-raised px-3 py-2 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span>{t('employer.campaigns.results.detail.questionShort').replace('{{number}}', labels?.get(question.questionId) ?? String(question.orderNo))}</span>
            <span className="font-semibold text-foreground">{questionAverageScore(question)?.toFixed(1) ?? '—'}</span>
            {question.rejectReason === 'no_speech' ? <MicOff className="size-3.5 text-warning" aria-hidden /> : null}
            {question.needsReview ? <Eye className="size-3.5 text-warning" aria-hidden /> : null}
          </a>
        ))}
      </div>
    </nav>
  );
}
