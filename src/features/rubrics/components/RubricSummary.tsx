import { BadgeCheck, ClipboardList, PieChart, Star } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { WeightStatus } from '../types/rubric.types';

interface RubricSummaryProps {
  criteriaCount: number;
  totalWeightLabel: string;
  totalMaxScore: number;
  weightStatus: WeightStatus;
}

export function RubricSummary({
  criteriaCount,
  totalWeightLabel,
  totalMaxScore,
  weightStatus,
}: RubricSummaryProps) {
  const { t } = useLanguage();

  const statusValid = weightStatus === 'valid';
  const statusLabel = statusValid
    ? t('rubrics.summary.statusValid')
    : weightStatus === 'under'
      ? t('rubrics.summary.statusUnder')
      : t('rubrics.summary.statusOver');

  const items = [
    {
      label: t('rubrics.summary.criteriaCount'),
      value: String(criteriaCount),
      icon: <ClipboardList className="size-4 text-muted-foreground" aria-hidden />,
      tone: 'default' as const,
      hint: undefined,
    },
    {
      label: t('rubrics.summary.totalWeight'),
      value: totalWeightLabel,
      icon: <PieChart className="size-4 text-muted-foreground" aria-hidden />,
      tone: statusValid ? ('success' as const) : ('warning' as const),
      hint: undefined,
    },
    {
      label: t('rubrics.summary.totalMaxScore'),
      value: String(totalMaxScore),
      icon: <Star className="size-4 text-muted-foreground" aria-hidden />,
      tone: 'default' as const,
      hint: undefined,
    },
    {
      label: t('rubrics.summary.status'),
      value: statusLabel,
      icon: (
        <BadgeCheck
          className={cn('size-4', statusValid ? 'text-success' : 'text-warning')}
          aria-hidden
        />
      ),
      tone: statusValid ? ('success' as const) : ('warning' as const),
      hint: statusValid ? t('rubrics.summary.statusValidHint') : undefined,
    },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="frame-satin rounded-xl border border-satin bg-surface-raised px-4 py-3"
        >
          <dt className="flex items-center justify-between gap-2 text-caption text-muted-foreground">
            <span>{item.label}</span>
            {item.icon}
          </dt>
          <dd
            className={cn(
              'mt-2 text-2xl font-semibold tracking-tight text-foreground',
              item.tone === 'success' && 'text-success',
              item.tone === 'warning' && 'text-warning',
            )}
          >
            {item.value}
          </dd>
          {item.hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
