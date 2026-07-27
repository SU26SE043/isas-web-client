import { cn } from '@/lib/utils';

type StatTone = 'neutral' | 'success' | 'warning' | 'info';

const toneStyles: Record<StatTone, { card: string; value: string }> = {
  neutral: {
    card: 'border-satin bg-surface-overlay',
    value: 'text-foreground',
  },
  success: {
    card: 'border-success/35 bg-success-bg',
    value: 'text-success-light',
  },
  warning: {
    card: 'border-warning/35 bg-warning-bg',
    value: 'text-warning-light',
  },
  info: {
    card: 'border-info/35 bg-info-bg',
    value: 'text-info-light',
  },
};

export function PracticeHistoryStatCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: StatTone;
}) {
  const styles = toneStyles[tone];

  return (
    <div className={cn('rounded-xl border px-3 py-3', styles.card)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-xl font-semibold tabular-nums', styles.value)}>{value}</p>
    </div>
  );
}
