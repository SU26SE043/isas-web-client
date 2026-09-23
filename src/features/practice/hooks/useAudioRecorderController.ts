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
  onAutoSubmitEmpty?: () => Promise<boolean | void>;
  onAutoSubmitEmptyResult?: (result: { submitted: boolean; error?: unknown }) => void;
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
  onAutoSubmitEmptyResult,
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
  const lastSubmitAutomaticRef = useRef(false);
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
    lastSubmitAutomaticRef.current = automatic;
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

  const retrySubmit = useCallback(
    () => submitOnce(lastSubmitAutomaticRef.current),
    [submitOnce],
  );

  useEffect(() => {
    if (autoSubmitRequestId <= 0 || autoSubmitRequestRef.current === autoSubmitRequestId) return;

    const status = recorder.state.status;
    if (submittingLockRef.current || status === 'submitting') return;
    if (status === 'recording') {
      recorder.stopRecording();
      return;
    }

    autoSubmitRequestRef.current = autoSubmitRequestId;
    if (status === 'requesting-permission') {
      // resetRecording invalidates the pending permission request in the recorder
      // hook, so a late getUserMedia resolution cannot start recording on the next question.
      recorder.resetRecording();
      onAutoSubmitEmptyResult?.({ submitted: false });
      return;
    }

    const run = async () => {
      if (recorder.state.audioFile) {
        await submitOnce(true);
        return;
      }
      if (!onAutoSubmitEmpty) return;
      try {
        const result = await onAutoSubmitEmpty();
        onAutoSubmitEmptyResult?.({ submitted: result !== false });
      } catch (error) {
        onAutoSubmitEmptyResult?.({ submitted: false, error });
      }
    };
    run().catch((error) => {
      onAutoSubmitEmptyResult?.({ submitted: false, error });
    });
  }, [autoSubmitRequestId, onAutoSubmitEmpty, onAutoSubmitEmptyResult, recorder, submitOnce]);

  return {
    ...recorder,
    submitOnce,
    retrySubmit,
  };
}
