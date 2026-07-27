import { AudioLines, Info } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeSpeakingMetrics } from '../../types/b2cPracticeSession.types';

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string | null;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular-nums text-foreground">{value}</p>
      {note ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function SpeechMetricsPanel({ metrics }: { metrics: PracticeSpeakingMetrics }) {
  const { t } = useLanguage();
  const notes = (metrics.notes ?? []).filter(Boolean);

  return (
    <section className="rounded-xl border border-satin bg-surface-overlay p-4">
      <h4 className="flex items-center gap-2 font-semibold text-foreground">
        <AudioLines className="size-4 text-info" aria-hidden />
        {t('practice.result.speakingMetrics')}
      </h4>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.speechRate != null ? (
          <Metric
            label={t('practice.result.speechRate')}
            value={t('practice.result.speechRateValue').replace(
              '{{n}}',
              String(metrics.speechRate),
            )}
            note={metrics.speechRateNote}
          />
        ) : null}
        {metrics.longestPauseSec != null ? (
          <Metric
            label={t('practice.result.longestPause')}
            value={t('practice.result.secondsValue').replace(
              '{{n}}',
              String(metrics.longestPauseSec),
            )}
            note={metrics.longestPauseNote}
          />
        ) : null}
        {metrics.hesitationCount != null ? (
          <Metric
            label={t('practice.result.hesitations')}
            value={t('practice.result.timesValue').replace(
              '{{n}}',
              String(metrics.hesitationCount),
            )}
            note={metrics.hesitationNote}
          />
        ) : null}
        {metrics.silenceRatio != null ? (
          <Metric
            label={t('practice.result.silenceRatio')}
            value={`${metrics.silenceRatio}%`}
            note={metrics.silenceRatioNote}
          />
        ) : null}
        {metrics.fillerWordCount != null ? (
          <Metric
            label={t('practice.result.fillerWords')}
            value={t('practice.result.fillerValue').replace(
              '{{n}}',
              String(metrics.fillerWordCount),
            )}
            note={metrics.fillerWordNote}
          />
        ) : null}
        {metrics.audioDurationSec != null ? (
          <Metric
            label={t('practice.result.audioDuration')}
            value={t('practice.result.secondsValue').replace(
              '{{n}}',
              String(metrics.audioDurationSec),
            )}
          />
        ) : null}
        {metrics.wordCount != null ? (
          <Metric label={t('practice.result.wordCount')} value={String(metrics.wordCount)} />
        ) : null}
      </div>

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
