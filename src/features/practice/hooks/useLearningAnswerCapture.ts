import { useCallback, useEffect, useRef } from 'react';

function pickMimeType(): string | undefined {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Captures a continuous answer recording for learning practice submit.
 * Uses the live media stream; returns a Blob on stop.
 */
export function useLearningAnswerCapture(stream: MediaStream | null, enabled: boolean) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !stream || typeof MediaRecorder === 'undefined') {
      return undefined;
    }

    chunksRef.current = [];
    const mimeType = pickMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    startedAtRef.current = Date.now();
    recorder.start(1000);

    return () => {
      if (recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          // ignore
        }
      }
      recorderRef.current = null;
    };
  }, [enabled, stream]);

  const stopAndGetBlob = useCallback(async (): Promise<{ blob: Blob; durationSec: number }> => {
    const recorder = recorderRef.current;
    const durationSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));

    if (!recorder || recorder.state === 'inactive') {
      const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' });
      return { blob, durationSec };
    }

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
      };
      try {
        recorder.requestData();
      } catch {
        // ignore
      }
      recorder.stop();
    });

    // Restart capture for the next question while still in the room.
    chunksRef.current = [];
    if (stream && enabled) {
      const mimeType = pickMimeType();
      const next = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = next;
      next.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      startedAtRef.current = Date.now();
      next.start(1000);
    }

    return { blob, durationSec };
  }, [enabled, stream]);

  return { stopAndGetBlob };
}
