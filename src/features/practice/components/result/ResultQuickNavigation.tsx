import { useLanguage } from '@/shared/languages';
import type { QuestionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { getQuestionStatusGroup } from '../../utils/practiceSessionResultFormat';

const sections = [
  ['overview', 'practice.result.quickOverview'],
  ['criteria', 'practice.result.quickCriteria'],
  ['questions', 'practice.result.quickQuestions'],
  ['feedback', 'practice.result.quickFeedback'],
] as const;

export function ResultQuickNavigation({
  questions,
}: {
  questions: QuestionResultViewModel[];
}) {
  const { t } = useLanguage();

  return (
    <nav
      className="sticky top-0 z-10 space-y-3 border-y border-satin bg-surface-base/90 py-3 backdrop-blur"
      aria-label={t('practice.result.quickNavLabel')}
    >
      <div className="flex gap-2 overflow-x-auto">
        {sections.map(([id, key]) => (
          <a key={id} href={`#${id}`} className="btn-secondary shrink-0 text-xs">
            {t(key)}
          </a>
        ))}
      </div>
      {questions.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t('practice.result.jumpToQuestion')}
          </span>
          {questions.map((question) => {
            const group = getQuestionStatusGroup(question.status, question.answered);
            return (
              <a
                key={question.questionId}
                href={`#question-${question.orderNo}`}
                className="rounded-md border border-satin bg-surface-overlay px-2 py-1 text-xs text-foreground hover:bg-surface-highlight"
                title={t(`practice.result.questionStatus.${group}`)}
              >
                {t('practice.result.question')} {question.orderNo}
              </a>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
}
