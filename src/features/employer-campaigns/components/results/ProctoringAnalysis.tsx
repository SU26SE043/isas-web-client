import { AppWindow, Clock3, TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultFlag } from '../../types/campaign.api.types';
import { getResultFlagCount } from '../../utils/campaignResultsActions';
import { ResultFlagSourceLabel } from './ResultFlagSourceLabel';

interface ProctoringAnalysisProps {
  flags: CampaignResultFlag[];
}

const TIME_FLAG_TYPES = new Set([
  'timeviolation',
  'timeexceeded',
  'durationexceeded',
  'overtime',
]);

function normalizedFlagType(type: string) {
  return type.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function ProctoringAnalysis({ flags }: ProctoringAnalysisProps) {
  const { t } = useLanguage();
  const totalViolations = getResultFlagCount(flags);
  const timeViolations = getResultFlagCount(
    flags.filter((flag) => TIME_FLAG_TYPES.has(normalizedFlagType(flag.type))),
  );
  // Ranking is the source of truth for the total. Any non-time event belongs
  // to the existing window/focus metric, even when the backend adds a new
  // event name that the frontend has not seen yet.
  const windowViolations = Math.max(0, totalViolations - timeViolations);
  const hasViolations = totalViolations > 0;

  return (
    <section className="frame-satin rounded-xl bg-surface-raised p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-warning/25 bg-warning-bg text-warning">
          <TriangleAlert className="size-4" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {t('employer.campaigns.results.proctoring.title')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('employer.campaigns.results.proctoring.description')}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ProctoringMetric
          icon={AppWindow}
          value={windowViolations}
          label={t('employer.campaigns.results.proctoring.windowViolations')}
          hint={t('employer.campaigns.results.proctoring.windowViolationsHint')}
          hasViolation={windowViolations > 0}
        />
        <ProctoringMetric
          icon={Clock3}
          value={timeViolations}
          suffix={t('employer.campaigns.results.proctoring.minutes')}
          label={t('employer.campaigns.results.proctoring.timeViolations')}
          hint={t('employer.campaigns.results.proctoring.timeViolationsHint')}
          hasViolation={timeViolations > 0}
        />
      </div>

      {flags.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm text-warning">
          {flags.map((flag) => (
            <li key={`${flag.type}-${flag.count}-${flag.note ?? ''}`}>
              <span className="font-medium">
                {flag.type}: {flag.count}
              </span>
              <ResultFlagSourceLabel flag={flag} />
              {flag.note?.trim() ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {flag.note.trim()}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {!hasViolations ? (
        <p className="mt-3 text-sm text-success">
          {t('employer.campaigns.results.proctoring.none')}
        </p>
      ) : null}
    </section>
  );
}

function ProctoringMetric({
  icon: Icon,
  value,
  suffix,
  label,
  hint,
  hasViolation,
}: {
  icon: typeof AppWindow;
  value: number;
  suffix?: string;
  label: string;
  hint: string;
  hasViolation: boolean;
}) {
  return (
    <div className="rounded-xl border border-satin bg-surface-overlay p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
        <span className={hasViolation ? 'text-warning' : 'text-success'}>
          <TriangleAlert className="size-4" aria-hidden />
        </span>
      </div>
      <p className={`mt-4 text-3xl font-semibold tabular-nums ${hasViolation ? 'text-warning' : 'text-foreground'}`}>
        {String(value).padStart(2, '0')}
        {suffix ? <span className="ml-1 text-base font-medium">{suffix}</span> : null}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
