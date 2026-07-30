import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import {
  formatResultDateTime,
  formatSessionDuration,
  getSessionStatusGroup,
} from '../../utils/practiceSessionResultFormat';

const statusClass = {
  graded: 'border-success/30 bg-success/10 text-success',
  completed: 'border-success/30 bg-success/10 text-success',
  inProgress: 'border-info/30 bg-info/10 text-info',
  processing: 'border-warning/30 bg-warning/10 text-warning',
  cancelled: 'border-subtle bg-surface-overlay text-muted-foreground',
  unknown: 'border-subtle bg-surface-overlay text-muted-foreground',
} as const;

export function SessionResultHeader({ view }: { view: PracticeSessionResultViewModel }) {
  const { t, language } = useLanguage();
  const group = getSessionStatusGroup(view.status);
  const statusLabel =
    group === 'unknown'
      ? view.status || t('practice.result.status.unknown')
      : t(`practice.result.status.${group}`);

  const duration = formatSessionDuration(view.durationSeconds, {
    seconds: (n) => t('practice.result.durationSeconds').replace('{{n}}', String(n)),
    minutes: (n) => t('practice.result.durationMinutes').replace('{{n}}', String(n)),
    minutesSeconds: (m, s) =>
      t('practice.result.durationMinutesSeconds')
        .replace('{{m}}', String(m))
        .replace('{{s}}', String(s)),
  });

  const when =
    formatResultDateTime(view.completedAt ?? view.createdAt, language) ??
    t('practice.result.dateUnknown');

  return (
    <header className="space-y-4">
      <Link
        to="/candidate/practice/history"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('practice.result.backToList')}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <h1 className="heading-primary text-2xl text-foreground sm:text-3xl">
            {t('practice.result.session')}
            {view.jobCategory ? ` · ${view.jobCategory}` : ''}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {view.level ? <span>{view.level}</span> : null}
            <Badge variant="outline" className={cn(statusClass[group])}>
              {statusLabel}
            </Badge>
          </div>
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <div>
          <dt className="sr-only">{t('practice.result.completedAt')}</dt>
          <dd>
            <time dateTime={view.completedAt ?? view.createdAt ?? undefined}>{when}</time>
          </dd>
        </div>
        {duration ? (
          <div>
            <dt className="sr-only">{t('practice.result.duration')}</dt>
            <dd>{duration}</dd>
          </div>
        ) : null}
        <div>
          <dt className="sr-only">{t('practice.result.answered')}</dt>
          <dd>
            {view.answeredCount}/{view.totalQuestions} {t('practice.result.questionsAnswered')}
          </dd>
        </div>
      </dl>
    </header>
  );
}
