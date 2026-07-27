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

  const clearRecording = useCallback(() => {
    discardOnStopRef.current = false;
    setAudioFile(null);
    setDurationSec(0);
    setErrorKey(null);
    chunksRef.current = [];
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
    discardOnStopRef.current = false;
    setErrorKey(null);
    chunksRef.current = [];
    const mimeType = pickMimeType();
    mimeRef.current = mimeType;
    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
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
      const elapsed = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
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
    recorder.start(250);
    setRecordingStatus('recording');
  }, [setRecordingStatus, stream]);

  useEffect(() => () => stopRecorder(), [stopRecorder]);

  return {
    recordingStatus: recordingStatus as RecordingStatus,
    audioFile,
    durationSec,
    errorKey,
    startRecording,
    stopRecording: stopRecorder,
    stopRecordingAndDiscard,
    clearRecording,
    setUploading: () => setRecordingStatus('uploading'),
    setSubmitted: () => setRecordingStatus('submitted'),
    setStopped: () => setRecordingStatus('stopped'),
    setIdle: () => setRecordingStatus('idle'),
  };
}
