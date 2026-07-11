import { memo, useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { QuestionFeedback } from '../../types/result.types';

interface QuestionFeedbackAccordionProps {
  items: QuestionFeedback[];
}

const FeedbackItem = memo(function FeedbackItem({ item }: { item: QuestionFeedback }) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(item.questionIndex === 1);
  const question = language === 'vi' ? item.questionVi : item.question;
  const summary = language === 'vi' ? item.summaryVi : item.summary;
  const strengths = language === 'vi' ? item.strengthsVi : item.strengths;
  const improvements = language === 'vi' ? item.improvementsVi : item.improvements;

  return (
    <article className="rounded-xl border border-subtle bg-surface-raised">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('practice.result.feedback.questionLabel').replace('{n}', String(item.questionIndex))}
          </p>
          <h3 className="heading-secondary text-base text-foreground">{question}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-surface-overlay px-3 py-1 text-xs font-semibold text-foreground">
            {item.score}/{item.maxScore}
          </span>
          {item.locked ? <Lock className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
          <ChevronDown
            className={['h-4 w-4 text-muted-foreground transition-transform', open ? 'rotate-180' : ''].join(' ')}
            aria-hidden
          />
        </div>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-subtle px-5 py-4">
          {item.locked ? (
            <p className="body-text text-sm text-muted-foreground">{t('practice.result.feedback.locked')}</p>
          ) : (
            <>
              <p className="body-text text-sm text-muted-foreground">{summary}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-lg bg-surface-base p-4">
                  <h4 className="text-sm font-semibold text-foreground">{t('practice.result.strengths')}</h4>
                  <ul className="mt-2 space-y-2">
                    {strengths.map((entry) => (
                      <li key={entry} className="body-text text-sm text-muted-foreground">
                        {entry}
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-lg bg-surface-overlay p-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    {t('practice.result.feedback.improvements')}
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {improvements.map((entry) => (
                      <li key={entry} className="body-text text-sm text-muted-foreground">
                        {entry}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          )}
        </div>
      ) : null}
    </article>
  );
});

export const QuestionFeedbackAccordion = memo(function QuestionFeedbackAccordion({
  items,
}: QuestionFeedbackAccordionProps) {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="question-feedback-title" className="space-y-4">
      <div>
        <h2 id="question-feedback-title" className="heading-secondary text-2xl text-foreground">
          {t('practice.result.feedback.title')}
        </h2>
        <p className="body-text mt-1 text-sm text-muted-foreground">{t('practice.result.feedback.subtitle')}</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <FeedbackItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
});
