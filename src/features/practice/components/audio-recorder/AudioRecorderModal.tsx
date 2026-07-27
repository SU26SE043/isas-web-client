import { useCallback, useEffect, useRef, useState } from 'react';
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
  onSubmitRecording: (file: File, durationSec: number) => Promise<void>;
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
  onSubmitRecording,
  mapSubmitErrorKey,
  onStatusChange,
}: AudioRecorderModalProps) {
  const { t } = useLanguage();
  const recorder = useAudioRecorder({
    sessionId,
    questionId,
    maxDurationSeconds,
    sharedStream,
  });
  const [confirmClose, setConfirmClose] = useState(false);
  const submittingLockRef = useRef(false);
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

  const submitOnce = useCallback(async () => {
    if (submittingLockRef.current) return;
    const file = recorder.state.audioFile;
    const durationSec = recorder.state.elapsedSeconds;
    if (!file || durationSec <= 0) return;
    submittingLockRef.current = true;
    recorder.markSubmitting();
    try {
      await onSubmitRecording(file, durationSec);
      recorder.markSuccess();
    } catch (error) {
      const key =
        mapSubmitErrorKey?.(error) ?? 'practice.audioRecorder.submitFailedHint';
      recorder.markSubmitError(key);
    } finally {
      submittingLockRef.current = false;
    }
  }, [mapSubmitErrorKey, onSubmitRecording, recorder]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={recorder.state.status !== 'submitting'}
        className="max-w-[calc(100%-1.5rem)] gap-0 sm:max-w-[840px]"
      >
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('practice.audioRecorder.questionLabel')}
          </p>
          <DialogTitle>{questionLabel}</DialogTitle>
          <DialogDescription className="line-clamp-4 text-left text-foreground/90">
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
