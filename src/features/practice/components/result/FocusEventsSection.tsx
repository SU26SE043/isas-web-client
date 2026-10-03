import { ScanEye } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { FocusEventsAnalysis } from './FocusEventsAnalysis';

/**
 * Mục "Mất tập trung trong buổi" hiện THẲNG trong tab Tổng quan (2026-10-03). Trước đó chi tiết chỉ nằm
 * trong popup của nút đầu trang ⇒ người luyện xong buổi không thấy "có 2 người" / "che camera" ở đâu,
 * dù server đã ghi. Chỉ render khi có ít nhất một sự kiện: `null` (không theo dõi) và `[]` (theo dõi,
 * không có gì) đã có ô tổng hợp nói thay.
 */
export function FocusEventsSection({ view }: { view: PracticeSessionResultViewModel }) {
  const { t } = useLanguage();
  if (!view.focusEvents || view.focusEvents.length === 0) return null;
  return (
    <section aria-labelledby="focus-events-heading" className="frame-satin rounded-2xl border border-satin bg-surface-raised p-5 sm:p-7">
      <header className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-warning/10 text-warning ring-1 ring-warning/20">
          <ScanEye className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="focus-events-heading" className="text-xl font-semibold tracking-tight text-foreground">
            {t('practice.result.focusTracking.title')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('practice.result.focusTracking.description')}</p>
        </div>
      </header>
      <div className="mt-5">
        <FocusEventsAnalysis view={view} />
      </div>
    </section>
  );
}
