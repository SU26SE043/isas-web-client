import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AudioRecorderErrorKind,
  AudioRecorderState,
  AudioRecorderStatus,
} from '../types/audioRecorder.types';
import {
  AUDIO_RECORDER_MIN_DURATION_SEC,
  classifyGetUserMediaError,
  createAnswerAudioFile,
  isAudioFileTooLarge,
  pickAudioRecorderMimeType,
} from '../utils/audioRecorder.utils';

const INITIAL_STATE: AudioRecorderState = {
  status: 'idle',
  elapsedSeconds: 0,
  maxDurationSeconds: 120,
  audioBlob: null,
  audioFile: null,
  previewUrl: null,
  errorMessage: null,
  errorKind: null,
  maxDurationReached: false,
  uploadProgress: null,
};

interface UseAudioRecorderOptions {
  sessionId: string;
  questionId: string;
  maxDurationSeconds: number;
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useAudioRecorder({
  sessionId,
  questionId,
  maxDurationSeconds,
}: UseAudioRecorderOptions) {
  const [state, setState] = useState<AudioRecorderState>({
    ...INITIAL_STATE,
    maxDurationSeconds: Math.max(1, maxDurationSeconds),
  });
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef(pickAudioRecorderMimeType());
  const previewUrlRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const maxDurationRef = useRef(Math.max(1, maxDurationSeconds));
  const autoStoppedRef = useRef(false);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setStatus = useCallback((status: AudioRecorderStatus) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const setError = useCallback((kind: AudioRecorderErrorKind, messageKey: string) => {
    setState((prev) => ({
      ...prev,
      status: 'error',
      errorKind: kind,
      errorMessage: messageKey,
    }));
  }, []);

  const cleanupStream = useCallback(() => {
    stopTracks(streamRef.current);
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const resetRecording = useCallback(() => {
    clearTimer();
    revokePreview();
    chunksRef.current = [];
    autoStoppedRef.current = false;
    cleanupStream();
    setState({
      ...INITIAL_STATE,
      maxDurationSeconds: maxDurationRef.current,
    });
  }, [cleanupStream, clearTimer, revokePreview]);

  useEffect(() => {
    maxDurationRef.current = Math.max(1, maxDurationSeconds);
    setState((prev) => ({ ...prev, maxDurationSeconds: maxDurationRef.current }));
  }, [maxDurationSeconds]);

  const statusRef = useRef(state.status);
  statusRef.current = state.status;

  useEffect(() => {
    if (statusRef.current === 'submitting' || statusRef.current === 'success') return;
    resetRecording();
    // Reset when question changes, except during in-flight submit/success UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  useEffect(
    () => () => {
      clearTimer();
      revokePreview();
      cleanupStream();
    },
    [cleanupStream, clearTimer, revokePreview],
  );

  const finalizeRecording = useCallback(
    (blob: Blob, elapsed: number, maxReached: boolean) => {
      clearTimer();
      cleanupStream();
      if (blob.size <= 0 || elapsed < AUDIO_RECORDER_MIN_DURATION_SEC) {
        revokePreview();
        setError('empty-recording', 'practice.audioRecorder.emptyRecording');
        return;
      }
      if (isAudioFileTooLarge(blob)) {
        revokePreview();
        setError('too-large', 'practice.errors.audioTooLarge');
        return;
      }
      const file = createAnswerAudioFile(blob, sessionId, questionId, mimeRef.current);
      revokePreview();
      const previewUrl = URL.createObjectURL(blob);
      previewUrlRef.current = previewUrl;
      setState({
        status: 'recorded',
        elapsedSeconds: elapsed,
        maxDurationSeconds: maxDurationRef.current,
        audioBlob: blob,
        audioFile: file,
        previewUrl,
        errorMessage: null,
        errorKind: null,
        maxDurationReached: maxReached,
        uploadProgress: null,
      });
    },
    [cleanupStream, clearTimer, questionId, revokePreview, sessionId, setError],
  );

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (state.status === 'recording' || state.status === 'submitting') return;
    revokePreview();
    chunksRef.current = [];
    autoStoppedRef.current = false;
    setState((prev) => ({
      ...prev,
      status: 'requesting-permission',
      audioBlob: null,
      audioFile: null,
      previewUrl: null,
      errorMessage: null,
      errorKind: null,
      elapsedSeconds: 0,
      maxDurationReached: false,
      uploadProgress: null,
    }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickAudioRecorderMimeType();
      mimeRef.current = mimeType;
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        clearTimer();
        cleanupStream();
        setError('unknown', 'practice.audioRecorder.unknownError');
      };

      recorder.onstop = () => {
        const elapsed = Math.max(
          0,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );
        const blob = new Blob(chunksRef.current, { type: mimeRef.current });
        finalizeRecording(blob, elapsed, autoStoppedRef.current);
      };

      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          if (recorderRef.current?.state === 'recording') {
            autoStoppedRef.current = false;
            setState((prev) => ({
              ...prev,
              errorKind: 'mic-disconnected',
              errorMessage: 'practice.audioRecorder.micDisconnected',
            }));
            recorder.stop();
          }
        };
      });

      recorder.start(250);
      setStatus('recording');
      clearTimer();
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setState((prev) => ({ ...prev, elapsedSeconds: elapsed }));
        if (elapsed >= maxDurationRef.current) {
          autoStoppedRef.current = true;
          clearTimer();
          if (recorderRef.current?.state === 'recording') {
            recorderRef.current.stop();
          }
        }
      }, 250);
    } catch (error) {
      cleanupStream();
      const kind = classifyGetUserMediaError(error);
      if (kind === 'permission-denied') {
        setError('permission-denied', 'practice.audioRecorder.permissionDenied');
      } else if (kind === 'device-not-found') {
        setError('device-not-found', 'practice.audioRecorder.deviceNotFound');
      } else {
        setError('unknown', 'practice.audioRecorder.unknownError');
      }
    }
  }, [
    cleanupStream,
    clearTimer,
    finalizeRecording,
    revokePreview,
    setError,
    setStatus,
    state.status,
  ]);

  const markSubmitting = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'submitting',
      errorMessage: null,
      errorKind: null,
      uploadProgress: null,
    }));
  }, []);

  const markSuccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'success',
      uploadProgress: null,
    }));
  }, []);

  const markSubmitError = useCallback((messageKey: string) => {
    setState((prev) => ({
      ...prev,
      status: 'error',
      errorKind: 'submit-failed',
      errorMessage: messageKey,
      uploadProgress: null,
    }));
  }, []);

  const restoreRecorded = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: prev.audioFile ? 'recorded' : 'idle',
      errorKind: null,
      errorMessage: null,
      uploadProgress: null,
    }));
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    resetRecording,
    markSubmitting,
    markSuccess,
    markSubmitError,
    restoreRecorded,
  };
}
