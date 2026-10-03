import { AppWindow, CameraOff, ClipboardPaste, ScanFace } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { FocusEventSummary } from '../../types/b2cPracticeSession.types';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { formatResultTime } from '../../utils/practiceSessionResultFormat';
import { buildFocusSummaryMessage, countFocusGroups } from '../../utils/focusTrackingSummary';

type MetricId = 'window' | 'paste' | 'face' | 'camera';

function FocusMetric({ id, icon: Icon, label, hint, value }: { id: MetricId; icon: typeof AppWindow; label: string; hint: string; value: number }) {
  return (
    <div className="rounded-xl border border-satin bg-surface-overlay p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Icon className="size-5 text-muted-foreground" aria-hidden />{label}</div>
      <p data-testid={`focus-metric-${id}`} className={`mt-4 text-3xl font-semibold tabular-nums ${value > 0 ? 'text-warning' : 'text-foreground'}`}>{String(value).padStart(2, '0')}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

const KNOWN_TYPES = new Set(['tab_switch', 'focus_lost', 'paste', 'no_face', 'multiple_faces', 'camera_blocked']);

function typeLabel(event: FocusEventSummary, t: (key: string) => string) {
  return KNOWN_TYPES.has(event.signalType)
    ? t(`practice.result.focusTracking.type.${event.signalType}`)
    : event.signalType;
}

const METRICS: ReadonlyArray<{ id: MetricId; icon: typeof AppWindow }> = [
  { id: 'window', icon: AppWindow },
  { id: 'face', icon: ScanFace },
  { id: 'camera', icon: CameraOff },
  { id: 'paste', icon: ClipboardPaste },
];

export function FocusEventsAnalysis({ view }: { view: PracticeSessionResultViewModel }) {
  const { t, language } = useLanguage();
  const events = view.focusEvents ?? [];
  const counts = countFocusGroups(events);
  const message = buildFocusSummaryMessage(view, t);

  // Không bọc frame: nội dung nằm TRONG Dialog/mục đã có khung + tiêu đề (cùng lý do ProctoringAnalysis `embedded`).
  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {METRICS.map(({ id, icon }) => (
          <FocusMetric
            key={id}
            id={id}
            icon={icon}
            value={counts[id]}
            label={t(`practice.result.focusTracking.group.${id}`)}
            hint={t(`practice.result.focusTracking.group.${id}Hint`)}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {events.map((event) => {
          const firstAt = formatResultTime(event.firstAt, language);
          const lastAt = formatResultTime(event.lastAt, language);
          return (
            <li key={`${event.signalType}-${event.count}-${event.firstAt}`} className="rounded-lg border border-warning/35 bg-warning/10 px-3 py-2 text-xs text-warning">
              <p className="font-medium">{typeLabel(event, t)}: {event.count}</p>
              <p className="mt-1 text-current/80">
                {t('practice.result.focusTracking.firstAt')} {firstAt ?? '—'} · {t('practice.result.focusTracking.lastAt')} {lastAt ?? '—'}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 leading-relaxed text-muted-foreground">{message}</p>
    </section>
  );
}
