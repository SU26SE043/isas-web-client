import React, { useCallback, useEffect, useState } from 'react';
import { Maximize2, MoreHorizontal } from 'lucide-react';
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
    <div className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-satin bg-surface-raised shadow-[var(--satin-inset)]">
      <div className="relative min-h-0 w-full flex-1 bg-surface-base">
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

        <div className="absolute right-3 top-3 flex gap-1.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-satin bg-black/45 text-white/80 backdrop-blur-md">
            <Maximize2 className="size-3.5" aria-hidden />
            <span className="sr-only">{t('practice.room.expandCamera')}</span>
          </span>
          <span className="flex size-8 items-center justify-center rounded-lg border border-satin bg-black/45 text-white/80 backdrop-blur-md">
            <MoreHorizontal className="size-3.5" aria-hidden />
            <span className="sr-only">{t('practice.room.cameraMore')}</span>
          </span>
        </div>

        <div className="absolute bottom-3 left-3 rounded-md border border-satin bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
          {micEnabled ? t('practice.room.micOn') : t('practice.room.micOff')}
        </div>
      </div>
    </div>
  );
};
