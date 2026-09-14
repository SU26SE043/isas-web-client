import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/shared/languages';
import { practiceSessionService } from '../services/practiceSession.service';
import {
  isCampaignSessionId,
  requiresIdentityVerification,
} from '../types/interviewFlow.types';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { useInterviewGate } from '../hooks/useInterviewGate';
import { InterviewFlowShell } from '../components/flow/InterviewFlowShell';
import { LearningWaitingStartPanel } from '../components/flow/LearningWaitingStartPanel';
import { learningRoadmapDetailQueryKey } from '../hooks/useLearningRoadmaps';
import { requestInterviewFullscreen } from '../hooks/useInterviewFullscreen';
import { readCampaignInterviewSession } from '@/features/campaigns/utils/campaignInterviewSession';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { PracticeSessionTopics } from '../components/PracticeSessionTopics';
import {
  getLearningSessionRouteContext,
  learningInterviewRoomPath,
} from '../utils/launchLearningInterviewPractice';

type StartErrorUi = 'forbidden' | 'not_found' | 'ai_failed' | 'generic' | null;

export const WaitingRoomPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const session = useB2cPracticeInterviewStore((state) => state.session);
  const queryClient = useQueryClient();
  useInterviewFlowSession(sessionId);
  const { deviceCheckPassed, identityVerified } = useInterviewFlowStore();
  const isCampaign = isCampaignSessionId(sessionId);
  const learningContext = getLearningSessionRouteContext(searchParams);
  const isLearning = Boolean(learningContext);
  const creditGate = useInterviewGate(sessionId);
  const redirectToPrep = !isCampaign && !isLearning;
  const campaignRoomPath = () => {
    const campaign = readCampaignInterviewSession(sessionId);
    return campaign
      ? `/candidate/campaigns/${encodeURIComponent(campaign.campaignId)}/interview/${encodeURIComponent(sessionId)}`
      : `/interview/${sessionId}/room?start=countdown`;
  };

  const [status, setStatus] = useState<'polling' | 'ready' | 'error'>('polling');
  const [questionCount, setQuestionCount] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [startError, setStartError] = useState<StartErrorUi>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!deviceCheckPassed) {
      navigate(`/interview/${sessionId}/prepare?step=device`, { replace: true });
      return;
    }
    if (requiresIdentityVerification(sessionId) && !identityVerified) {
      navigate(`/interview/${sessionId}/identity`, { replace: true });
    }
  }, [deviceCheckPassed, identityVerified, navigate, sessionId]);

  useEffect(() => {
    if (redirectToPrep) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const questions = await practiceSessionService.pollQuestions(sessionId);
        if (cancelled) return;
        if (questions.length > 0) {
          setQuestionCount(questions.length);
          setStatus('ready');
          return;
        }
        window.setTimeout(() => void poll(), 1200);
      } catch {
        if (!cancelled) window.setTimeout(() => void poll(), 1500);
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [redirectToPrep, sessionId]);

  useEffect(() => {
    if (redirectToPrep || isLearning || status !== 'ready') return;
    const timer = window.setTimeout(() => {
      navigate(campaignRoomPath());
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [isLearning, navigate, redirectToPrep, sessionId, status]);

  const handleLearningStart = async () => {
    if (!learningContext || status !== 'ready' || inFlightRef.current || isStarting) return;
    inFlightRef.current = true;
    setIsStarting(true);
    setStartError(null);
    try {
      await requestInterviewFullscreen();
      void queryClient.invalidateQueries({
        queryKey: learningRoadmapDetailQueryKey(learningContext.roadmapId),
      });
      navigate(learningInterviewRoomPath(sessionId, learningContext, true), { replace: true });
    } catch {
      setStartError('generic');
    } finally {
      inFlightRef.current = false;
      setIsStarting(false);
    }
  };

  if (redirectToPrep) {
    return <Navigate to={`/interview/${sessionId}/prepare?step=waiting`} replace />;
  }

  return (
    <InterviewFlowShell
      sessionId={sessionId}
      currentStep="waiting"
      title={t('practice.flow.waiting.title')}
      isCampaignSession={isCampaign}
    >
      <div className="rounded-xl border border-subtle bg-surface-raised p-8 text-center">
        {session?.topics?.length ? (
          <div className="mb-6 text-left">
            <PracticeSessionTopics
              topics={session.topics}
              seniority={session.seniority}
              variant="full"
            />
          </div>
        ) : null}
        {isLearning ? (
          <LearningWaitingStartPanel
            questionCount={questionCount}
            isStarting={isStarting}
            startError={startError}
            creditOpen={creditOpen}
            onCreditOpenChange={setCreditOpen}
            onStart={() => void handleLearningStart()}
            canStart={Boolean(learningContext)}
            isReady={status === 'ready'}
            hasSufficientTokens={creditGate.hasSufficientTokens}
            creditsRemaining={creditGate.creditsRemaining}
          />
        ) : null}

        {!isLearning && status === 'polling' ? (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-muted-foreground" aria-hidden />
            <p className="mt-4 text-sm text-foreground">{t('practice.flow.waiting.polling')}</p>
          </>
        ) : null}
        {!isLearning && status === 'ready' ? (
          <p className="text-sm text-success">
            {t('practice.flow.waiting.ready').replace('{count}', String(questionCount))}
          </p>
        ) : null}
        {!isLearning && status === 'error' ? (
          <div>
          <p className="text-sm text-error">{t('practice.flow.waiting.error')}</p>
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={async () => {
                await requestInterviewFullscreen();
                navigate(campaignRoomPath());
              }}
            >
              {t('practice.flow.waiting.enterAnyway')}
            </button>
          </div>
        ) : null}
      </div>
    </InterviewFlowShell>
  );
};
