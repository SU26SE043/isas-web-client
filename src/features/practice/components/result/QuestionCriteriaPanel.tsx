import {
  BadgeCheck,
  BriefcaseBusiness,
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
    <section className="rounded-xl border border-satin p-3 sm:p-4">
      <h4 className="flex items-center gap-2 font-semibold text-foreground">
        <SlidersHorizontal className="size-4 text-info-light" aria-hidden />
        {t('practice.result.criteriaScores')}
      </h4>

      <div className="mt-3 space-y-2">
        {criteria.map((criterion, index) => {
          const tone = criterionTones[index % criterionTones.length];
          const Icon = tone.icon;
          const pct = Math.max(0, Math.min(100, criterion.pct));

          return (
            <div key={criterion.name} className="frame-satin-soft rounded-lg px-3 py-2.5">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border ${tone.well} ${tone.text}`}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-snug text-foreground">{criterion.name}</p>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatScore(criterion.score)} / {formatScore(criterion.maxScore)}
                    </span>
                  </div>
                  {criterion.comment ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {criterion.comment}
                    </p>
                  ) : null}
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-highlight"
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

      {score != null && maxScore != null ? (
        <div className="mt-3 flex items-center justify-between border-t border-satin/70 pt-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t('practice.result.questionScore')}
          </span>
          <span className="font-semibold tabular-nums text-info-light">
            {formatScore(score)} / {formatScore(maxScore)}
          </span>
        </div>
      ) : null}
    </section>
  );
}
