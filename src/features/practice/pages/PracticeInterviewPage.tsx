import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { InterviewHeader } from '../components/InterviewHeader';
import { AIInterviewerPanel } from '../components/AIInterviewerPanel';
import { CandidateCameraPanel } from '../components/CandidateCameraPanel';
import { InterviewQuestionPanel } from '../components/InterviewQuestionPanel';
import { InterviewControls } from '../components/InterviewControls';
import { LearningLiveFeedbackPanel } from '../components/learning-path/LearningLiveFeedbackPanel';
import { ProctoringAlertBanner } from '../components/room/ProctoringAlertBanner';
import { TabLockOverlay } from '../components/room/TabLockOverlay';
import { NetworkLossDialog } from '../components/room/NetworkLossDialog';
import { PauseOverlay } from '../components/room/PauseOverlay';
import { ViolationPauseOverlay } from '../components/room/ViolationPauseOverlay';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useInterviewMedia } from '../hooks/useInterviewMedia';
import { useInterviewRecording } from '../hooks/useInterviewRecording';
import { useInterviewRoomProctoring } from '../hooks/useInterviewRoomProctoring';
import { useLearningLiveFeedback } from '../hooks/useLearningLiveFeedback';
import { ReserveSettleBanner } from '@/features/payment/components/ReserveSettleBanner';
import { paymentService } from '@/features/payment/services/payment.service';
import { PRACTICE_RESERVE_ESTIMATE } from '@/features/payment/constants';
import { requiresIdentityVerification } from '../types/interviewFlow.types';

export const PracticeInterviewPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  useInterviewFlowSession(sessionId);
  const identityVerified = useInterviewFlowStore((state) => state.identityVerified);
  const deviceCheckPassed = useInterviewFlowStore((state) => state.deviceCheckPassed);
  const session = useInterviewSession(sessionId);
  const setAiState = useInterviewSessionStore((state) => state.setAiState);
  const media = useInterviewMedia(session.micEnabled);
  const learning = useLearningLiveFeedback(sessionId, session.isLearning);

  const { antiCheatEnabled } = useInterviewRoomProctoring({
    sessionId,
    roomActive: session.isRoomActive,
    violationPaused: session.isViolationPaused,
    videoRef: media.videoRef,
  });

  const recording = useInterviewRecording({
    sessionId,
    stream: media.stream,
    enabled: session.isRecording && session.isRoomActive,
    paused: session.isManualPaused || session.isViolationPaused,
  });

  useEffect(() => {
    if (requiresIdentityVerification(sessionId)) {
      if (!identityVerified) {
        navigate(`/interview/${sessionId}/identity`, { replace: true });
      }
      return;
    }
    if (!deviceCheckPassed) {
      navigate(`/interview/${sessionId}/device-check`, { replace: true });
    }
  }, [deviceCheckPassed, identityVerified, navigate, sessionId]);

  useEffect(() => {
    if (session.isLoading || session.status === 'completed') return;
    void media.startMedia();
  }, [media.startMedia, session.isLoading, session.status]);

  const handleSubmit = () => {
    if (session.isLearning) {
      void learning.evaluateAnswer(session.currentQuestion);
      return;
    }
    void session.submitAnswer();
  };

  const handleNextQuestion = async () => {
    learning.clearFeedback();
    await session.submitCurrentAnswer();
  };

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.room.loading')}</span>
      </div>
    );
  }

  const isLastQuestion = session.currentIndex >= session.totalQuestions - 1;

  return (
    <div className="flex min-h-screen flex-col surface-base pb-28 font-sans">
      <InterviewHeader
        sessionId={sessionId}
        isRecording={session.isRecording}
        exitHref={learning.exitHref}
        titleKey={session.isLearning ? 'practice.learningPath.practiceSession' : undefined}
      />
      {antiCheatEnabled ? <ProctoringAlertBanner violationCount={session.tabViolationCount} /> : null}
      {!session.isLearning && paymentService.hasReservation(sessionId) ? (
        <div className="px-6 pt-4">
          <ReserveSettleBanner
            mode="reserved"
            reservedTokens={paymentService.getReservationAmount(sessionId) || PRACTICE_RESERVE_ESTIMATE}
          />
        </div>
      ) : null}

      {antiCheatEnabled && session.isAutoSubmitted ? (
        <div role="alert" className="border-b border-red-500/30 bg-red-500/10 px-6 py-2 text-sm text-red-300">
          {t('practice.room.autoSubmitted')}
        </div>
      ) : null}

      {recording.recorderError ? (
        <div role="alert" className="border-b border-red-500/30 bg-red-500/10 px-6 py-2 text-sm text-red-300">
          {t('practice.room.recordingError')}
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="min-h-[240px] lg:col-span-8 lg:min-h-[320px]">
            <AIInterviewerPanel aiState={session.aiState} />
          </div>
          <div className="min-h-[220px] lg:col-span-4 lg:min-h-[320px]">
            <CandidateCameraPanel
              videoRef={media.videoRef}
              setVideoElement={media.setVideoElement}
              stream={media.stream}
              micEnabled={session.micEnabled}
            />
          </div>
        </div>

        <InterviewQuestionPanel
          currentIndex={session.currentIndex}
          totalQuestions={session.totalQuestions}
          remainingSeconds={session.remainingSeconds}
          onSpeakAgain={() => setAiState('speaking')}
          speakAgainDisabled={session.isManualPaused || session.isViolationPaused}
        />
      </main>

      {session.isLearning && learning.feedback ? (
        <LearningLiveFeedbackPanel feedback={learning.feedback} language={language} />
      ) : null}

      <InterviewControls
        sessionId={sessionId}
        remainingSeconds={session.remainingSeconds}
        isSubmitting={session.status === 'submitting' || learning.isCompleting}
        isPaused={session.isManualPaused}
        isLocked={(antiCheatEnabled && session.isViolationPaused) || session.isAutoSubmitted}
        micEnabled={session.micEnabled}
        isRecording={session.isRecording}
        chunksUploaded={recording.chunksUploaded}
        onSubmit={handleSubmit}
        onTogglePause={session.togglePause}
        onToggleMic={session.toggleMic}
        onToggleRecording={session.toggleRecording}
        learningMode={session.isLearning}
        feedbackVisible={Boolean(learning.feedback)}
        isLastQuestion={isLastQuestion}
        isEvaluating={learning.isEvaluating}
        onNextQuestion={() => void handleNextQuestion()}
        onCompleteSession={() => void learning.completeSession(session.submitCurrentAnswer)}
        exitHref={learning.exitHref}
      />

      {antiCheatEnabled ? <TabLockOverlay visible={session.isTabHidden} /> : null}
      <NetworkLossDialog open={session.isOffline} />
      <PauseOverlay visible={session.isManualPaused} onResume={session.togglePause} />
      {antiCheatEnabled ? (
        <ViolationPauseOverlay
          visible={session.isViolationPaused && !session.isTabHidden}
          reason={session.violationReason}
          violationCount={session.violationCount}
          maxViolations={session.maxViolations}
          onContinue={session.continueAfterViolation}
        />
      ) : null}
    </div>
  );
};
