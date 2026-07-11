import React from 'react';
import { useLanguage } from '@/shared/languages';

interface CandidateCameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraEnabled: boolean;
  micEnabled: boolean;
  mediaReady: boolean;
}

export const CandidateCameraPanel: React.FC<CandidateCameraPanelProps> = ({
  videoRef,
  cameraEnabled,
  micEnabled,
  mediaReady,
}) => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-lg border border-subtle bg-surface-raised shadow-sm">
      <div className="relative aspect-video w-full bg-surface-base">
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${cameraEnabled ? '' : 'opacity-0'}`}
          playsInline
          muted
          aria-label={t('practice.candidateCamera')}
        />
        {!mediaReady ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {t('practice.room.cameraStarting')}
          </div>
        ) : null}
        {mediaReady && !cameraEnabled ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-base text-sm text-muted-foreground">
            {t('practice.room.cameraOff')}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between border-t border-subtle px-3 py-2 text-xs text-muted-foreground">
        <span>{t('practice.candidateCamera')}</span>
        <span>{micEnabled ? t('practice.room.micOn') : t('practice.room.micOff')}</span>
      </div>
    </div>
  );
};
