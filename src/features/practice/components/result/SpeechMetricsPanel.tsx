import {
  AudioLines,
  Clock3,
  Ellipsis,
  Gauge,
  Hash,
  Info,
  MessageSquareMore,
  MicVocal,
  TimerReset,
  VolumeX,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeSpeakingMetrics } from '../../types/b2cPracticeSession.types';

type MetricRow = {
  label: string;
  value: string;
  note?: string | null;
  icon: LucideIcon;
  tone: string;
};

function Metric({ label, value, note, icon: Icon, tone }: MetricRow) {
  return (
    <div className="frame-satin-soft min-w-0 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <span className={`inline-flex size-7 items-center justify-center rounded-lg bg-white/5 ${tone}`}>
          <Icon className="size-4" aria-hidden />
        </span>
        <p className="text-xs leading-snug text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">{value}</p>
      {note ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function formatOptionalNumber(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function SpeechMetricsPanel({ metrics }: { metrics: PracticeSpeakingMetrics }) {
  const { t } = useLanguage();
  const notes = (metrics.notes ?? []).filter(Boolean);
  const fillerBreakdown = Object.entries(metrics.fillerBreakdown ?? {}).filter(
    ([, count]) => count != null && Number.isFinite(count),
  );
  const rows: MetricRow[] = [];

  const audioDuration = formatOptionalNumber(metrics.audioDurationSec);
  if (audioDuration != null) {
    rows.push({
      label: t('practice.result.audioDuration'),
      value: t('practice.result.secondsValue').replace('{{n}}', audioDuration),
      icon: Clock3,
      tone: 'text-info-light',
    });
  }

  const speechSec = formatOptionalNumber(metrics.speechSec);
  if (speechSec != null) {
    rows.push({
      label: t('practice.result.speechDuration'),
      value: t('practice.result.secondsValue').replace('{{n}}', speechSec),
      icon: MicVocal,
      tone: 'text-[var(--chart-cat-5)]',
    });
  }

  const wordCount = formatOptionalNumber(metrics.wordCount);
  if (wordCount != null) {
    rows.push({
      label: t('practice.result.wordCount'),
      value: wordCount,
      icon: Hash,
      tone: 'text-[var(--chart-cat-6)]',
    });
  }

  const speechRate = formatOptionalNumber(metrics.speechRate);
  if (speechRate != null) {
    rows.push({
      label: t('practice.result.speechRate'),
      value: t('practice.result.speechRateValue').replace('{{n}}', speechRate),
      note: metrics.speechRateNote,
      icon: Gauge,
      tone: 'text-warning-light',
    });
  }

  const longestPause = formatOptionalNumber(metrics.longestPauseSec);
  if (longestPause != null) {
    rows.push({
      label: t('practice.result.longestPause'),
      value: t('practice.result.secondsValue').replace('{{n}}', longestPause),
      note: metrics.longestPauseNote,
      icon: TimerReset,
      tone: 'text-[var(--chart-cat-4)]',
    });
  }

  const pauseCount = formatOptionalNumber(metrics.hesitationCount);
  if (pauseCount != null) {
    rows.push({
      label: t('practice.result.hesitations'),
      value: t('practice.result.timesValue').replace('{{n}}', pauseCount),
      note: metrics.hesitationNote,
      icon: MessageSquareMore,
      tone: 'text-[var(--chart-cat-6)]',
    });
  }

  const silenceRatio = formatOptionalNumber(metrics.silenceRatio);
  if (silenceRatio != null) {
    rows.push({
      label: t('practice.result.silenceRatio'),
      value: `${silenceRatio}%`,
      note: metrics.silenceRatioNote,
      icon: VolumeX,
      tone: 'text-[var(--chart-cat-4)]',
    });
  }

  const fillerCount = formatOptionalNumber(metrics.fillerWordCount);
  if (fillerCount != null) {
    rows.push({
      label: t('practice.result.fillerWords'),
      value: t('practice.result.fillerValue').replace('{{n}}', fillerCount),
      note: metrics.fillerWordNote,
      icon: Ellipsis,
      tone: 'text-[var(--chart-cat-6)]',
    });
  }

  const fillerPer100 = formatOptionalNumber(metrics.fillerPer100Words);
  if (fillerPer100 != null) {
    rows.push({
      label: t('practice.result.fillerPer100Words'),
      value: fillerPer100,
      icon: AudioLines,
      tone: 'text-[var(--chart-cat-5)]',
    });
  }

  return (
    <section className="rounded-xl border border-satin bg-surface-overlay p-3 sm:p-4">
      <h4 className="flex items-center gap-2 font-semibold text-foreground">
        <AudioLines className="size-4 text-[var(--chart-cat-6)]" aria-hidden />
        {t('practice.result.speakingMetrics')}
      </h4>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t('practice.result.metricsEmpty')}</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {rows.map((row) => (
            <Metric key={row.label} {...row} />
          ))}
        </div>
      )}

      {fillerBreakdown.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-satin/70 pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            {t('practice.result.fillerBreakdown')}
          </p>
          <ul className="flex flex-wrap gap-2">
            {fillerBreakdown.map(([word, count]) => (
              <li
                key={word}
                className="rounded-full border border-satin bg-surface-raised px-2.5 py-1 text-xs text-foreground"
              >
                {word}: {count}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {(metrics.referenceText || notes.length > 0) && (
        <div className="mt-4 space-y-2 border-t border-satin/70 pt-3">
          {metrics.referenceText ? (
            <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>{metrics.referenceText}</span>
            </p>
          ) : null}
          {notes.map((note) => (
            <p key={note} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>{note}</span>
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
