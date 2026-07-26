import { useLanguage } from '@/shared/languages';
import type {
  PracticeSessionResponse,
  PracticeSessionResult,
} from '../../types/b2cPracticeSession.types';

function FeedbackList({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function PracticeOverallFeedback({
  result,
  session,
}: {
  result: PracticeSessionResult;
  session: PracticeSessionResponse;
}) {
  const { t } = useLanguage();
  return (
    <section id="feedback" className="scroll-mt-24 space-y-5">
      <h2 className="text-xl font-semibold text-foreground">
        {t('practice.result.overallReport')}
      </h2>
      {result.overallComment ? (
        <div className="frame-satin rounded-2xl border border-satin bg-surface-overlay p-5">
          <h3 className="font-semibold text-foreground">{t('practice.result.overallComment')}</h3>
          <p className="mt-3 leading-relaxed text-foreground">{result.overallComment}</p>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {result.strengths?.length ? (
          <div className="rounded-2xl border border-success/30 bg-success-bg p-5">
            <h3 className="font-semibold text-success-light">{t('practice.result.strengths')}</h3>
            <FeedbackList items={result.strengths} />
          </div>
        ) : null}
        <div className="rounded-2xl border border-warning/30 bg-warning-bg p-5">
          <h3 className="font-semibold text-warning-light">
            {t('practice.result.needsImprovement')}
          </h3>
          {result.needsImprovement.length ? (
            <FeedbackList items={result.needsImprovement} />
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {t('practice.result.needsImprovementEmpty')}
            </p>
          )}
        </div>
      </div>
      {result.nextSteps?.length ? (
        <div className="rounded-2xl border border-info/30 bg-info-bg p-5">
          <h3 className="font-semibold text-info-light">{t('practice.result.nextSteps')}</h3>
          <FeedbackList items={result.nextSteps} />
        </div>
      ) : null}
      {session.cvId && result.cvVsAnswer ? (
        <div className="frame-satin rounded-2xl border border-satin bg-surface-raised p-5">
          <h3 className="font-semibold text-foreground">{t('practice.result.cvVsAnswer')}</h3>
          {result.cvVsAnswer.summary ? (
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {result.cvVsAnswer.summary}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
