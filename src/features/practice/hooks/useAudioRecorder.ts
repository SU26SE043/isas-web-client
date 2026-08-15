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
  playbackError: null,
  isPlaying: false,
  maxDurationReached: false,
  uploadProgress: null,
};

interface UseAudioRecorderOptions {
  sessionId: string;
  questionId: string;
  maxDurationSeconds: number;
  /** Prefer the live interview stream so answer recording does not steal cam/mic. */
  sharedStream?: MediaStream | null;
  paused?: boolean;
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useAudioRecorder({
  sessionId,
  questionId,
  maxDurationSeconds,
  sharedStream = null,
  paused = false,
}: UseAudioRecorderOptions) {
  const [state, setState] = useState<AudioRecorderState>({
    ...INITIAL_STATE,
    maxDurationSeconds: Math.max(1, maxDurationSeconds),
  });
  const streamRef = useRef<MediaStream | null>(null);
  const ownsStreamRef = useRef(false);
  const previousAudioEnabledRef = useRef<boolean[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef(pickAudioRecorderMimeType());
  const previewUrlRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const maxDurationRef = useRef(Math.max(1, maxDurationSeconds));
  const autoStoppedRef = useRef(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const pausedAtRef = useRef(0);
  const totalPausedMsRef = useRef(0);

  const pausePreviewPlayback = useCallback(() => {
    const audio = audioElementRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setState((prev) => (prev.isPlaying ? { ...prev, isPlaying: false } : prev));
  }, []);

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
    const stream = streamRef.current;
    if (stream && !ownsStreamRef.current) {
      stream.getAudioTracks().forEach((track, index) => {
        const previous = previousAudioEnabledRef.current[index];
        if (typeof previous === 'boolean') track.enabled = previous;
      });
    }
    if (ownsStreamRef.current) {
      stopTracks(stream);
    }
    ownsStreamRef.current = false;
    previousAudioEnabledRef.current = [];
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const resetRecording = useCallback(() => {
    clearTimer();
    pausePreviewPlayback();
    revokePreview();
    chunksRef.current = [];
    autoStoppedRef.current = false;
    pausedAtRef.current = 0;
    totalPausedMsRef.current = 0;
    cleanupStream();
    setState({
      ...INITIAL_STATE,
      maxDurationSeconds: maxDurationRef.current,
    });
  }, [cleanupStream, clearTimer, pausePreviewPlayback, revokePreview]);

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

  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio || !state.previewUrl) return undefined;

    const onEnded = () => setState((prev) => ({ ...prev, isPlaying: false }));
    const onPause = () => setState((prev) => ({ ...prev, isPlaying: false }));
    const onPlay = () => setState((prev) => ({ ...prev, isPlaying: true }));

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
    };
  }, [state.previewUrl]);

  useEffect(
    () => () => {
      clearTimer();
      pausePreviewPlayback();
      revokePreview();
      cleanupStream();
    },
    [cleanupStream, clearTimer, pausePreviewPlayback, revokePreview],
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
        playbackError: null,
        isPlaying: false,
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
      playbackError: null,
      isPlaying: false,
      elapsedSeconds: 0,
      maxDurationReached: false,
      uploadProgress: null,
    }));

    try {
      const liveAudioTracks =
        sharedStream
          ?.getAudioTracks()
          .filter((track) => track.readyState === 'live') ?? [];
      let stream: MediaStream;
      if (liveAudioTracks.length > 0) {
        // Audio-only wrapper keeps cam preview alive and avoids video in MediaRecorder.
        previousAudioEnabledRef.current = liveAudioTracks.map((track) => track.enabled);
        liveAudioTracks.forEach((track) => {
          track.enabled = true;
        });
        stream = new MediaStream(liveAudioTracks);
        ownsStreamRef.current = false;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ownsStreamRef.current = true;
        previousAudioEnabledRef.current = [];
      }
      streamRef.current = stream;
      const mimeType = pickAudioRecorderMimeType();
      mimeRef.current = mimeType;
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      pausedAtRef.current = 0;
      totalPausedMsRef.current = 0;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        clearTimer();
        cleanupStream();
        setError('unknown', 'practice.audioRecorder.unknownError');
      };

      recorder.onstop = () => {
        const activePauseMs = pausedAtRef.current ? Date.now() - pausedAtRef.current : 0;
        const elapsed = Math.max(
          0,
          Math.round(
            (Date.now() - startedAtRef.current - totalPausedMsRef.current - activePauseMs) / 1000,
          ),
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
        const activePauseMs = pausedAtRef.current ? Date.now() - pausedAtRef.current : 0;
        const elapsed = Math.floor(
          (Date.now() - startedAtRef.current - totalPausedMsRef.current - activePauseMs) / 1000,
        );
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
    sharedStream,
    state.status,
  ]);

  useEffect(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (paused && recorder.state === 'recording') {
      recorder.pause();
      pausedAtRef.current = Date.now();
      pausePreviewPlayback();
      return;
    }
    if (!paused && recorder.state === 'paused') {
      if (pausedAtRef.current) totalPausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = 0;
      recorder.resume();
    }
  }, [pausePreviewPlayback, paused]);

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
      status: prev.audioFile ? 'recorded' : 'error',
      errorKind: 'submit-failed',
      errorMessage: messageKey,
      uploadProgress: null,
    }));
  }, []);

  const replayAudio = useCallback(async () => {
    const audio = audioElementRef.current;
    if (!audio || !previewUrlRef.current) return;
    try {
      setState((prev) => ({ ...prev, playbackError: null }));
      audio.pause();
      audio.currentTime = 0;
      await audio.play();
      setState((prev) => ({ ...prev, isPlaying: true }));
    } catch {
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        playbackError: 'practice.audioRecorder.playbackError',
      }));
    }
  }, []);

  const restoreRecorded = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: prev.audioFile ? 'recorded' : 'idle',
      errorKind: null,
      errorMessage: null,
      playbackError: null,
      uploadProgress: null,
    }));
  }, []);

  return {
    state,
    audioElementRef,
    startRecording,
    stopRecording,
    resetRecording,
    replayAudio,
    pausePreviewPlayback,
    markSubmitting,
    markSuccess,
    markSubmitError,
    restoreRecorded,
  };
}
