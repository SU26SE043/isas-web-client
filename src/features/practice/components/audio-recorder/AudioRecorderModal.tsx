import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/shared/languages';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import type { AudioRecorderStatus } from '../../types/audioRecorder.types';
import { AudioRecorderBody } from './AudioRecorderBody';

interface AudioRecorderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  questionId: string;
  questionContent: string;
  questionLabel: string;
  maxDurationSeconds: number;
  sharedStream?: MediaStream | null;
  disabled?: boolean;
  paused?: boolean;
  onSubmitRecording: (file: File, durationSec: number) => Promise<void>;
  onAutoSubmitRecording?: (file: File, durationSec: number) => Promise<void>;
  autoSubmitRequestId?: number;
  onAutoSubmitEmpty?: () => Promise<void>;
  mapSubmitErrorKey?: (error: unknown) => string;
  onStatusChange?: (status: AudioRecorderStatus) => void;
}

export function AudioRecorderModal({
  open,
  onOpenChange,
  sessionId,
  questionId,
  questionContent,
  questionLabel,
  maxDurationSeconds,
  sharedStream = null,
  disabled,
  paused = false,
  onSubmitRecording,
  onAutoSubmitRecording,
  autoSubmitRequestId = 0,
  onAutoSubmitEmpty,
  mapSubmitErrorKey,
  onStatusChange,
}: AudioRecorderModalProps) {
  const { t } = useLanguage();
  const recorder = useAudioRecorder({
    sessionId,
    questionId,
    maxDurationSeconds,
    sharedStream,
    paused,
  });
  const [confirmClose, setConfirmClose] = useState(false);
  const submittingLockRef = useRef(false);
  const autoSubmitRequestRef = useRef(0);
  const openRecorderRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onStatusChange?.(recorder.state.status);
  }, [onStatusChange, recorder.state.status]);

  useEffect(() => {
    if (open) {
      openRecorderRef.current = document.activeElement as HTMLElement | null;
      setConfirmClose(false);
    }
  }, [open]);

  const forceClose = useCallback(() => {
    setConfirmClose(false);
    recorder.resetRecording();
    onOpenChange(false);
    queueMicrotask(() => openRecorderRef.current?.focus());
  }, [onOpenChange, recorder]);

  const requestClose = useCallback(() => {
    if (recorder.state.status === 'submitting') return;
    if (recorder.state.status === 'recording' || recorder.state.status === 'requesting-permission') {
      setConfirmClose(true);
      return;
    }
    forceClose();
  }, [forceClose, recorder.state.status]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      requestClose();
      return;
    }
    onOpenChange(true);
  };

  const submitOnce = useCallback(async (automatic = false) => {
    if (submittingLockRef.current) return;
    const file = recorder.state.audioFile;
    const durationSec = recorder.state.elapsedSeconds;
    if (!file || durationSec <= 0) return;
    submittingLockRef.current = true;
    recorder.markSubmitting();
    try {
      await (automatic && onAutoSubmitRecording
        ? onAutoSubmitRecording(file, durationSec)
        : onSubmitRecording(file, durationSec));
      recorder.markSuccess();
      // The next question is already active in the store by the time this
      // resolves — close immediately instead of waiting on an extra manual
      // "Continue" click (previously only the automatic/timeout path did this).
      forceClose();
    } catch (error) {
      const key =
        mapSubmitErrorKey?.(error) ?? 'practice.audioRecorder.submitFailedHint';
      recorder.markSubmitError(key);
    } finally {
      submittingLockRef.current = false;
    }
  }, [forceClose, mapSubmitErrorKey, onAutoSubmitRecording, onSubmitRecording, recorder]);

  useEffect(() => {
    if (!open || autoSubmitRequestId <= 0 || autoSubmitRequestRef.current === autoSubmitRequestId) {
      return;
    }

    const status = recorder.state.status;
    if (status === 'recording') {
      recorder.stopRecording();
      return;
    }

    autoSubmitRequestRef.current = autoSubmitRequestId;
    if (status === 'recorded') {
      void submitOnce(true);
      return;
    }

    if (status === 'requesting-permission') {
      recorder.resetRecording();
    }
    void onAutoSubmitEmpty?.();
  }, [
    autoSubmitRequestId,
    onAutoSubmitEmpty,
    open,
    recorder,
    submitOnce,
  ]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={recorder.state.status !== 'submitting'}
        className="max-w-[calc(100%-1rem)] gap-2 border-info/20 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_100%_100%,rgba(124,58,237,0.12),transparent_36%)] p-4 sm:max-w-[920px] sm:p-5"
        closeButtonClassName="border-info/20 bg-surface-overlay text-foreground hover:bg-info/20 hover:text-foreground"
      >
        <DialogHeader className="mx-0 mt-0 rounded-2xl border border-info/20 bg-surface-base/70 px-5 py-5 pr-14 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-6 sm:py-6 sm:pr-16">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-info-light">
            <CircleHelp className="size-4" aria-hidden />
            {t('practice.audioRecorder.questionLabel')}
          </p>
          <DialogTitle className="text-2xl sm:text-3xl">{questionLabel}</DialogTitle>
          <DialogDescription className="line-clamp-5 text-left text-sm leading-relaxed text-foreground/90 sm:text-base">
            {questionContent}
          </DialogDescription>
        </DialogHeader>

        {confirmClose ? (
          <div className="space-y-4 py-6 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              {t('practice.audioRecorder.closeConfirmTitle')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('practice.audioRecorder.closeConfirmDescription')}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" className="btn-secondary" onClick={() => setConfirmClose(false)}>
                {t('practice.audioRecorder.keepRecording')}
              </button>
              <button type="button" className="btn-primary" onClick={forceClose}>
                {t('practice.audioRecorder.closeConfirm')}
              </button>
            </div>
          </div>
        ) : (
          <AudioRecorderBody
            state={recorder.state}
            audioElementRef={recorder.audioElementRef}
            disabled={disabled || recorder.state.status === 'submitting'}
            onStart={() => void recorder.startRecording()}
            onStop={recorder.stopRecording}
            onRetake={recorder.resetRecording}
            onReplay={() => void recorder.replayAudio()}
            onSubmit={() => void submitOnce()}
            onRetrySubmit={() => void submitOnce()}
            onContinueSuccess={forceClose}
            onCloseError={forceClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
