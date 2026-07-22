import { Headphones, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { RecordingStatus } from '../types/b2cPracticeSession.types';

interface PracticeAnswerPreviewProps {
  durationSec: number;
  recordingStatus: RecordingStatus;
  isPlaying: boolean;
  onPlay: () => void;
  disabled?: boolean;
}

export function PracticeAnswerPreview({
  durationSec,
  recordingStatus,
  isPlaying,
  onPlay,
  disabled,
}: PracticeAnswerPreviewProps) {
  const { t } = useLanguage();
  const isUploading = recordingStatus === 'uploading';

  return (
    <div
      className="frame-satin flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-raised px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{t('practice.recording.recorded')}</p>
        <p className="text-xs text-muted-foreground">
          {t('practice.recording.previewDuration').replace('{seconds}', String(durationSec))}
        </p>
      </div>
      <button
        type="button"
        className="btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
        disabled={disabled || isUploading || isPlaying}
        onClick={onPlay}
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Headphones className="size-4" aria-hidden />
        )}
        {isUploading
          ? t('practice.recording.submitting')
          : isPlaying
            ? t('practice.recording.previewPlaying')
            : t('practice.recording.previewPlay')}
      </button>
    </div>
  );
}
