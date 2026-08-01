import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { QuestionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { getQuestionStatusGroup } from '../../utils/practiceSessionResultFormat';
import { PracticeQuestionResultCard } from './PracticeQuestionResultCard';

interface ReportQuestionDetailProps {
  questions: QuestionResultViewModel[];
  activeQuestionIndex: number;
  onQuestionChange: (index: number) => void;
}

export function ReportQuestionDetail({
  questions,
  activeQuestionIndex,
  onQuestionChange,
}: ReportQuestionDetailProps) {
  const { t } = useLanguage();
  const question = questions[activeQuestionIndex];

  if (!questions.length || !question) {
    return (
      <p className="text-sm text-muted-foreground">{t('practice.result.noQuestionsDescription')}</p>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="report-questions-heading">
      <h2 id="report-questions-heading" className="text-lg font-semibold text-foreground">
        {t('practice.result.questionReview')}
      </h2>

      {questions.length > 1 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 text-xs font-semibold text-foreground/80">
            {t('practice.result.jumpToQuestion')}
          </span>
          <div
            role="tablist"
            aria-label={t('practice.result.jumpToQuestion')}
            className="flex gap-2"
          >
            {questions.map((item, index) => {
              const isActive = index === activeQuestionIndex;
              const group = getQuestionStatusGroup(item.status, item.answered);
              return (
                <button
                  key={item.questionId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  title={t(`practice.result.questionStatus.${group}`)}
                  onClick={() => onQuestionChange(index)}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
                    isActive
                      ? 'border-info/70 bg-gradient-to-r from-info/20 to-violet-500/20 text-info-light shadow-[0_0_14px_-8px_var(--color-info)]'
                      : group === 'graded' || group === 'answered'
                        ? 'border-success/40 bg-success/10 text-success-light hover:bg-success/15'
                        : 'border-satin bg-surface-overlay/30 text-muted-foreground hover:border-info/40 hover:bg-info/10 hover:text-info-light',
                  )}
                >
                  {t('practice.result.question')} {item.orderNo}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <PracticeQuestionResultCard
        key={question.answerId ?? question.questionId}
        question={question}
        defaultOpen
      />
    </section>
  );
}
