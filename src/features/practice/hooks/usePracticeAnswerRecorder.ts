import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PRACTICE_ANSWER_AUDIO_MAX_BYTES,
} from '../types/b2cPracticeSession.types';
import type { RecordingStatus } from '../types/b2cPracticeSession.types';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';

function pickMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return 'audio/webm';
}

export function usePracticeAnswerRecorder(stream: MediaStream | null) {
  const setRecordingStatus = useB2cPracticeInterviewStore((s) => s.setRecordingStatus);
  const recordingStatus = useB2cPracticeInterviewStore((s) => s.recordingStatus);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const mimeRef = useRef(pickMimeType());
  const discardOnStopRef = useRef(false);
  const pausedAtRef = useRef(0);
  const totalPausedMsRef = useRef(0);

  const clearRecording = useCallback(() => {
    discardOnStopRef.current = false;
    setAudioFile(null);
    setDurationSec(0);
    setErrorKey(null);
    chunksRef.current = [];
    pausedAtRef.current = 0;
    totalPausedMsRef.current = 0;
    setRecordingStatus('idle');
  }, [setRecordingStatus]);

  const stopRecorder = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const stopRecordingAndDiscard = useCallback(() => {
    discardOnStopRef.current = true;
    chunksRef.current = [];
    setAudioFile(null);
    setDurationSec(0);
    setErrorKey(null);
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      discardOnStopRef.current = false;
      setRecordingStatus('idle');
    }
  }, [setRecordingStatus]);

  const startRecording = useCallback(() => {
    if (!stream) {
      setErrorKey('practice.flow.device.denied');
      setRecordingStatus('error');
      return;
    }
    const activeAudioTracks = stream.getAudioTracks().filter((track) => track.readyState === 'live');
    if (activeAudioTracks.length === 0 || !stream.active) {
      setErrorKey('practice.room.recordingError');
      setRecordingStatus('error');
      return;
    }
    const currentRecorder = recorderRef.current;
    if (currentRecorder && currentRecorder.state !== 'inactive') return;

    discardOnStopRef.current = false;
    setErrorKey(null);
    chunksRef.current = [];
    const mimeType = pickMimeType();
    mimeRef.current = mimeType;
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
    } catch {
      recorderRef.current = null;
      setErrorKey('practice.room.recordingError');
      setRecordingStatus('error');
      return;
    }
    startedAtRef.current = Date.now();
    pausedAtRef.current = 0;
    totalPausedMsRef.current = 0;
    recorder.ondataavailable = (event) => {
      if (discardOnStopRef.current) return;
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      if (discardOnStopRef.current) {
        discardOnStopRef.current = false;
        chunksRef.current = [];
        setAudioFile(null);
        setDurationSec(0);
        setRecordingStatus('idle');
        return;
      }
      const blob = new Blob(chunksRef.current, { type: mimeRef.current });
      const activePauseMs = pausedAtRef.current ? Date.now() - pausedAtRef.current : 0;
      const elapsed = Math.max(
        1,
        Math.round((Date.now() - startedAtRef.current - totalPausedMsRef.current - activePauseMs) / 1000),
      );
      const file = new File([blob], `answer-${Date.now()}.webm`, {
        type: blob.type || 'audio/webm',
      });
      if (file.size > PRACTICE_ANSWER_AUDIO_MAX_BYTES) {
        setErrorKey('practice.errors.audioTooLarge');
        setAudioFile(null);
        setDurationSec(0);
        setRecordingStatus('error');
        return;
      }
      setAudioFile(file);
      setDurationSec(elapsed);
      setRecordingStatus('stopped');
    };
    try {
      recorder.start(250);
    } catch {
      recorderRef.current = null;
      chunksRef.current = [];
      setErrorKey('practice.room.recordingError');
      setRecordingStatus('error');
      return;
    }
    setRecordingStatus('recording');
  }, [setRecordingStatus, stream]);

  useEffect(() => () => stopRecorder(), [stopRecorder]);

  const pauseRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    recorder.pause();
    pausedAtRef.current = Date.now();
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'paused') return;
    if (pausedAtRef.current) totalPausedMsRef.current += Date.now() - pausedAtRef.current;
    pausedAtRef.current = 0;
    recorder.resume();
  }, []);

  return {
    recordingStatus: recordingStatus as RecordingStatus,
    audioFile,
    durationSec,
    errorKey,
    startRecording,
    stopRecording: stopRecorder,
    stopRecordingAndDiscard,
    pauseRecording,
    resumeRecording,
    clearRecording,
    setUploading: () => setRecordingStatus('uploading'),
    setSubmitted: () => setRecordingStatus('submitted'),
    setStopped: () => setRecordingStatus('stopped'),
    setIdle: () => setRecordingStatus('idle'),
  };
}
