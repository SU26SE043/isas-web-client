import { Loader2, Mic, Square } from 'lucide-react';
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
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {isRecording
            ? t('practice.audioRecorder.recording')
            : isRequesting
              ? t('practice.audioRecorder.requestingPermission')
              : t('practice.audioRecorder.startPrompt')}
        </h3>
        {!isRecording && !isRequesting ? (
          <p className="text-sm text-muted-foreground">
            {t('practice.audioRecorder.permissionHint')}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          'relative flex size-28 items-center justify-center rounded-full border border-satin bg-surface-overlay',
          isRecording && 'border-destructive/50',
        )}
      >
        {isRecording ? (
          <span
            className="absolute inset-0 animate-ping rounded-full bg-destructive/20 motion-reduce:animate-none"
            aria-hidden
          />
        ) : null}
        <Mic
          className={cn('relative size-10', isRecording ? 'text-destructive' : 'text-foreground')}
          aria-hidden
        />
      </div>

      <p className="text-2xl font-semibold tabular-nums text-foreground" aria-live="polite">
        {formatAudioClock(state.elapsedSeconds)} / {formatAudioClock(state.maxDurationSeconds)}
      </p>

      {isRecording ? (
        <button
          type="button"
          className="inline-flex size-16 items-center justify-center rounded-full border border-destructive/50 bg-destructive/15 text-destructive hover:bg-destructive/25"
          onClick={onStop}
          disabled={disabled}
          aria-label={t('practice.audioRecorder.stop')}
        >
          <Square className="size-6 fill-current" aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex size-16 items-center justify-center rounded-full bg-primary-main text-primary-foreground hover:bg-primary-light disabled:opacity-50"
          onClick={onStart}
          disabled={disabled || isRequesting}
          aria-label={t('practice.audioRecorder.start')}
        >
          {isRequesting ? (
            <Loader2 className="size-6 animate-spin" aria-hidden />
          ) : (
            <span className="size-5 rounded-full bg-destructive" aria-hidden />
          )}
        </button>
      )}
      <p className="text-xs text-muted-foreground">
        {isRecording ? t('practice.audioRecorder.stop') : t('practice.audioRecorder.start')}
      </p>
    </div>
  );
}
