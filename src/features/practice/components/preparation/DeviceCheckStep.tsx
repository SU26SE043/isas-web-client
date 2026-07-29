import { useEffect } from 'react';
import { Camera, Mic } from 'lucide-react';
import { FlowWizardNav } from '@/components/patterns/flow-wizard/FlowWizardNav';
import { SectionPanel } from '@/components/ui/section-panel';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { useDeviceCheck } from '../../hooks/useDeviceCheck';
import { AudioLevelMeter } from './AudioLevelMeter';
import { DeviceSelector } from './DeviceSelector';

interface DeviceCheckStepProps {
  alreadyPassed?: boolean;
  onBack: () => void;
  onContinue: () => void;
}

function statusLabel(
  t: (key: string) => string,
  status: string,
  errorKey: string | null,
  successKey: string,
  checkingKey: string,
) {
  if (status === 'success') return t(successKey);
  if (status === 'failed' && errorKey) return t(errorKey);
  if (status === 'requesting-permission' || status === 'checking') return t(checkingKey);
  return t('practice.flow.device.hint');
}

export function DeviceCheckStep({
  alreadyPassed = false,
  onBack,
  onContinue,
}: DeviceCheckStepProps) {
  const { t } = useLanguage();
  const { videoRef, state, isReady, runCheck, stopStream, selectCamera, selectMicrophone } =
    useDeviceCheck();

  useEffect(() => {
    if (alreadyPassed) return;
    void runCheck();
  }, [alreadyPassed, runCheck]);

  useEffect(() => () => stopStream(), [stopStream]);

  const canContinue = alreadyPassed || isReady;

  const handleBack = () => {
    stopStream();
    onBack();
  };

  return (
    <SectionPanel
      icon={<Camera className="size-4" aria-hidden />}
      title={t('practice.flow.device.title')}
      footer={
        <FlowWizardNav
          backLabel={t('practice.flow.back')}
          nextLabel={t('practice.flow.continue')}
          onBack={handleBack}
          onNext={onContinue}
          nextDisabled={!canContinue}
        />
      }
    >
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col gap-4 rounded-2xl border border-satin bg-white/[0.03] p-4">
            <div className="flex items-start gap-3">
              <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                <Camera className="size-4" aria-hidden />
              </span>
              <p
                className={cn(
                  'pt-1.5 text-sm font-medium',
                  state.cameraStatus === 'success'
                    ? 'text-success'
                    : state.cameraStatus === 'failed'
                      ? 'text-error'
                      : 'text-foreground',
                )}
              >
                {statusLabel(
                  t,
                  state.cameraStatus,
                  state.cameraErrorKey,
                  'practice.flow.device.cameraPassed',
                  'practice.flow.device.cameraChecking',
                )}
              </p>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-satin bg-surface-base">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
                aria-label={t('practice.flow.device.previewLabel')}
              />
              {(state.cameraStatus === 'requesting-permission' ||
                state.cameraStatus === 'checking') && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-base/80 text-sm text-muted-foreground">
                  {t('practice.flow.device.requesting')}
                </div>
              )}
            </div>
            <DeviceSelector
              id="prep-camera"
              label={t('practice.flow.device.cameraLabel')}
              devices={state.cameras}
              value={state.selectedCameraId}
              disabled={!isReady && state.cameraStatus === 'requesting-permission'}
              onChange={(deviceId) => void selectCamera(deviceId)}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-satin bg-white/[0.03] p-4">
            <div className="flex items-start gap-3">
              <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                <Mic className="size-4" aria-hidden />
              </span>
              <p
                className={cn(
                  'pt-1.5 text-sm font-medium',
                  state.microphoneStatus === 'success'
                    ? 'text-success'
                    : state.microphoneStatus === 'failed'
                      ? 'text-error'
                      : 'text-foreground',
                )}
              >
                {statusLabel(
                  t,
                  state.microphoneStatus,
                  state.microphoneErrorKey,
                  'practice.flow.device.microphonePassed',
                  'practice.flow.device.microphoneChecking',
                )}
              </p>
            </div>
            <AudioLevelMeter
              level={state.audioLevel}
              label={t('practice.flow.device.microphoneLevel')}
            />
            <DeviceSelector
              id="prep-microphone"
              label={t('practice.flow.device.microphoneLabel')}
              devices={state.microphones}
              value={state.selectedMicrophoneId}
              disabled={!isReady && state.microphoneStatus === 'requesting-permission'}
              onChange={(deviceId) => void selectMicrophone(deviceId)}
            />
          </div>
        </div>

        {alreadyPassed ? (
          <p className="text-sm font-medium text-success">{t('practice.flow.device.alreadyPassed')}</p>
        ) : null}

        <button type="button" className="btn-secondary" onClick={() => void runCheck()}>
          {t('practice.flow.device.retry')}
        </button>
      </div>
    </SectionPanel>
  );
}
