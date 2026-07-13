import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { isCampaignSessionId } from '../types/interviewFlow.types';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { InterviewFlowShell } from '../components/flow/InterviewFlowShell';

export const DeviceCheckPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  useInterviewFlowSession(sessionId);
  const { consentAccepted, deviceCheckPassed, setDeviceCheckPassed } = useInterviewFlowStore();
  const { videoRef, state, errorKey, startPreview, stopStream } = useMediaDevices();
  const isCampaign = isCampaignSessionId(sessionId);

  useEffect(() => {
    if (!consentAccepted) {
      navigate(`/interview/${sessionId}/prepare`, { replace: true });
    }
  }, [consentAccepted, navigate, sessionId]);

  useEffect(() => {
    void startPreview();
    return () => stopStream();
  }, [startPreview, stopStream]);

  const handleContinue = () => {
    if (state !== 'ready') return;
    setDeviceCheckPassed(sessionId, true);
    navigate(isCampaign ? `/interview/${sessionId}/terms` : `/interview/${sessionId}/waiting`);
  };

  return (
    <InterviewFlowShell
      sessionId={sessionId}
      currentStep="device-check"
      title={t('practice.flow.device.title')}
      description={t('practice.flow.device.description')}
      isCampaignSession={isCampaign}
    >
      <div className="rounded-xl border border-subtle bg-surface-raised p-6">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-base">
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

        <div className="mt-4 space-y-2">
          <p className="text-sm text-foreground">
            {state === 'ready'
              ? t('practice.flow.device.passed')
              : state === 'denied' || state === 'unavailable'
                ? t(errorKey ?? 'practice.flow.device.denied')
                : t('practice.flow.device.hint')}
          </p>
          {deviceCheckPassed ? (
            <p className="text-sm text-emerald-400">{t('practice.flow.device.alreadyPassed')}</p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-secondary" onClick={() => void startPreview()}>
            {t('practice.flow.device.retry')}
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={state !== 'ready'}
            onClick={handleContinue}
          >
            {t('practice.flow.continue')}
          </button>
        </div>
      </div>
    </InterviewFlowShell>
  );
};
