import { ScanEye } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { buildFocusBreakdownLabel, countFocusGroups } from '../../utils/focusTrackingSummary';

/**
 * Ô "Mất tập trung" trong lưới thống kê: tổng số lần + tách nhóm ngay dưới (rời buổi · dán · khuôn mặt · che
 * camera) để con số gộp không che mất loại nào. Câu nhận xét đầy đủ nằm ở mục chi tiết bên dưới thẻ.
 */
export function FocusSummaryTile({ view }: { view: PracticeSessionResultViewModel }) {
  const { t } = useLanguage();
  if (view.focusEvents === null || view.focusEvents === undefined) return null;
  const { total } = countFocusGroups(view.focusEvents);
  const breakdown = total > 0 ? buildFocusBreakdownLabel(view, t) : t('practice.result.focusTracking.empty');
  return (
    <div className="relative flex min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-satin bg-surface-overlay/80 p-4 sm:p-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-elevated text-foreground">
        <ScanEye className="size-6" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{t('practice.result.focusTracking.label')}</p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${total > 0 ? 'text-warning' : 'text-foreground'}`}>×{total}</p>
        <p data-testid="focus-tile-breakdown" className="mt-1 text-xs text-muted-foreground">{breakdown}</p>
      </div>
    </div>
  );
}
