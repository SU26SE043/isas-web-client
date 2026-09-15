import { AppWindow, ClipboardPaste } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { FocusEventSummary } from '../../types/b2cPracticeSession.types';
import type { PracticeSessionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { formatResultTime } from '../../utils/practiceSessionResultFormat';

function FocusMetric({ id, icon: Icon, label, hint, value }: { id: 'window' | 'paste'; icon: typeof AppWindow; label: string; hint: string; value: number }) {
  return (
    <div className="rounded-xl border border-satin bg-surface-overlay p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Icon className="size-5 text-muted-foreground" aria-hidden />{label}</div>
      <p data-testid={`focus-metric-${id}`} className={`mt-4 text-3xl font-semibold tabular-nums ${value > 0 ? 'text-warning' : 'text-foreground'}`}>{String(value).padStart(2, '0')}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function typeLabel(event: FocusEventSummary, t: (key: string) => string) {
  const known = new Set(['tab_switch', 'focus_lost', 'paste']);
  return known.has(event.signalType)
    ? t(`practice.result.focusTracking.type.${event.signalType}`)
    : event.signalType;
}

export function FocusEventsAnalysis({ view }: { view: PracticeSessionResultViewModel }) {
  const { t, language } = useLanguage();
  const events = view.focusEvents ?? [];
  const windowCount = events.filter((event) => event.signalType === 'tab_switch' || event.signalType === 'focus_lost').reduce((sum, event) => sum + event.count, 0);
  const pasteCount = events.filter((event) => event.signalType === 'paste').reduce((sum, event) => sum + event.count, 0);
  const count = view.focusLeaveCount ?? 0;
  const placement = view.focusLeavePlacement ? t(`practice.result.focusTracking.${view.focusLeavePlacement}`) : '';
  const message = count > 0
    ? t('practice.result.focusTracking.message').replace('{{n}}', String(count)).replace('{{placement}}', placement ? `, ${placement}` : '')
    : t('practice.result.focusTracking.empty');

  // Không bọc frame: nội dung nằm TRONG Dialog đã có khung + tiêu đề (cùng lý do ProctoringAnalysis `embedded`).
  return (
    <section>
      <div className="grid gap-3 sm:grid-cols-2">
        <FocusMetric id="window" icon={AppWindow} value={windowCount} label={t('practice.result.focusTracking.group.window')} hint={t('practice.result.focusTracking.group.windowHint')} />
        <FocusMetric id="paste" icon={ClipboardPaste} value={pasteCount} label={t('practice.result.focusTracking.group.paste')} hint={t('practice.result.focusTracking.group.pasteHint')} />
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
