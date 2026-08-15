import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/shared/languages';
import { practiceSessionService } from '../services/practiceSession.service';
import {
  isCampaignSessionId,
  isLearningSessionId,
  requiresIdentityVerification,
} from '../types/interviewFlow.types';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { InterviewFlowShell } from '../components/flow/InterviewFlowShell';
import { LearningWaitingStartPanel } from '../components/flow/LearningWaitingStartPanel';
import { getLearningPracticeSession } from '../services/learningPracticeSession.registry';
import { startLearningLessonPractice } from '../utils/launchLearningInterviewPractice';
import { learningRoadmapDetailQueryKey } from '../hooks/useLearningRoadmaps';
import { loadFlowProgress, saveFlowProgress } from '../utils/interviewFlowStorage';
import { requestInterviewFullscreen } from '../hooks/useInterviewFullscreen';
import { readCampaignInterviewSession } from '@/features/campaigns/utils/campaignInterviewSession';

type StartErrorUi = 'forbidden' | 'not_found' | 'ai_failed' | 'generic' | null;

export const WaitingRoomPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  useInterviewFlowSession(sessionId);
  const { deviceCheckPassed, identityVerified } = useInterviewFlowStore();
  const isCampaign = isCampaignSessionId(sessionId);
  const isLearning = isLearningSessionId(sessionId);
  const learningMeta = isLearning ? getLearningPracticeSession(sessionId) : undefined;
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
    if (redirectToPrep || isLearning) {
      if (isLearning) {
        setStatus('ready');
        setQuestionCount(learningMeta?.questions.length ?? 0);
      }
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const questions = await practiceSessionService.pollQuestions(sessionId);
        if (cancelled) return;
        if (questions.length > 0) {
          setQuestionCount(questions.length);
          setStatus('ready');
          return;
        }
        if (attempts >= 8) {
          setStatus('error');
          return;
        }
        window.setTimeout(() => void poll(), 1200);
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [isLearning, learningMeta?.questions.length, redirectToPrep, sessionId]);

  useEffect(() => {
    if (redirectToPrep || isLearning || status !== 'ready') return;
    const timer = window.setTimeout(() => {
      navigate(campaignRoomPath());
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [isLearning, navigate, redirectToPrep, sessionId, status]);

  const handleLearningStart = async () => {
    if (!learningMeta || inFlightRef.current || isStarting) return;
    inFlightRef.current = true;
    setIsStarting(true);
    setStartError(null);
    try {
      await requestInterviewFullscreen();
      const result = await startLearningLessonPractice({
        roadmapId: learningMeta.roadmapId,
        lessonId: learningMeta.lessonId,
        title: learningMeta.title,
      });
      if (!result.ok) {
        if (result.code === 'insufficient_credits') {
          setCreditOpen(true);
          return;
        }
        if (result.code === 'forbidden') setStartError('forbidden');
        else if (result.code === 'not_found') setStartError('not_found');
        else if (result.code === 'ai_failed') setStartError('ai_failed');
        else setStartError('generic');
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: learningRoadmapDetailQueryKey(learningMeta.roadmapId),
      });
      const nextSessionId = result.session.sessionId;
      if (nextSessionId !== sessionId) {
        const progress = loadFlowProgress(sessionId) ?? {
          consentAccepted: true,
          deviceCheckPassed: true,
          termsAccepted: false,
          identityVerified: false,
        };
        saveFlowProgress(nextSessionId, {
          consentAccepted: true,
          deviceCheckPassed: true,
          termsAccepted: Boolean(progress.termsAccepted),
          identityVerified: Boolean(progress.identityVerified),
          identitySnapshot: progress.identitySnapshot,
        });
        useInterviewFlowStore.getState().hydrate(nextSessionId);
      }
      navigate(`/interview/${nextSessionId}/room?start=countdown`, { replace: true });
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
        {isLearning ? (
          <LearningWaitingStartPanel
            questionCount={questionCount}
            isStarting={isStarting}
            startError={startError}
            creditOpen={creditOpen}
            onCreditOpenChange={setCreditOpen}
            onStart={() => void handleLearningStart()}
            canStart={Boolean(learningMeta)}
          />
        ) : null}

        {!isLearning && status === 'polling' ? (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-muted-foreground" aria-hidden />
            <p className="mt-4 text-sm text-foreground">{t('practice.flow.waiting.polling')}</p>
          </>
        ) : null}
        {!isLearning && status === 'ready' ? (
          <p className="text-sm text-emerald-400">
            {t('practice.flow.waiting.ready').replace('{count}', String(questionCount))}
          </p>
        ) : null}
        {!isLearning && status === 'error' ? (
          <div>
            <p className="text-sm text-red-400">{t('practice.flow.waiting.error')}</p>
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
