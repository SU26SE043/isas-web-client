import {
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Lightbulb,
  Link2,
  ListChecks,
  MessageSquareText,
  SlidersHorizontal,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CriteriaResultViewModel } from '../../utils/practiceSessionResultViewModel';

const criterionTones: Array<{
  icon: LucideIcon;
  text: string;
  well: string;
  bar: string;
}> = [
  {
    icon: BadgeCheck,
    text: 'text-info-light',
    well: 'border-info/25 bg-info/10',
    bar: 'bg-info',
  },
  {
    icon: MessageSquareText,
    text: 'text-[var(--chart-cat-6)]',
    well: 'border-[color:var(--chart-cat-6)]/25 bg-[color:var(--chart-cat-6)]/10',
    bar: 'bg-[var(--chart-cat-6)]',
  },
  {
    icon: UsersRound,
    text: 'text-success-light',
    well: 'border-success/25 bg-success/10',
    bar: 'bg-success',
  },
  {
    icon: BriefcaseBusiness,
    text: 'text-warning-light',
    well: 'border-warning/25 bg-warning/10',
    bar: 'bg-warning',
  },
  {
    icon: Link2,
    text: 'text-[var(--chart-cat-5)]',
    well: 'border-[color:var(--chart-cat-5)]/25 bg-[color:var(--chart-cat-5)]/10',
    bar: 'bg-[var(--chart-cat-5)]',
  },
  {
    icon: Lightbulb,
    text: 'text-[var(--chart-cat-4)]',
    well: 'border-[color:var(--chart-cat-4)]/25 bg-[color:var(--chart-cat-4)]/10',
    bar: 'bg-[var(--chart-cat-4)]',
  },
  {
    icon: ListChecks,
    text: 'text-[var(--chart-cat-1)]',
    well: 'border-[color:var(--chart-cat-1)]/25 bg-[color:var(--chart-cat-1)]/10',
    bar: 'bg-[var(--chart-cat-1)]',
  },
];

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function scoreTone(score: number, maxScore: number): string {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return percentage < 50 ? 'text-error' : 'text-info-light';
}

function ScoreRing({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = Math.max(0, Math.min(100, maxScore > 0 ? (score / maxScore) * 100 : 0));
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const isBelowThreshold = percentage < 50;

  return (
    <div className="relative size-24 shrink-0" role="img" aria-label={`${Math.round(percentage)}%`}>
      <svg className="size-full -rotate-90" viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r={radius} fill="none" className="stroke-surface-highlight" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          className={`${isBelowThreshold ? 'stroke-error' : 'stroke-info'} transition-[stroke-dashoffset] duration-500`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percentage / 100) * circumference}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <ChartNoAxesCombined className={`size-5 ${isBelowThreshold ? 'text-error' : 'text-info'}`} aria-hidden />
      </div>
    </div>
  );
}

export function QuestionCriteriaPanel({
  criteria,
  score,
  maxScore,
}: {
  criteria: CriteriaResultViewModel[];
  score?: number;
  maxScore?: number;
}) {
  const { t } = useLanguage();

  return (
    <section className="overflow-hidden rounded-xl border border-satin bg-surface-raised">
      <div className="flex items-center gap-3 border-b border-satin px-4 py-3">
        <span className="inline-flex size-8 items-center justify-center rounded-lg border border-info/25 bg-info/10 text-info-light">
          <SlidersHorizontal className="size-4" aria-hidden />
        </span>
        <h4 className="font-semibold text-foreground">{t('practice.result.criteriaScores')}</h4>
      </div>

      {score != null && maxScore != null ? (
        <div className="flex items-center gap-4 border-b border-satin bg-surface-base/40 px-4 py-4">
          <ScoreRing score={score} maxScore={maxScore} />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('practice.result.questionScore')}
            </p>
            <p className="mt-1 flex items-baseline gap-1 tabular-nums">
              <span className={`text-3xl font-semibold ${scoreTone(score, maxScore)}`}>
                {formatScore(score)}
              </span>
              <span className="text-lg text-muted-foreground">/ {formatScore(maxScore)}</span>
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-2 p-3 sm:p-4">
        {criteria.map((criterion, index) => {
          const tone = criterionTones[index % criterionTones.length];
          const Icon = tone.icon;
          const pct = Math.max(0, Math.min(100, criterion.pct));

          return (
            <div key={criterion.name} className="frame-satin-soft rounded-xl bg-surface-overlay/75 px-3 py-3">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border ${tone.well} ${tone.text}`}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-snug text-foreground">{criterion.name}</p>
                    <span className={`shrink-0 rounded-lg border border-satin bg-surface-elevated px-2 py-1 text-sm font-semibold tabular-nums ${scoreTone(criterion.score, criterion.maxScore)}`}>
                      {formatScore(criterion.score)} / {formatScore(criterion.maxScore)}
                    </span>
                  </div>
                  {criterion.comment ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {criterion.comment}
                    </p>
                  ) : null}
                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-surface-highlight"
                    role="progressbar"
                    aria-label={criterion.name}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(pct)}
                  >
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
