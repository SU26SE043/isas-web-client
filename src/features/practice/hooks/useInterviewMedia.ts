import { useCallback, useEffect, useRef, useState } from 'react';

export type InterviewMediaState = 'idle' | 'starting' | 'ready' | 'error';

export function useInterviewMedia(micEnabled: boolean, cameraEnabled = true) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micEnabledRef = useRef(micEnabled);
  const cameraEnabledRef = useRef(cameraEnabled);
  const startGenerationRef = useRef(0);
  const [state, setState] = useState<InterviewMediaState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);

  micEnabledRef.current = micEnabled;
  cameraEnabledRef.current = cameraEnabled;

  const applyTrackEnabled = useCallback(() => {
    const mediaStream = streamRef.current;
    if (!mediaStream) return;
    mediaStream.getAudioTracks().forEach((track) => {
      track.enabled = micEnabledRef.current;
    });
    mediaStream.getVideoTracks().forEach((track) => {
      track.enabled = cameraEnabledRef.current;
    });
  }, []);

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
      // Autoplay can fail briefly; stream is still attached for retry.
      return false;
    }
  }, []);

  const stopMedia = useCallback(() => {
    startGenerationRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState('idle');
  }, []);

  const startMedia = useCallback(async () => {
    const generation = ++startGenerationRef.current;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState('starting');

    if (!navigator.mediaDevices?.getUserMedia) {
      if (generation === startGenerationRef.current) setState('error');
      return null;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });

      if (generation !== startGenerationRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return null;
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      applyTrackEnabled();

      const attached = await attachStreamToVideo();
      if (generation !== startGenerationRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return null;
      }
      if (!attached) {
        setState('starting');
      }

      return mediaStream;
    } catch {
      if (generation === startGenerationRef.current) setState('error');
      return null;
    }
  }, [applyTrackEnabled, attachStreamToVideo]);

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
    applyTrackEnabled();
    if (cameraEnabled) {
      void attachStreamToVideo();
    }
  }, [applyTrackEnabled, attachStreamToVideo, micEnabled, cameraEnabled]);

  useEffect(() => {
    if (!stream) return;
    void attachStreamToVideo();
  }, [attachStreamToVideo, stream]);

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
