import { AlertCircle, CheckCircle2, Loader2, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { AudioRecorderState } from '../../types/audioRecorder.types';
import {
  formatAudioClock,
  formatAudioFileSize,
} from '../../utils/audioRecorder.utils';

interface Props {
  state: AudioRecorderState;
  disabled?: boolean;
  onStart: () => void;
  onRetake: () => void;
  onSubmit: () => void;
  onRetrySubmit: () => void;
  onContinueSuccess: () => void;
  onCloseError: () => void;
}

export function AudioRecorderResultStates({
  state,
  disabled,
  onStart,
  onRetake,
  onSubmit,
  onRetrySubmit,
  onContinueSuccess,
  onCloseError,
}: Props) {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [state.previewUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const onEnded = () => setPlaying(false);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [state.previewUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !state.previewUrl) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    await audio.play();
    setPlaying(true);
  };

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
            {state.errorKind === 'submit-failed'
              ? t('practice.audioRecorder.submitFailed')
              : state.errorKind === 'permission-denied'
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
          {state.errorKind === 'submit-failed' && state.audioFile ? (
            <button type="button" className="btn-primary" onClick={onRetrySubmit} disabled={disabled}>
              {t('practice.audioRecorder.retry')}
            </button>
          ) : null}
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

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          {t('practice.audioRecorder.preview')}
        </h3>
        <p className="text-sm text-muted-foreground">{t('practice.audioRecorder.previewReady')}</p>
        {state.maxDurationReached ? (
          <p className="text-sm text-warning" role="status">
            {t('practice.audioRecorder.maxDurationReached')}
          </p>
        ) : null}
      </div>
      {state.previewUrl ? (
        <audio ref={audioRef} src={state.previewUrl} preload="metadata" className="hidden" />
      ) : null}
      <div className="frame-satin rounded-xl bg-surface-overlay px-4 py-4">
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
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2"
            onClick={() => void togglePlay()}
            disabled={disabled || !state.previewUrl}
            aria-label={playing ? t('practice.audioRecorder.pause') : t('practice.audioRecorder.play')}
          >
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {playing ? t('practice.audioRecorder.pause') : t('practice.audioRecorder.play')}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={onRetake} disabled={disabled}>
          <RotateCcw className="size-4" aria-hidden />
          {t('practice.audioRecorder.retake')}
        </button>
        <button type="button" className="btn-primary" onClick={onSubmit} disabled={disabled || !state.audioFile}>
          {t('practice.audioRecorder.submit')}
        </button>
      </div>
    </div>
  );
}
