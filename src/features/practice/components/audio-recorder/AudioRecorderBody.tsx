import { AudioWaveform, Loader2, Mic, Square } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { AudioRecorderState } from '../../types/audioRecorder.types';
import { formatAudioClock } from '../../utils/audioRecorder.utils';
import { AudioRecorderResultStates } from './AudioRecorderResultStates';

interface AudioRecorderBodyProps {
  state: AudioRecorderState;
  audioElementRef: React.RefObject<HTMLAudioElement | null>;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
  onRetake: () => void;
  onReplay: () => void;
  onSubmit: () => void;
  onRetrySubmit: () => void;
  onContinueSuccess: () => void;
  onCloseError: () => void;
}

export function AudioRecorderBody({
  state,
  audioElementRef,
  disabled,
  onStart,
  onStop,
  onRetake,
  onReplay,
  onSubmit,
  onRetrySubmit,
  onContinueSuccess,
  onCloseError,
}: AudioRecorderBodyProps) {
  const { t } = useLanguage();

  if (
    state.status === 'submitting' ||
    state.status === 'success' ||
    state.status === 'error' ||
    state.status === 'recorded'
  ) {
    return (
      <AudioRecorderResultStates
        state={state}
        audioElementRef={audioElementRef}
        disabled={disabled}
        onStart={onStart}
        onRetake={onRetake}
        onReplay={onReplay}
        onSubmit={onSubmit}
        onRetrySubmit={onRetrySubmit}
        onContinueSuccess={onContinueSuccess}
        onCloseError={onCloseError}
      />
    );
  }

  const isRecording = state.status === 'recording';
  const isRequesting = state.status === 'requesting-permission';

  return (
    <div className="frame-satin flex min-h-[390px] flex-col items-center gap-5 rounded-2xl border border-info/20 bg-surface-base/70 px-4 py-7 text-center sm:min-h-[415px] sm:gap-6 sm:py-8">
      <div className="space-y-2">
        <h3 className="flex items-center justify-center gap-3 text-xl font-semibold text-info-light sm:text-2xl">
          <AudioWaveform className="size-5" aria-hidden />
          {isRecording
            ? t('practice.audioRecorder.recording')
            : isRequesting
              ? t('practice.audioRecorder.requestingPermission')
              : t('practice.audioRecorder.startPrompt')}
          <AudioWaveform className="size-5" aria-hidden />
        </h3>
        {!isRecording && !isRequesting ? (
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('practice.audioRecorder.permissionHint')}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          'relative flex size-32 items-center justify-center rounded-full border border-info/70 bg-gradient-to-br from-info/25 via-info-500/20 to-info-500/30 shadow-none sm:size-36',
          isRecording && 'border-destructive/70 shadow-none',
        )}
      >
        <span className="absolute -inset-3 rounded-full border border-info/20" aria-hidden />
        <span className="absolute -inset-6 rounded-full border border-info/10" aria-hidden />
        {isRecording ? (
          <span
            className="absolute inset-0 animate-ping rounded-full bg-destructive/20 motion-reduce:animate-none"
            aria-hidden
          />
        ) : null}
        <Mic
          className={cn('relative size-12', isRecording ? 'text-destructive' : 'text-info-light')}
          aria-hidden
        />
      </div>

      <p className="text-3xl font-semibold tabular-nums text-foreground sm:text-4xl" aria-live="polite">
        {formatAudioClock(state.elapsedSeconds)} / {formatAudioClock(state.maxDurationSeconds)}
      </p>

      <div className="flex w-full max-w-[560px] items-center gap-3" aria-hidden>
        <span className="size-1.5 rounded-full bg-info shadow-[0_0_12px_var(--color-info)]" />
        <span className="h-px flex-1 bg-gradient-to-r from-info/40 via-satin to-info-400/50" />
        <span className="size-1.5 rounded-full bg-info-400 shadow-[0_0_12px_var(--color-info-400)]" />
      </div>

      {isRecording ? (
        <button
          type="button"
          className="inline-flex size-[4.5rem] items-center justify-center rounded-full border border-destructive/60 bg-destructive/15 text-destructive shadow-[0_0_26px_-8px_var(--color-destructive)] hover:bg-destructive/25"
          onClick={onStop}
          disabled={disabled}
          aria-label={t('practice.audioRecorder.stop')}
        >
          <Square className="size-6 fill-current" aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex size-[4.5rem] items-center justify-center rounded-full border-4 border-surface-raised bg-foreground text-error shadow-[0_0_26px_-8px_var(--color-error)] hover:bg-foreground/90 disabled:opacity-50"
          onClick={onStart}
          disabled={disabled || isRequesting}
          aria-label={t('practice.audioRecorder.start')}
        >
          {isRequesting ? (
            <Loader2 className="size-6 animate-spin" aria-hidden />
          ) : (
            <span className="size-6 rounded-full bg-error" aria-hidden />
          )}
        </button>
      )}
      <p className="text-xs text-muted-foreground">
        {isRecording ? t('practice.audioRecorder.stop') : t('practice.audioRecorder.start')}
      </p>
    </div>
  );
}

