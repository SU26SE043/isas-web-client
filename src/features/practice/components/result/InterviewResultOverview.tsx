import { memo } from 'react';
import { CalendarClock } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { InterviewResult } from '../../types/result.types';
import { ScoreDial } from './ScoreDial';

interface InterviewResultOverviewProps {
  result: InterviewResult;
  summaryText: string;
  strengthText: string[];
  weaknessText: string[];
  locale: string;
}

export const InterviewResultOverview = memo(function InterviewResultOverview({
  result,
  summaryText,
  strengthText,
  weaknessText,
  locale,
}: InterviewResultOverviewProps) {
  const { t } = useLanguage();

  return (
    <aside className="space-y-6 rounded-3xl border border-subtle bg-surface-raised p-6 shadow-sm">
      <ScoreDial score={result.overallScore} label={t('practice.result.overallScore')} />

      <div className="rounded-xl bg-surface-base p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CalendarClock className="h-4 w-4" />
          {t('practice.result.completedAt')}
        </div>
        <p className="mt-2 body-text text-sm text-muted-foreground">
          {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
            new Date(result.completedAt),
          )}
        </p>
      </div>

      <div>
        <h2 className="heading-secondary text-xl text-foreground">{t('practice.result.summary')}</h2>
        <p className="body-text mt-2 text-sm text-muted-foreground">{summaryText}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-surface-raised/5 p-4">
          <h3 className="text-sm font-semibold text-foreground">{t('practice.result.strengths')}</h3>
          <ul className="mt-3 space-y-2">
            {strengthText.map((item) => (
              <li key={item} className="body-text flex gap-2 text-sm text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-surface-raised" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-surface-overlay p-4">
          <h3 className="text-sm font-semibold text-foreground">{t('practice.result.weaknesses')}</h3>
          <ul className="mt-3 space-y-2">
            {weaknessText.map((item) => (
              <li key={item} className="body-text flex gap-2 text-sm text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-surface-overlay" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
});
