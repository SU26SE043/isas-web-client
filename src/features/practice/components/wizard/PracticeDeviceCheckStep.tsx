import { useEffect } from 'react';
import { Camera } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeDeviceCheckStepProps {
  disabled?: boolean;
  onReadyChange: (ready: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PracticeDeviceCheckStep({
  disabled,
  onReadyChange,
  onBack,
  onNext,
}: PracticeDeviceCheckStepProps) {
  const { t } = useLanguage();
  const { videoRef, state, errorKey, startPreview, stopStream } = useMediaDevices();
  const ready = state === 'ready';
  const failed = state === 'denied' || state === 'unavailable';

  useEffect(() => {
    void startPreview();
    return () => stopStream();
  }, [startPreview, stopStream]);

  useEffect(() => {
    onReadyChange(ready);
  }, [onReadyChange, ready]);

  return (
    <PracticeWizardStepCard
      icon={<Camera className="size-4" aria-hidden />}
      title={t('practice.setup.device.title')}
      description={t('practice.setup.device.description')}
      footer={
        <PracticeWizardNav onBack={onBack} onNext={onNext} nextDisabled={!ready || disabled} />
      }
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-satin bg-surface-base">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          aria-label={t('practice.flow.device.previewLabel')}
        />
        {state === 'requesting' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-base/80 text-sm text-muted-foreground">
            {t('practice.flow.device.requesting')}
          </div>
        ) : null}
      </div>

      <p
        className={
          ready ? 'mt-4 text-sm text-success' : failed ? 'mt-4 text-sm text-error' : 'mt-4 text-sm text-foreground'
        }
      >
        {ready
          ? t('practice.flow.device.passed')
          : failed
            ? t(errorKey ?? 'practice.flow.device.denied')
            : t('practice.flow.device.hint')}
      </p>

      <button
        type="button"
        className="btn-secondary mt-4"
        onClick={() => void startPreview()}
        disabled={disabled}
      >
        {t('practice.flow.device.retry')}
      </button>
    </PracticeWizardStepCard>
  );
}
