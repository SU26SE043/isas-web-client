import { useEffect, useRef, useState } from 'react';
import { practiceSessionService } from '../services/practiceSession.service';

function pickRecorderMimeType(): string | undefined {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

interface UseInterviewRecordingOptions {
  sessionId: string;
  stream: MediaStream | null;
  enabled: boolean;
  paused: boolean;
}

export function useInterviewRecording({
  sessionId,
  stream,
  enabled,
  paused,
}: UseInterviewRecordingOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunkIndexRef = useRef(0);
  const [chunksUploaded, setChunksUploaded] = useState(0);
  const [recorderError, setRecorderError] = useState(false);

  useEffect(() => {
    if (!stream || !enabled || typeof MediaRecorder === 'undefined') {
      return undefined;
    }

    let cancelled = false;
    chunkIndexRef.current = 0;
    setChunksUploaded(0);
    setRecorderError(false);

    const mimeType = pickRecorderMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (cancelled || event.data.size === 0) return;
      const index = chunkIndexRef.current;
      chunkIndexRef.current += 1;
      void practiceSessionService
        .uploadRecordingChunk(sessionId, index, event.data)
        .then(() => {
          if (!cancelled) setChunksUploaded((count) => count + 1);
        })
        .catch(() => {
          if (!cancelled) setRecorderError(true);
        });
    };

    recorder.onerror = () => {
      if (!cancelled) setRecorderError(true);
    };

    recorder.start(5000);

    return () => {
      cancelled = true;
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      recorderRef.current = null;
    };
  }, [enabled, sessionId, stream]);

  useEffect(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    if (paused && recorder.state === 'recording') {
      recorder.pause();
      return;
    }

    if (!paused && recorder.state === 'paused') {
      recorder.resume();
    }
  }, [paused]);

  return { chunksUploaded, recorderError };
}
