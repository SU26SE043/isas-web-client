import { useCallback, useEffect, useRef, useState } from 'react';

export type InterviewMediaState = 'idle' | 'starting' | 'ready' | 'error';

export function useInterviewMedia(micEnabled: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<InterviewMediaState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const attachStreamToVideo = useCallback(async () => {
    const video = videoRef.current;
    const mediaStream = streamRef.current;
    if (!video || !mediaStream) return false;

    if (video.srcObject !== mediaStream) {
      video.srcObject = mediaStream;
    }

    try {
      await video.play();
      setState('ready');
      return true;
    } catch {
      return false;
    }
  }, []);

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

      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });

      const attached = await attachStreamToVideo();
      if (!attached) {
        setState('starting');
      }

      return mediaStream;
    } catch {
      setState('error');
      return null;
    }
  }, [attachStreamToVideo, stopMedia]);

  const setVideoElement = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && streamRef.current) {
        void attachStreamToVideo();
      }
    },
    [attachStreamToVideo],
  );

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = micEnabled;
    });
  }, [micEnabled]);

  useEffect(() => () => stopMedia(), [stopMedia]);

  return {
    videoRef,
    setVideoElement,
    stream,
    state,
    startMedia,
    stopMedia,
    attachStreamToVideo,
  };
}
