import { LogOut } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';

export function FocusSummaryTile({ view }: { view: PracticeSessionResultViewModel }) {
  const { t } = useLanguage();
  if (view.focusEvents === null || view.focusEvents === undefined) return null;
  const count = view.focusLeaveCount ?? 0;
  const placement = view.focusLeavePlacement ? t(`practice.result.focusTracking.${view.focusLeavePlacement}`) : '';
  const message = count > 0
    ? t('practice.result.focusTracking.message').replace('{{n}}', String(count)).replace('{{placement}}', placement ? `, ${placement}` : '')
    : t('practice.result.focusTracking.empty');
  return (
    <>
      <div className="relative flex min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-satin bg-surface-overlay/80 p-4 sm:p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-elevated text-foreground">
          <LogOut className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{t('practice.result.focusTracking.label')}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">×{count}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground sm:col-span-4">{message}</p>
    </>
  );
}
