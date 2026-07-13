import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { isCampaignSessionId } from '../types/interviewFlow.types';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { InterviewFlowShell } from '../components/flow/InterviewFlowShell';

export const IdentityVerifyPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  useInterviewFlowSession(sessionId);
  const isCampaign = isCampaignSessionId(sessionId);
  const { deviceCheckPassed, termsAccepted, identitySnapshot, setIdentityVerified } =
    useInterviewFlowStore();
  const { videoRef, state, startPreview, stopStream, captureSnapshot } = useMediaDevices();
  const [preview, setPreview] = useState(identitySnapshot ?? '');

  useEffect(() => {
    if (!deviceCheckPassed) {
      navigate(`/interview/${sessionId}/device-check`, { replace: true });
      return;
    }
    if (isCampaign && !termsAccepted) {
      navigate(`/interview/${sessionId}/terms`, { replace: true });
    }
  }, [deviceCheckPassed, isCampaign, navigate, sessionId, termsAccepted]);

  useEffect(() => {
    void startPreview();
    return () => stopStream();
  }, [startPreview, stopStream]);

  const handleCapture = () => {
    const snapshot = captureSnapshot();
    if (!snapshot) return;
    setPreview(snapshot);
    setIdentityVerified(sessionId, snapshot);
  };

  const handleContinue = () => {
    if (!preview) return;
    navigate(`/interview/${sessionId}/waiting`);
  };

  return (
    <InterviewFlowShell
      sessionId={sessionId}
      currentStep="identity"
      title={t('practice.flow.identity.title')}
      description={t('practice.flow.identity.description')}
      isCampaignSession={isCampaign}
    >
      <div className="rounded-xl border border-subtle bg-surface-raised p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-base">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              aria-label={t('practice.flow.identity.liveLabel')}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-label text-muted-foreground">{t('practice.flow.identity.captureLabel')}</p>
            <div className="mt-2 flex-1 overflow-hidden rounded-lg border border-subtle bg-surface-base">
              {preview ? (
                <img
                  src={preview}
                  alt={t('practice.flow.identity.snapshotAlt')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                  {t('practice.flow.identity.emptySnapshot')}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="body-text mt-4">
          {state === 'ready'
            ? t('practice.flow.identity.hint')
            : t('practice.flow.device.denied')}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={state !== 'ready'}
            onClick={handleCapture}
          >
            {t('practice.flow.identity.capture')}
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!preview}
            onClick={handleContinue}
          >
            {t('practice.flow.continue')}
          </button>
        </div>
      </div>
    </InterviewFlowShell>
  );
};
