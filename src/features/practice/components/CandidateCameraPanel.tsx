import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/shared/languages';

interface CandidateCameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setVideoElement?: (node: HTMLVideoElement | null) => void;
  stream: MediaStream | null;
  micEnabled: boolean;
}

export const CandidateCameraPanel: React.FC<CandidateCameraPanelProps> = ({
  videoRef,
  setVideoElement,
  stream,
  micEnabled,
}) => {
  const { t } = useLanguage();
  const [hasVideoFrame, setHasVideoFrame] = useState(false);

  const handleVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      setVideoElement?.(node);
    },
    [setVideoElement, videoRef],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      setHasVideoFrame(false);
      return undefined;
    }

    const syncFrameState = () => {
      setHasVideoFrame(video.readyState >= 2 && !video.paused);
    };

    video.addEventListener('loadeddata', syncFrameState);
    video.addEventListener('playing', syncFrameState);
    video.addEventListener('emptied', syncFrameState);
    syncFrameState();

    const pollId = window.setInterval(syncFrameState, 250);

    return () => {
      window.clearInterval(pollId);
      video.removeEventListener('loadeddata', syncFrameState);
      video.removeEventListener('playing', syncFrameState);
      video.removeEventListener('emptied', syncFrameState);
    };
  }, [stream, videoRef]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-subtle bg-surface-raised shadow-sm">
      <div className="relative aspect-video w-full bg-surface-base">
        <video
          ref={handleVideoRef}
          className="h-full w-full scale-x-[-1] object-cover"
          playsInline
          autoPlay
          muted
          aria-label={t('practice.candidateCamera')}
        />
        {!hasVideoFrame ? (
          <div
            className="pointer-events-none absolute inset-0 animate-pulse bg-surface-overlay"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="flex items-center justify-between border-t border-subtle px-3 py-2 text-xs text-muted-foreground">
        <span>{t('practice.candidateCamera')}</span>
        <span>{micEnabled ? t('practice.room.micOn') : t('practice.room.micOff')}</span>
      </div>
    </div>
  );
};
