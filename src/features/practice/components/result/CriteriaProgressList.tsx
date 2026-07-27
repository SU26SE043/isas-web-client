import { Info } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CriteriaResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { formatScore } from '../../utils/practiceSessionResultFormat';

export function CriteriaProgressList({
  criteria,
  passThresholdPct,
}: {
  criteria: CriteriaResultViewModel[];
  passThresholdPct?: number;
}) {
  const { t } = useLanguage();
  if (!criteria.length) {
    return (
      <p className="text-sm text-muted-foreground">{t('practice.result.noCriteria')}</p>
    );
  }

  return (
    <ul className="space-y-5">
      {criteria.map((item) => (
        <li key={item.name} className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {formatScore(item.score, item.maxScore)}
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-surface-overlay">
            <div
              className="h-full rounded-full bg-info"
              style={{ width: `${item.pct}%` }}
            />
            {passThresholdPct != null ? (
              <span
                className="absolute top-0 h-full w-0.5 bg-info"
                style={{ left: `${Math.max(0, Math.min(100, passThresholdPct))}%` }}
                title={t('practice.result.passThresholdMarker')}
                aria-hidden
              />
            ) : null}
          </div>
          {item.comment ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{item.comment}</p>
          ) : null}
        </li>
      ))}
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
        {note ||
          t('practice.result.thresholdFallbackNote').replace(
            '{{n}}',
            String(Math.round(passThresholdPct ?? 0)),
          )}
      </span>
    </p>
  );
}
