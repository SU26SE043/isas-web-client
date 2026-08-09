import type { ReactNode } from 'react';
import {
  BarChart3,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  MessageSquareText,
  SkipForward,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { formatScore } from '../../utils/practiceSessionResultFormat';

function scoreTone(score: number | undefined, maxScore: number) {
  if (score == null) return 'text-muted-foreground';
  const percentage = (score / maxScore) * 100;
  return percentage >= 80 ? 'text-success' : percentage >= 50 ? 'text-warning' : 'text-error';
}

function splitScore(score: number | undefined, maxScore: number) {
  if (score == null || !Number.isFinite(score)) return { value: '—', max: `/${maxScore}` };
  const value = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return { value, max: `/${maxScore}` };
}

function StatCard({
  icon,
  label,
  value,
  tone = 'info',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: 'info' | 'violet' | 'neutral';
}) {
  return (
    <div className="relative flex min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-satin bg-surface-overlay/80 p-4 sm:p-5">
      <span
        className={cn(
          'grid size-12 shrink-0 place-items-center rounded-full bg-info/10 text-info',
          tone === 'violet' && 'bg-chart-cat-6/10 text-chart-cat-6',
          tone === 'neutral' && 'bg-surface-elevated text-foreground',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}

/** Overall result block styled as the report's visual anchor. */
export function SessionSummaryCard({ view }: { view: PracticeSessionResultViewModel }) {
  const { t } = useLanguage();
  const score = view.overallScore;
  const maxScore = view.maxScore || 100;
  const scoreParts = splitScore(score, maxScore);
  const scorePercentage = score == null ? 0 : Math.min(100, Math.max(0, (score / maxScore) * 100));
  const passed =
    score != null && view.passThresholdPct != null
      ? scorePercentage >= view.passThresholdPct
      : null;

  return (
    <section className="frame-satin relative isolate overflow-hidden rounded-3xl border border-satin bg-surface-raised p-5 sm:p-7 lg:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.1),transparent_30%),radial-gradient(circle_at_12%_100%,rgba(255,255,255,0.04),transparent_34%)]"
      />

      <header className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-info/10 text-info ring-1 ring-info/20">
          <ClipboardCheck className="size-5" aria-hidden />
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t('practice.result.summary')}
        </h2>
      </header>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center lg:gap-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className={cn('relative grid size-36 shrink-0 place-items-center rounded-full p-2 sm:size-40', scoreTone(score, maxScore))}
            style={{ background: `conic-gradient(currentColor ${scorePercentage}%, var(--surface-overlay) 0)` }}
            aria-label={`${t('practice.result.overallScore')}: ${formatScore(score, maxScore)}`}
            role="img"
          >
            <div className="grid size-full place-items-center rounded-full bg-surface-raised ring-1 ring-surface-elevated">
              <Trophy className="size-8" aria-hidden />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 tabular-nums">
              <span className={cn('text-6xl font-semibold tracking-tight sm:text-7xl', scoreTone(score, maxScore))}>
                {scoreParts.value}
              </span>
              <span className="text-2xl font-medium text-muted-foreground sm:text-3xl">{scoreParts.max}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {view.answeredCount}/{view.totalQuestions} {t('practice.result.questionsAnswered')}
            </p>
            {passed != null ? (
              <p className={cn('mt-4 flex flex-wrap items-center gap-2 text-sm font-medium', passed ? 'text-success' : 'text-warning')}>
                {passed ? <CheckCircle2 className="size-4" aria-hidden /> : <CircleAlert className="size-4" aria-hidden />}
                <span>{passed ? t('practice.result.passed') : t('practice.result.notPassed')}</span>
                {view.passThresholdPct != null ? (
                  <span>· {t('practice.result.passThreshold').replace('{{n}}', String(Math.round(view.passThresholdPct)))}</span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative hidden min-h-44 items-center justify-center lg:flex" aria-hidden>
          <div className="absolute size-44 rounded-full border border-info/20" />
          <div className="absolute size-32 rounded-full border border-dashed border-info/20" />
          <div className="absolute right-5 top-1 grid size-12 place-items-center rounded-xl border border-satin bg-surface-overlay text-info shadow-lg shadow-info/10">
            <ClipboardCheck className="size-6" />
          </div>
          <div className="absolute bottom-2 left-4 grid size-12 place-items-center rounded-xl border border-satin bg-surface-overlay text-chart-cat-1 shadow-lg shadow-info/10">
            <BarChart3 className="size-6" />
          </div>
          <div className="grid size-20 place-items-center rounded-2xl border border-info/30 bg-info/10 text-info shadow-xl shadow-info/10">
            <MessageSquareText className="size-9" />
          </div>
        </div>
      </div>

      {view.overallFeedback ? (
        <div className="mt-7 flex gap-4 rounded-2xl border border-info/30 bg-surface-base/70 p-4 sm:p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-info/10 text-info">
            <MessageSquareText className="size-5" aria-hidden />
          </span>
          <p className="min-w-0 self-center leading-relaxed text-foreground">{view.overallFeedback}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<ClipboardCheck className="size-6" aria-hidden />}
          label={t('practice.result.answered')}
          value={`${view.answeredCount}/${view.totalQuestions}`}
        />
        <StatCard
          icon={<SkipForward className="size-6" aria-hidden />}
          label={t('practice.result.skipped')}
          value={String(view.skippedCount)}
          tone="violet"
        />
        <StatCard
          icon={<Clock3 className="size-6" aria-hidden />}
          label={t('practice.result.averageDuration')}
          value={
            view.averageDurationSec == null
              ? t('practice.result.noData')
              : t('practice.result.durationSeconds').replace('{{n}}', String(view.averageDurationSec))
          }
          tone="neutral"
        />
      </div>
    </section>
  );
}
