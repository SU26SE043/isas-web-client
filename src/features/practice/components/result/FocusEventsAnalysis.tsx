import { AppWindow, CameraOff, ScanFace } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { FocusEventSummary } from '../../types/b2cPracticeSession.types';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { formatResultTime } from '../../utils/practiceSessionResultFormat';
import { FOCUS_GROUP_ORDER, buildFocusSummaryMessage, countFocusGroups, focusGroupOf, type FocusGroup } from '../../utils/focusTrackingSummary';

const GROUP_ICON: Record<FocusGroup, typeof AppWindow> = { window: AppWindow, face: ScanFace, camera: CameraOff };

/** Thứ tự dòng chi tiết = thứ tự ô số (rời buổi → khuôn mặt → che cam), không theo thứ tự server trả. */
const TYPE_ORDER: ReadonlyArray<FocusEventSummary['signalType']> = ['tab_switch', 'focus_lost', 'no_face', 'multiple_faces', 'camera_blocked'];

/**
 * Từ `sm`: ô dùng `grid-rows-subgrid` — nhãn · số · gợi ý của các ô cùng hàng chung 3 hàng lưới ⇒ nhãn xuống dòng
 * ở một ô (vd "Rời tab / cửa sổ" khi hẹp) không đẩy con số của riêng ô đó lệch khỏi các ô bên cạnh.
 * Dưới `sm`: mỗi ô là một hàng gọn (nhãn + gợi ý bên trái, số bên phải) để 3 ô không chiếm hết màn hình điện thoại.
 */
function FocusMetric({ group, value }: { group: FocusGroup; value: number }) {
  const { t } = useLanguage();
  const Icon = GROUP_ICON[group];
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-xl border border-satin bg-surface-overlay p-4 sm:row-span-3 sm:grid-cols-1 sm:grid-rows-subgrid sm:items-start sm:gap-y-2">
      <p className="flex items-start gap-2 text-sm font-medium text-foreground">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        {t(`practice.result.focusTracking.group.${group}`)}
      </p>
      <p data-testid={`focus-metric-${group}`} className={cn('col-start-2 row-span-2 row-start-1 text-2xl font-semibold tabular-nums sm:col-start-1 sm:row-span-1 sm:row-start-2 sm:text-3xl', value > 0 ? 'text-warning' : 'text-muted-foreground')}>
        {String(value).padStart(2, '0')}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">{t(`practice.result.focusTracking.group.${group}Hint`)}</p>
    </div>
  );
}

function FocusEventRow({ event }: { event: FocusEventSummary }) {
  const { t, language } = useLanguage();
  const firstAt = formatResultTime(event.firstAt, language) ?? '—';
  const lastAt = formatResultTime(event.lastAt, language) ?? '—';
  const when = firstAt === lastAt
    ? `${t('practice.result.focusTracking.at')} ${firstAt}`
    : `${t('practice.result.focusTracking.firstAt')} ${firstAt} · ${t('practice.result.focusTracking.lastAt')} ${lastAt}`;
  return (
    <li data-testid={`focus-event-${event.signalType}`} className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{t(`practice.result.focusTracking.type.${event.signalType}`)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{when}</p>
      </div>
      <span className="shrink-0 rounded-full bg-warning/10 px-2.5 py-0.5 text-sm font-semibold text-warning tabular-nums">×{event.count}</span>
    </li>
  );
}

export function FocusEventsAnalysis({ view }: { view: PracticeSessionResultViewModel }) {
  const { t } = useLanguage();
  const counts = countFocusGroups(view.focusEvents);
  const events = (view.focusEvents ?? [])
    .filter((event) => focusGroupOf(event.signalType) !== null)
    .sort((a, b) => TYPE_ORDER.indexOf(a.signalType) - TYPE_ORDER.indexOf(b.signalType));
  const message = buildFocusSummaryMessage(view, t);

  // Không bọc frame: nội dung nằm TRONG Dialog/mục đã có khung + tiêu đề (cùng lý do popup giám sát B2B).
  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {FOCUS_GROUP_ORDER.map((group) => <FocusMetric key={group} group={group} value={counts[group]} />)}
      </div>
      {events.length > 0 ? (
        <ul className="divide-y divide-satin overflow-hidden rounded-xl border border-satin">
          {events.map((event) => <FocusEventRow key={`${event.signalType}-${event.firstAt}`} event={event} />)}
        </ul>
      ) : null}
      <p className="leading-relaxed text-muted-foreground">{message}</p>
    </section>
  );
}
