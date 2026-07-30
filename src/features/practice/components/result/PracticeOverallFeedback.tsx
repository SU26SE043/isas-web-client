import { useLanguage } from '@/shared/languages';

function FeedbackList({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function PracticeOverallFeedback({
  overallFeedback,
  strengths,
  improvements,
  nextSteps,
  cvVsAnswerSummary,
}: {
  overallFeedback?: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  cvVsAnswerSummary?: string;
}) {
  const { t } = useLanguage();
  const hasContent =
    Boolean(overallFeedback) ||
    strengths.length > 0 ||
    improvements.length > 0 ||
    nextSteps.length > 0 ||
    Boolean(cvVsAnswerSummary);

  if (!hasContent) return null;

  return (
    <section className="space-y-5" aria-labelledby="report-summary-heading">
      <h2 id="report-summary-heading" className="text-xl font-semibold text-foreground">
        {t('practice.result.quickFeedback')}
      </h2>

      {overallFeedback ? (
        <div className="frame-satin rounded-2xl border border-satin bg-surface-overlay p-5">
          <h3 className="font-semibold text-foreground">{t('practice.result.overallComment')}</h3>
          <p className="mt-3 leading-relaxed text-foreground">{overallFeedback}</p>
        </div>
      ) : null}

      {(strengths.length > 0 || improvements.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {strengths.length ? (
            <div className="rounded-2xl border border-success/30 bg-success-bg p-5">
              <h3 className="font-semibold text-success-light">{t('practice.result.strengths')}</h3>
              <FeedbackList items={strengths} />
            </div>
          ) : null}
          {improvements.length ? (
            <div className="rounded-2xl border border-warning/30 bg-warning-bg p-5">
              <h3 className="font-semibold text-warning-light">
                {t('practice.result.needsImprovement')}
              </h3>
              <FeedbackList items={improvements} />
            </div>
          ) : null}
        </div>
      )}

      {nextSteps.length ? (
        <div className="rounded-2xl border border-info/30 bg-info-bg p-5">
          <h3 className="font-semibold text-info-light">{t('practice.result.nextSteps')}</h3>
          <FeedbackList items={nextSteps} />
        </div>
      ) : null}

      {cvVsAnswerSummary ? (
        <div className="frame-satin rounded-2xl border border-satin bg-surface-raised p-5">
          <h3 className="font-semibold text-foreground">{t('practice.result.cvVsAnswer')}</h3>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{cvVsAnswerSummary}</p>
        </div>
      ) : null}
    </section>
  );
}
