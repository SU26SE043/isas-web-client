import { useCallback, useEffect, useRef } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import type { AudioRecorderStatus } from '../types/audioRecorder.types';

interface UseAudioRecorderControllerOptions {
  sessionId: string;
  questionId: string;
  maxDurationSeconds: number;
  sharedStream?: MediaStream | null;
  paused?: boolean;
  autoSubmitRequestId?: number;
  resetRequestId?: number;
  onSubmitRecording: (file: File, durationSec: number) => Promise<void>;
  onAutoSubmitRecording?: (file: File, durationSec: number) => Promise<void>;
  onAutoSubmitEmpty?: () => Promise<void>;
  mapSubmitErrorKey?: (error: unknown) => string;
  onStatusChange?: (status: AudioRecorderStatus) => void;
}

export function useAudioRecorderController({
  sessionId,
  questionId,
  maxDurationSeconds,
  sharedStream = null,
  paused = false,
  autoSubmitRequestId = 0,
  resetRequestId = 0,
  onSubmitRecording,
  onAutoSubmitRecording,
  onAutoSubmitEmpty,
  mapSubmitErrorKey,
  onStatusChange,
}: UseAudioRecorderControllerOptions) {
  const recorder = useAudioRecorder({
    sessionId,
    questionId,
    maxDurationSeconds,
    sharedStream,
    paused,
  });
  const submittingLockRef = useRef(false);
  const autoSubmitRequestRef = useRef(0);
  const resetRequestRef = useRef(0);

  useEffect(() => {
    onStatusChange?.(recorder.state.status);
  }, [onStatusChange, recorder.state.status]);

  useEffect(() => {
    if (resetRequestId <= 0 || resetRequestRef.current === resetRequestId) return;
    resetRequestRef.current = resetRequestId;
    recorder.resetRecording();
  }, [recorder, resetRequestId]);

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
      recorder.resetRecording();
    } catch (error) {
      const key = mapSubmitErrorKey?.(error) ?? 'practice.audioRecorder.submitFailedHint';
      recorder.markSubmitError(key);
    } finally {
      submittingLockRef.current = false;
    }
  }, [mapSubmitErrorKey, onAutoSubmitRecording, onSubmitRecording, recorder]);

  useEffect(() => {
    if (autoSubmitRequestId <= 0 || autoSubmitRequestRef.current === autoSubmitRequestId) return;

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

    if (status === 'requesting-permission') recorder.resetRecording();
    void onAutoSubmitEmpty?.();
  }, [autoSubmitRequestId, onAutoSubmitEmpty, recorder, submitOnce]);

  return {
    ...recorder,
    submitOnce,
  };
}
