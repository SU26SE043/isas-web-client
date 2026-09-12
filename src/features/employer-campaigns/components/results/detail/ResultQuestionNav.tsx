import { Eye, MicOff } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { QuestionGroup } from '@/shared/utils/questionNumbering';
import type { TranscriptQuestion } from '../../../types/campaign.api.types';
import { questionAverageScore } from '../../../utils/resultDetailViewModel';

/**
 * Nhảy câu — CHỈ liệt kê câu gốc (1 · 2 · 3…), câu theo sau hiện lồng dưới thẻ gốc nên không cần chip riêng
 * (trước đó buổi 5 gốc × 3 tầng là 20 chip; HR bấm "Câu 1.2" rồi vẫn phải cuộn tìm câu 1). Chip mang `+N`
 * khi câu gốc có N câu theo sau. ≥lg là rail dính bên phải; dưới lg là DẢI CHIP NGANG DÍNH TRÊN ĐẦU
 * (order-first) — trước đây dải này rơi xuống DƯỚI toàn bộ thẻ câu trên mobile, tức xuất hiện đúng lúc không
 * còn gì để nhảy tới. Nền đục + blur để chữ thẻ câu cuộn phía sau không xuyên qua.
 */
export function ResultQuestionNav({ groups, labels }: { groups: QuestionGroup<TranscriptQuestion>[]; labels?: Map<string, string> }) {
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
        {groups.map(({ root, children }) => (
          <a
            key={root.questionId}
            href={`#q-${root.orderNo}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-satin bg-surface-raised px-3 py-2 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span>{t('employer.campaigns.results.detail.questionShort').replace('{{number}}', labels?.get(root.questionId) ?? String(root.orderNo))}</span>
            {children.length ? (
              <span className="opacity-70" aria-label={t('employer.campaigns.results.detail.followUpCount').replace('{{n}}', String(children.length))}>
                +{children.length}
              </span>
            ) : null}
            <span className="font-semibold text-foreground">{questionAverageScore(root)?.toFixed(1) ?? '—'}</span>
            {root.rejectReason === 'no_speech' ? <MicOff className="size-3.5 text-warning" aria-hidden /> : null}
            {root.needsReview ? <Eye className="size-3.5 text-warning" aria-hidden /> : null}
          </a>
        ))}
      </div>
    </nav>
  );
}
