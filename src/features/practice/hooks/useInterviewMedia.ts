import { useCallback, useEffect, useRef, useState } from 'react';

export type InterviewMediaState = 'idle' | 'starting' | 'ready' | 'error';

export function useInterviewMedia(micEnabled: boolean, cameraEnabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<InterviewMediaState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState('idle');
  }, []);

  const startMedia = useCallback(async () => {
    stopMedia();
    setState('starting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error');
      return null;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setState('ready');
      return mediaStream;
    } catch {
      setState('error');
      return null;
    }
  }, [stopMedia]);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = micEnabled;
    });
  }, [micEnabled]);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = cameraEnabled;
    });
  }, [cameraEnabled]);

  useEffect(() => () => stopMedia(), [stopMedia]);

  return {
    videoRef,
    stream,
    state,
    startMedia,
    stopMedia,
  };
}
