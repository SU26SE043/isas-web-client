import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { QuestionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { getQuestionStatusGroup } from '../../utils/practiceSessionResultFormat';
import { PracticeQuestionResultCard } from './PracticeQuestionResultCard';

interface ReportQuestionDetailProps {
  questions: QuestionResultViewModel[];
  sessionId: string;
  activeQuestionIndex: number;
  onQuestionChange: (index: number) => void;
}

export function ReportQuestionDetail({
  questions,
  sessionId,
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
          <span className="shrink-0 text-xs text-muted-foreground">
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
                    'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
                    isActive
                      ? 'border-satin bg-surface-elevated text-foreground'
                      : 'border-satin bg-transparent text-foreground/80 hover:bg-surface-overlay',
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
        sessionId={sessionId}
        defaultOpen
      />
    </section>
  );
}
