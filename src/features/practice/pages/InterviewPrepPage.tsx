import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { practiceSessionService } from '../services/practiceSession.service';
import { isCampaignSessionId } from '../types/interviewFlow.types';
import { useInterviewGate } from '../hooks/useInterviewGate';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { InterviewFlowShell } from '../components/flow/InterviewFlowShell';
import { InterviewGatePanel } from '../components/flow/InterviewGatePanel';
import { PreparationChecklistStep } from '../components/preparation/PreparationChecklistStep';
import { DeviceCheckStep } from '../components/preparation/DeviceCheckStep';
import { WaitingRoomStep } from '../components/preparation/WaitingRoomStep';
import { getLearningSessionRouteContext } from '../utils/launchLearningInterviewPractice';
import {
  normalizePracticeSessionId,
  practiceSessionErrorMessageKey,
} from '../utils/practiceSessionLoad';
import { getApiStatusCode } from '@/shared/api/apiError';

export type PreparationSubStep = 'prepare' | 'device' | 'waiting';

function parseSubStep(value: string | null): PreparationSubStep {
  if (value === 'device' || value === 'waiting') return value;
  return 'prepare';
}

function toFlowStep(subStep: PreparationSubStep): 'prepare' | 'device-check' | 'waiting' {
  if (subStep === 'device') return 'device-check';
  return subStep;
}

interface InterviewPrepPageProps {
  onCampaignDeviceReady?: (sessionId: string) => void;
}

export const InterviewPrepPage: React.FC<InterviewPrepPageProps> = ({ onCampaignDeviceReady }) => {
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const sessionId = normalizePracticeSessionId(routeSessionId);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  useInterviewFlowSession(sessionId ?? '');
  const gate = useInterviewGate(sessionId ?? undefined);
  const { consentAccepted, deviceCheckPassed, setConsentAccepted, setDeviceCheckPassed } =
    useInterviewFlowStore();

  const subStep = parseSubStep(searchParams.get('step'));
  const isCampaignSession = Boolean(sessionId && isCampaignSessionId(sessionId));
  const learningContext = getLearningSessionRouteContext(searchParams);
  const isLearningSession = Boolean(learningContext);
  const cancelHref = learningContext
    ? `/candidate/learning/roadmaps/${learningContext.roadmapId}`
    : '/candidate/dashboard';
  const consentKey = isCampaignSession
    ? 'practice.flow.prepare.consent'
    : 'practice.flow.prepare.consentPractice';

  const sessionQuery = useQuery({
    queryKey: ['practice', 'session', sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error('SESSION_ID_REQUIRED');
      return practiceSessionService.getSession(sessionId);
    },
    enabled: Boolean(sessionId),
    staleTime: 30_000,
    retryOnMount: false,
    retry: (failureCount, error) => {
      const status = getApiStatusCode(error);
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });

  const loadErrorKey = !sessionId
    ? 'practice.session.missingSessionId'
    : sessionQuery.isError
      ? practiceSessionErrorMessageKey(sessionQuery.error)
      : null;

  const canContinuePrepare = gate.canStart && consentAccepted && Boolean(sessionQuery.data);

  const pageTitle = useMemo(() => {
    if (subStep === 'device') return t('practice.flow.device.title');
    if (subStep === 'waiting') return t('practice.flow.waiting.title');
    return t('practice.flow.prepare.title');
  }, [subStep, t]);

  const setSubStep = (next: PreparationSubStep) => {
    const nextParams = new URLSearchParams();
    if (learningContext) {
      nextParams.set('roadmapId', learningContext.roadmapId);
      nextParams.set('lessonId', learningContext.lessonId);
    }
    if (next !== 'prepare') nextParams.set('step', next);
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    if (!sessionId) return;
    if (!consentAccepted && subStep !== 'prepare') {
      setSubStep('prepare');
      return;
    }
    if (consentAccepted && !deviceCheckPassed && subStep === 'waiting' && !isCampaignSession) {
      setSubStep('device');
    }
  }, [consentAccepted, deviceCheckPassed, isCampaignSession, sessionId, subStep]);

  useEffect(() => {
    if (subStep !== 'waiting' || !deviceCheckPassed || !sessionId) return;
    if (!navigator.permissions?.query) return;

    let cancelled = false;

    const verifyPermissions = async () => {
      try {
        const [camera, microphone] = await Promise.all([
          navigator.permissions.query({ name: 'camera' as PermissionName }),
          navigator.permissions.query({ name: 'microphone' as PermissionName }),
        ]);
        if (cancelled) return;
        if (camera.state === 'denied' || microphone.state === 'denied') {
          setDeviceCheckPassed(sessionId, false);
          setSubStep('device');
        }
      } catch {
        // Permissions API unsupported — device step handles access on next visit.
      }
    };

    void verifyPermissions();
    return () => {
      cancelled = true;
    };
  }, [deviceCheckPassed, sessionId, setDeviceCheckPassed, subStep]);

  const goToSubStep = (next: PreparationSubStep) => {
    setSubStep(next);
  };

  const handlePrepareContinue = () => {
    goToSubStep('device');
  };

  const handleDeviceContinue = () => {
    if (!sessionId) return;
    setDeviceCheckPassed(sessionId, true);
    if (isCampaignSession) {
      if (onCampaignDeviceReady) {
        onCampaignDeviceReady(sessionId);
        return;
      }
      navigate(`/interview/${sessionId}/terms`, { replace: true });
      return;
    }
    goToSubStep('waiting');
  };

  const handleConsentChange = (checked: boolean) => {
    if (sessionId) setConsentAccepted(sessionId, checked);
  };

  return (
    <InterviewFlowShell
      sessionId={sessionId ?? '--'}
      currentStep={toFlowStep(subStep)}
      title={pageTitle}
      isCampaignSession={isCampaignSession}
      failedStep={loadErrorKey ? 'prepare' : undefined}
    >
      {loadErrorKey ? (
        <div role="alert" className="frame-satin rounded-2xl bg-surface-raised p-6">
          <AlertCircle className="size-7 text-error" aria-hidden />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {t('practice.session.loadErrorTitle')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(loadErrorKey)}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {sessionId && sessionQuery.isError ? (
              <Button type="button" variant="outline" onClick={() => void sessionQuery.refetch()}>
                {t('practice.session.retry')}
              </Button>
            ) : null}
            <Button render={<Link to="/practice" />} nativeButton={false} variant="ghost">
              {t('practice.session.backToPractice')}
            </Button>
          </div>
        </div>
      ) : gate.isLoading || sessionQuery.isLoading ? (
        <div className="frame-satin flex min-h-[220px] items-center justify-center rounded-2xl">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          <span className="sr-only">{t('practice.session.loading')}</span>
        </div>
      ) : sessionQuery.data && subStep === 'prepare' ? (
        <div className="space-y-5">
          {!isLearningSession ? (
            <InterviewGatePanel
              meetsProfileGate={gate.meetsProfileGate}
              hasCredits={gate.hasCredits}
              completenessPercent={gate.completenessPercent}
              creditsRemaining={gate.tokenAvailable}
              reserveEstimate={gate.reserveEstimate}
            />
          ) : null}
          <PreparationChecklistStep
            consentAccepted={consentAccepted}
            consentKey={consentKey}
            canContinue={canContinuePrepare}
            consentDisabled={!gate.canStart}
            onCancel={() => navigate(cancelHref)}
            onConsentChange={handleConsentChange}
            onContinue={handlePrepareContinue}
          />
        </div>
      ) : sessionQuery.data && subStep === 'device' ? (
        <DeviceCheckStep
          alreadyPassed={deviceCheckPassed}
          onBack={() => goToSubStep('prepare')}
          onContinue={handleDeviceContinue}
        />
      ) : sessionQuery.data && subStep === 'waiting' && sessionId ? (
        <WaitingRoomStep
          sessionId={sessionId}
          session={sessionQuery.data}
          onBack={() => goToSubStep('device')}
          learningContext={learningContext}
        />
      ) : null}
    </InterviewFlowShell>
  );
};
