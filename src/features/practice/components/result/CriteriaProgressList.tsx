import {
  BookOpen,
  BriefcaseBusiness,
  Info,
  Lightbulb,
  MessageCircle,
  PenLine,
  Star,
  Target,
} from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CriteriaResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { formatScore } from '../../utils/practiceSessionResultFormat';

const CRITERIA_ACCENTS = [
  { Icon: Target, text: 'text-chart-cat-1', bg: 'bg-chart-cat-1/10', bar: 'bg-chart-cat-1' },
  { Icon: MessageCircle, text: 'text-chart-cat-2', bg: 'bg-chart-cat-2/10', bar: 'bg-chart-cat-2' },
  { Icon: BookOpen, text: 'text-chart-cat-6', bg: 'bg-chart-cat-6/10', bar: 'bg-chart-cat-6' },
  { Icon: PenLine, text: 'text-chart-cat-7', bg: 'bg-chart-cat-7/10', bar: 'bg-chart-cat-7' },
  { Icon: BriefcaseBusiness, text: 'text-chart-cat-5', bg: 'bg-chart-cat-5/10', bar: 'bg-chart-cat-5' },
  { Icon: Lightbulb, text: 'text-warning-light', bg: 'bg-warning-bg', bar: 'bg-warning' },
  { Icon: Star, text: 'text-chart-cat-3', bg: 'bg-chart-cat-3/10', bar: 'bg-chart-cat-3' },
] as const;

export function CriteriaProgressList({
  criteria,
  passThresholdPct,
  weighted = false,
}: {
  criteria: CriteriaResultViewModel[];
  passThresholdPct?: number;
  weighted?: boolean;
}) {
  const { t } = useLanguage();
  if (!criteria.length) {
    return <p className="text-sm text-muted-foreground">{t('practice.result.noCriteria')}</p>;
  }

  if (weighted) {
    const allContributionsKnown = criteria.every((item) => item.contribution != null);
    const totalContribution = criteria.reduce((sum, item) => sum + (item.contribution ?? 0), 0);
    return <div className="overflow-x-auto rounded-xl border border-satin"><table className="w-full min-w-[520px] text-sm">
      <thead className="bg-surface-overlay text-left text-xs uppercase text-muted-foreground"><tr>
        <th className="p-3">{t('practice.result.criteriaDetail')}</th><th className="p-3">{t('practice.result.score')}</th><th className="p-3">{t('practice.result.weight')}</th><th className="p-3">{t('practice.result.contribution')}</th>
      </tr></thead>
      <tbody>{criteria.map((item) => <tr key={item.name} className="border-t border-subtle">
        <th className="p-3 text-left font-medium text-foreground">{item.name}</th>
        <td className="p-3 tabular-nums">{formatScore(item.score, item.maxScore)}</td>
        <td className="p-3 tabular-nums">{item.effectiveWeight == null ? '—' : `${(item.effectiveWeight * 100).toFixed(2)}%`}</td>
        <td className="p-3 tabular-nums">{item.contribution == null ? '—' : `${item.contribution.toFixed(2)}%`}</td>
      </tr>)}</tbody>
      <tfoot className="border-t border-satin bg-surface-overlay/60"><tr>
        <th colSpan={3} className="p-3 text-right font-semibold">{t('practice.result.contributionTotal')}</th>
        <td className="p-3 font-semibold tabular-nums">{allContributionsKnown ? `${totalContribution.toFixed(2)}%` : '—'}</td>
      </tr></tfoot>
    </table></div>;
  }

  return (
    <ul className="space-y-2">
      {criteria.map((item, index) => {
        const accent = CRITERIA_ACCENTS[index % CRITERIA_ACCENTS.length];
        const Icon = accent.Icon;
        return (
          <li key={item.name} className="frame-satin-soft rounded-xl bg-surface-overlay/75 px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${accent.bg} ${accent.text}`}>
                <Icon className="size-5" strokeWidth={1.8} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-foreground">{item.name}</span>
                  <span className={`shrink-0 tabular-nums text-base font-semibold ${accent.text}`}>
                    {formatScore(item.score, item.maxScore)}
                  </span>
                </div>
                <div className="relative mt-2 h-1.5 overflow-visible rounded-full bg-surface-elevated">
                  <div className={`h-full rounded-full transition-[width] duration-500 ${accent.bar}`} style={{ width: `${item.pct}%` }} />
                  {passThresholdPct != null ? (
                    <span
                      className="absolute -top-1 h-3.5 w-px bg-white/80"
                      style={{ left: `${Math.max(0, Math.min(100, passThresholdPct))}%` }}
                      title={t('practice.result.passThresholdMarker')}
                      aria-hidden
                    />
                  ) : null}
                </div>
                {passThresholdPct != null ? (
                  <div className="mt-0.5 flex justify-end text-[10px] text-muted-foreground">
                    <span>{Math.round(passThresholdPct)}%</span>
                  </div>
                ) : null}
              </div>
            </div>
            {item.comment ? <p className="mt-2 pl-[52px] text-xs leading-relaxed text-muted-foreground">{item.comment}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function CriteriaThresholdNote({
  passThresholdPct,
  note,
}: {
  passThresholdPct?: number;
  note?: string;
}) {
  const { t } = useLanguage();
  if (!note && passThresholdPct == null) return null;
  return (
    <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>
        {note || t('practice.result.thresholdFallbackNote').replace('{{n}}', String(Math.round(passThresholdPct ?? 0)))}
      </span>
    </p>
  );
}
