import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FlowWizardNav } from '@/components/patterns/flow-wizard/FlowWizardNav';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import { useInterviewGate } from '../../hooks/useInterviewGate';
import { getApiStatusCode } from '@/shared/api/apiError';
import { practiceSessionService } from '../../services/practiceSession.service';
import { LearningWaitingStartPanel } from '../flow/LearningWaitingStartPanel';
import { learningRoadmapDetailQueryKey } from '../../hooks/useLearningRoadmaps';
import { requestInterviewFullscreen } from '../../hooks/useInterviewFullscreen';
import {
  learningInterviewRoomPath,
  type LearningSessionRouteContext,
} from '../../utils/launchLearningInterviewPractice';
import type { PracticeSession } from '../../mocks/session.fixtures';
import { readCampaignInterviewSession } from '@/features/campaigns/utils/campaignInterviewSession';
import { PracticeSessionTopics } from '../PracticeSessionTopics';

type StartErrorUi = 'forbidden' | 'not_found' | 'ai_failed' | 'generic' | null;

interface WaitingRoomStepProps {
  sessionId: string;
  session: PracticeSession;
  onBack: () => void;
  learningContext?: LearningSessionRouteContext | null;
}

export function WaitingRoomStep({ sessionId, session, onBack, learningContext }: WaitingRoomStepProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLearning = Boolean(learningContext);
  const creditGate = useInterviewGate(sessionId);
  const campaignSession = readCampaignInterviewSession(sessionId);

  const [status, setStatus] = useState<'polling' | 'ready' | 'error'>('polling');
  const [pollError, setPollError] = useState<'capacity' | 'generic' | null>(null);
  const [questionCount, setQuestionCount] = useState(session.questions?.length ?? 0);
  const [isStarting, setIsStarting] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [startError, setStartError] = useState<StartErrorUi>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    setPollError(null);

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
        if (!isLearning && attempts >= 8) {
          setStatus('error');
          return;
        }
        window.setTimeout(() => void poll(), 1200);
      } catch (error) {
        if (cancelled) return;
        if (isLearning) {
          window.setTimeout(() => void poll(), 1500);
          return;
        }
        if (getApiStatusCode(error) === 429) {
          setPollError('capacity');
          setStatus('error');
          return;
        }
        setPollError('generic');
        setStatus('error');
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [isLearning, sessionId]);

  const handleStartInterview = async () => {
    if (campaignSession) {
      navigate(`/candidate/campaigns/${encodeURIComponent(campaignSession.campaignId)}/interview/${encodeURIComponent(sessionId)}`);
      return;
    }
    await requestInterviewFullscreen();
    navigate(`/interview/${sessionId}/room?start=countdown`);
  };

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

  const canStart = status === 'ready';

  return (
    <SectionPanel
      title={t('practice.flow.waiting.title')}
      footer={
        <FlowWizardNav
          backLabel={t('practice.flow.back')}
          nextLabel={t('practice.flow.waiting.startInterview')}
          onBack={onBack}
          onNext={isLearning ? () => void handleLearningStart() : handleStartInterview}
          nextDisabled={!canStart || isStarting}
          isLoading={isStarting}
        />
      }
    >
      <dl className="mb-6 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-satin bg-white/[0.03] px-4 py-3">
          <dt className="text-muted-foreground">{t('practice.flow.waiting.position')}</dt>
          <dd className="mt-1 font-semibold text-foreground">
            {session.title || session.jobCategory || '—'}
          </dd>
        </div>
        <div className="rounded-xl border border-satin bg-white/[0.03] px-4 py-3">
          <dt className="text-muted-foreground">{t('practice.flow.waiting.questions')}</dt>
          <dd className="mt-1 font-semibold text-foreground">{questionCount}</dd>
        </div>
      </dl>

      {session.topics?.length ? (
        <div className="mb-6 text-left">
          <PracticeSessionTopics
            topics={session.topics}
            seniority={session.seniority}
            variant="full"
          />
        </div>
      ) : null}

      <div className="rounded-xl border border-satin bg-white/[0.03] p-6 text-center">
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
          <p className="text-sm font-medium text-success">
            {t('practice.flow.waiting.ready').replace('{count}', String(questionCount))}
          </p>
        ) : null}
        {!isLearning && status === 'error' ? (
          <div>
            <p className="text-sm text-error">
              {pollError === 'capacity'
                ? t('practice.flow.waiting.capacityError')
                : t('practice.flow.waiting.error')}
            </p>
            {pollError !== 'capacity' ? (
              <button
                type="button"
                className="btn-primary mt-4"
                onClick={() => {
                  if (campaignSession) {
                    navigate(`/candidate/campaigns/${encodeURIComponent(campaignSession.campaignId)}/interview/${encodeURIComponent(sessionId)}`);
                    return;
                  }
                  navigate(`/interview/${sessionId}/room`);
                }}
              >
                {t('practice.flow.waiting.enterAnyway')}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionPanel>
  );
}
