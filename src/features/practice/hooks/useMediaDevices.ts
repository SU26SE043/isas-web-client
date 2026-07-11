import { useCallback, useEffect, useRef, useState } from 'react';

export type MediaDeviceState = 'idle' | 'requesting' | 'ready' | 'denied' | 'unavailable';

export function useMediaDevices() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<MediaDeviceState>('idle');
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startPreview = useCallback(async () => {
    stopStream();
    setState('requesting');
    setErrorKey(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unavailable');
      setErrorKey('practice.flow.device.unavailable');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState('ready');
      return true;
    } catch {
      setState('denied');
      setErrorKey('practice.flow.device.denied');
      return false;
    }
  }, [stopStream]);

  const captureSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  return {
    videoRef,
    state,
    errorKey,
    startPreview,
    stopStream,
    captureSnapshot,
    hasAudio: Boolean(streamRef.current?.getAudioTracks().length),
    hasVideo: Boolean(streamRef.current?.getVideoTracks().length),
  };
}
