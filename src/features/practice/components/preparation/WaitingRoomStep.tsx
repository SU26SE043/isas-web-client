import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FlowWizardNav } from '@/components/patterns/flow-wizard/FlowWizardNav';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import { practiceSessionService } from '../../services/practiceSession.service';
import { isLearningSessionId } from '../../types/interviewFlow.types';
import { LearningWaitingStartPanel } from '../flow/LearningWaitingStartPanel';
import { getLearningPracticeSession } from '../../services/learningPracticeSession.registry';
import { startLearningLessonPractice } from '../../utils/launchLearningInterviewPractice';
import { learningRoadmapDetailQueryKey } from '../../hooks/useLearningRoadmaps';
import { loadFlowProgress, saveFlowProgress } from '../../utils/interviewFlowStorage';
import { useInterviewFlowStore } from '../../stores/interviewFlowStore';
import type { PracticeSession } from '../../mocks/session.fixtures';

type StartErrorUi = 'forbidden' | 'not_found' | 'ai_failed' | 'generic' | null;

interface WaitingRoomStepProps {
  sessionId: string;
  session: PracticeSession;
  onBack: () => void;
}

export function WaitingRoomStep({ sessionId, session, onBack }: WaitingRoomStepProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLearning = isLearningSessionId(sessionId);
  const learningMeta = isLearning ? getLearningPracticeSession(sessionId) : undefined;

  const [status, setStatus] = useState<'polling' | 'ready' | 'error'>('polling');
  const [questionCount, setQuestionCount] = useState(session.questions?.length ?? 0);
  const [isStarting, setIsStarting] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [startError, setStartError] = useState<StartErrorUi>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (isLearning) {
      setStatus('ready');
      setQuestionCount(learningMeta?.questions.length ?? 0);
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
  }, [isLearning, learningMeta?.questions.length, sessionId]);

  const handleStartInterview = () => {
    navigate(`/interview/${sessionId}/room`);
  };

  const handleLearningStart = async () => {
    if (!learningMeta || inFlightRef.current || isStarting) return;
    inFlightRef.current = true;
    setIsStarting(true);
    setStartError(null);
    try {
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
      navigate(`/interview/${nextSessionId}/room`, { replace: true });
    } catch {
      setStartError('generic');
    } finally {
      inFlightRef.current = false;
      setIsStarting(false);
    }
  };

  const canStart = isLearning ? Boolean(learningMeta) : status === 'ready';

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

      <div className="rounded-xl border border-satin bg-white/[0.03] p-6 text-center">
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
          <p className="text-sm font-medium text-success">
            {t('practice.flow.waiting.ready').replace('{count}', String(questionCount))}
          </p>
        ) : null}
        {!isLearning && status === 'error' ? (
          <p className="text-sm text-error">{t('practice.flow.waiting.error')}</p>
        ) : null}
      </div>
    </SectionPanel>
  );
}
