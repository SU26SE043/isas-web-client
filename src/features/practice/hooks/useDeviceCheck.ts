import { useCallback, useEffect, useRef, useState } from 'react';

export type DeviceCheckStatus =
  | 'idle'
  | 'requesting-permission'
  | 'checking'
  | 'success'
  | 'failed';

export interface DeviceCheckState {
  cameraStatus: DeviceCheckStatus;
  microphoneStatus: DeviceCheckStatus;
  cameraErrorKey: string | null;
  microphoneErrorKey: string | null;
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  selectedCameraId: string;
  selectedMicrophoneId: string;
  audioLevel: number;
}

const INITIAL_STATE: DeviceCheckState = {
  cameraStatus: 'idle',
  microphoneStatus: 'idle',
  cameraErrorKey: null,
  microphoneErrorKey: null,
  cameras: [],
  microphones: [],
  selectedCameraId: '',
  selectedMicrophoneId: '',
  audioLevel: 0,
};

function mapMediaError(error: unknown, kind: 'camera' | 'microphone'): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return kind === 'camera'
      ? 'practice.flow.device.cameraPermissionDenied'
      : 'practice.flow.device.microphonePermissionDenied';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return kind === 'camera'
      ? 'practice.flow.device.cameraNotFound'
      : 'practice.flow.device.microphoneNotFound';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return kind === 'camera'
      ? 'practice.flow.device.cameraInUse'
      : 'practice.flow.device.microphoneInUse';
  }
  return kind === 'camera'
    ? 'practice.flow.device.cameraFailed'
    : 'practice.flow.device.microphoneFailed';
}

export function useDeviceCheck() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const [state, setState] = useState<DeviceCheckState>(INITIAL_STATE);

  const stopAudioMeter = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
  }, []);

  const stopStream = useCallback(() => {
    stopAudioMeter();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stopAudioMeter]);

  const startAudioMeter = useCallback((stream: MediaStream) => {
    const audioTrack = stream.getAudioTracks()[0];
    const AudioContextConstructor = window.AudioContext;
    if (!audioTrack || !AudioContextConstructor) return;

    try {
      const audioContext = new AudioContextConstructor();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        setState((prev) => ({ ...prev, audioLevel: Math.min(1, average / 128) }));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Metering is an enhancement; a valid live microphone must still pass the device check.
    }
  }, []);

  const refreshDeviceLists = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return { cameras: [], microphones: [] };
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      cameras: devices.filter((device) => device.kind === 'videoinput'),
      microphones: devices.filter((device) => device.kind === 'audioinput'),
    };
  }, []);

  const runCheck = useCallback(
    async (cameraId?: string, microphoneId?: string) => {
      const runId = ++runIdRef.current;
      stopStream();
      setState((prev) => ({
        ...prev,
        cameraStatus: 'requesting-permission',
        microphoneStatus: 'requesting-permission',
        cameraErrorKey: null,
        microphoneErrorKey: null,
        audioLevel: 0,
      }));

      if (!navigator.mediaDevices?.getUserMedia) {
        setState((prev) => ({
          ...prev,
          cameraStatus: 'failed',
          microphoneStatus: 'failed',
          cameraErrorKey: 'practice.flow.device.unavailable',
          microphoneErrorKey: 'practice.flow.device.unavailable',
        }));
        return false;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: cameraId
            ? { deviceId: { exact: cameraId } }
            : { facingMode: 'user' },
          audio: microphoneId ? { deviceId: { exact: microphoneId } } : true,
        });

        if (runId !== runIdRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return false;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        const lists = await refreshDeviceLists();

        const nextCameraStatus: DeviceCheckStatus = videoTrack?.readyState === 'live' ? 'success' : 'failed';
        const nextMicStatus: DeviceCheckStatus = audioTrack?.readyState === 'live' ? 'success' : 'failed';

        setState((prev) => ({
          ...prev,
          cameraStatus: nextCameraStatus,
          microphoneStatus: nextMicStatus,
          cameraErrorKey:
            nextCameraStatus === 'success' ? null : 'practice.flow.device.cameraNotFound',
          microphoneErrorKey:
            nextMicStatus === 'success' ? null : 'practice.flow.device.microphoneNotFound',
          cameras: lists.cameras,
          microphones: lists.microphones,
          selectedCameraId: videoTrack?.getSettings().deviceId ?? cameraId ?? '',
          selectedMicrophoneId: audioTrack?.getSettings().deviceId ?? microphoneId ?? '',
        }));

        if (audioTrack) startAudioMeter(stream);
        return nextCameraStatus === 'success' && nextMicStatus === 'success';
      } catch (error) {
        if (runId !== runIdRef.current) return false;

        const cameraErrorKey = mapMediaError(error, 'camera');
        const microphoneErrorKey = mapMediaError(error, 'microphone');
        setState((prev) => ({
          ...prev,
          cameraStatus: 'failed',
          microphoneStatus: 'failed',
          cameraErrorKey,
          microphoneErrorKey,
        }));
        return false;
      }
    },
    [refreshDeviceLists, startAudioMeter, stopStream],
  );

  const selectCamera = useCallback(
    async (deviceId: string) => {
      setState((prev) => ({ ...prev, selectedCameraId: deviceId }));
      return runCheck(deviceId, state.selectedMicrophoneId || undefined);
    },
    [runCheck, state.selectedMicrophoneId],
  );

  const selectMicrophone = useCallback(
    async (deviceId: string) => {
      setState((prev) => ({ ...prev, selectedMicrophoneId: deviceId }));
      return runCheck(state.selectedCameraId || undefined, deviceId);
    },
    [runCheck, state.selectedCameraId],
  );

  useEffect(() => () => stopStream(), [stopStream]);

  const isReady = state.cameraStatus === 'success' && state.microphoneStatus === 'success';

  return {
    videoRef,
    state,
    isReady,
    runCheck,
    stopStream,
    selectCamera,
    selectMicrophone,
  };
}
