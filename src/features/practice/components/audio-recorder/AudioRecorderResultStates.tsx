import { AlertCircle, CheckCircle2, Loader2, RotateCcw, RotateCw } from 'lucide-react';
import type { RefObject } from 'react';
import { useLanguage } from '@/shared/languages';
import type { AudioRecorderState } from '../../types/audioRecorder.types';
import {
  formatAudioClock,
  formatAudioFileSize,
} from '../../utils/audioRecorder.utils';

interface Props {
  state: AudioRecorderState;
  audioElementRef: RefObject<HTMLAudioElement | null>;
  disabled?: boolean;
  onStart: () => void;
  onRetake: () => void;
  onReplay: () => void;
  onSubmit: () => void;
  onRetrySubmit: () => void;
  onContinueSuccess: () => void;
  onCloseError: () => void;
}

export function AudioRecorderResultStates({
  state,
  audioElementRef,
  disabled,
  onStart,
  onRetake,
  onReplay,
  onSubmit,
  onRetrySubmit,
  onContinueSuccess,
  onCloseError,
}: Props) {
  const { t } = useLanguage();

  if (state.status === 'submitting') {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center" role="status" aria-live="polite">
        <Loader2 className="size-10 animate-spin text-foreground" aria-hidden />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {t('practice.audioRecorder.submitting')}
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {t('practice.audioRecorder.submittingHint')}
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2 className="size-12 text-success" aria-hidden />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {t('practice.audioRecorder.success')}
          </h3>
          <p className="text-sm text-muted-foreground">{t('practice.audioRecorder.successHint')}</p>
        </div>
        <button type="button" className="btn-primary" onClick={onContinueSuccess}>
          {t('practice.audioRecorder.continue')}
        </button>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <AlertCircle className="size-12 text-destructive" aria-hidden />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {state.errorKind === 'permission-denied'
              ? t('practice.audioRecorder.permissionDeniedTitle')
              : state.errorKind === 'device-not-found'
                ? t('practice.audioRecorder.deviceNotFoundTitle')
                : t('practice.audioRecorder.errorTitle')}
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {state.errorMessage ? t(state.errorMessage) : t('practice.audioRecorder.unknownError')}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {state.errorKind === 'permission-denied' || state.errorKind === 'device-not-found' ? (
            <button type="button" className="btn-primary" onClick={onStart} disabled={disabled}>
              {t('practice.audioRecorder.retry')}
            </button>
          ) : (
            <button type="button" className="btn-secondary" onClick={onRetake} disabled={disabled}>
              {t('practice.audioRecorder.retake')}
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={onCloseError}>
            {t('practice.audioRecorder.close')}
          </button>
        </div>
      </div>
    );
  }

  if (state.status !== 'recorded') return null;

  const submitFailed = state.errorKind === 'submit-failed' && state.errorMessage;

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          {t('practice.audioRecorder.previewTitle')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('practice.audioRecorder.previewDescription')}
        </p>
        {state.maxDurationReached ? (
          <p className="text-sm text-warning" role="status">
            {t('practice.audioRecorder.maxDurationReached')}
          </p>
        ) : null}
      </div>

      {submitFailed && state.errorMessage ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(state.errorMessage)}
        </div>
      ) : null}

      {state.playbackError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(state.playbackError)}
        </div>
      ) : null}

      <div className="frame-satin space-y-4 rounded-xl bg-surface-overlay px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatAudioClock(state.elapsedSeconds)}
            </p>
            {state.audioFile ? (
              <p className="text-xs text-muted-foreground">
                {formatAudioFileSize(state.audioFile.size)}
              </p>
            ) : null}
          </div>
          {state.isPlaying ? (
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {t('practice.audioRecorder.playing')}
            </p>
          ) : null}
        </div>

        {state.previewUrl ? (
          <audio
            ref={audioElementRef}
            src={state.previewUrl}
            controls
            preload="metadata"
            className="w-full"
            aria-label={t('practice.audioRecorder.previewPlayer')}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className="btn-secondary inline-flex items-center gap-2"
          onClick={() => void onReplay()}
          disabled={disabled || !state.previewUrl}
          aria-label={t('practice.audioRecorder.replay')}
        >
          <RotateCw className="size-4" aria-hidden />
          {state.isPlaying ? t('practice.audioRecorder.playing') : t('practice.audioRecorder.replay')}
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex items-center gap-2"
          onClick={onRetake}
          disabled={disabled}
        >
          <RotateCcw className="size-4" aria-hidden />
          {t('practice.audioRecorder.retake')}
        </button>
        {submitFailed ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onRetrySubmit}
            disabled={disabled || !state.audioFile}
          >
            {t('practice.audioRecorder.retrySubmit')}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmit}
            disabled={disabled || !state.audioFile}
          >
            {t('practice.audioRecorder.submit')}
          </button>
        )}
      </div>
    </div>
  );
}
