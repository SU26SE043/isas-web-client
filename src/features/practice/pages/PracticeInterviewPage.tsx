import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { InterviewHeader } from '../components/InterviewHeader';
import { AIInterviewerPanel } from '../components/AIInterviewerPanel';
import { CandidateCameraPanel } from '../components/CandidateCameraPanel';
import { InterviewQuestionPanel } from '../components/InterviewQuestionPanel';
import { InterviewControls } from '../components/InterviewControls';
import { B2cPracticeInterviewRoom } from '../components/B2cPracticeInterviewRoom';
import { ProctoringAlertBanner } from '../components/room/ProctoringAlertBanner';
import { TabLockOverlay } from '../components/room/TabLockOverlay';
import { NetworkLossDialog } from '../components/room/NetworkLossDialog';
import { PauseOverlay } from '../components/room/PauseOverlay';
import { ViolationPauseOverlay } from '../components/room/ViolationPauseOverlay';
import { FullscreenExitBanner } from '../components/room/FullscreenExitBanner';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';
import { useInterviewFlowSession } from '../hooks/useInterviewFlowSession';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useInterviewMedia } from '../hooks/useInterviewMedia';
import { useInterviewRecording } from '../hooks/useInterviewRecording';
import { useInterviewRoomProctoring } from '../hooks/useInterviewRoomProctoring';
import { useLearningLiveFeedback } from '../hooks/useLearningLiveFeedback';
import { useLearningAnswerCapture } from '../hooks/useLearningAnswerCapture';
import {
  isCampaignSessionId,
  isLearningSessionId,
  requiresIdentityVerification,
} from '../types/interviewFlow.types';

export const PracticeInterviewPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const isB2cPractice =
    Boolean(sessionId) && !isLearningSessionId(sessionId) && !isCampaignSessionId(sessionId);

  if (isB2cPractice) {
    return <B2cPracticeInterviewRoom sessionId={sessionId} startWithCountdown={searchParams.get('start') === 'countdown'} />;
  }

  return <LegacyInterviewRoom sessionId={sessionId} />;
};

function LegacyInterviewRoom({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  useInterviewFlowSession(sessionId);
  const hydratedSessionId = useInterviewFlowStore((state) => state.hydratedSessionId);
  const identityVerified = useInterviewFlowStore((state) => state.identityVerified);
  const deviceCheckPassed = useInterviewFlowStore((state) => state.deviceCheckPassed);
  const session = useInterviewSession(sessionId);
  const setAiState = useInterviewSessionStore((state) => state.setAiState);
  const media = useInterviewMedia(session.micEnabled, session.cameraEnabled);
  const learning = useLearningLiveFeedback(sessionId, session.isLearning);
  const answerCapture = useLearningAnswerCapture(
    media.stream,
    session.isLearning && session.isRoomActive && !session.isLoading,
  );

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
    if (!sessionId || hydratedSessionId !== sessionId) return;
    if (requiresIdentityVerification(sessionId)) {
      if (!identityVerified) {
        navigate(`/interview/${sessionId}/identity`, { replace: true });
      }
      return;
    }
    if (!deviceCheckPassed) {
      navigate(`/interview/${sessionId}/prepare?step=device`, { replace: true });
    }
  }, [deviceCheckPassed, hydratedSessionId, identityVerified, navigate, sessionId]);

  useEffect(() => {
    if (session.isLoading || session.status === 'completed') return;
    void media.startMedia();
  }, [media.startMedia, session.isLoading, session.status]);

  const handleSubmit = () => {
    if (session.isLearning) {
      void learning.submitForReport(session.currentQuestion, answerCapture.stopAndGetBlob);
      return;
    }
    void session.submitAnswer();
  };

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.room.loading')}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col surface-base pb-28 font-sans">
      <InterviewHeader
        sessionId={sessionId}
        isRecording={session.isRecording}
        exitHref={learning.exitHref}
        titleKey={session.isLearning ? 'practice.learningPath.practiceSession' : undefined}
      />
      <FullscreenExitBanner />
      {antiCheatEnabled ? <ProctoringAlertBanner violationCount={session.tabViolationCount} /> : null}

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
              cameraEnabled={session.cameraEnabled}
            />
          </div>
        </div>

        <InterviewQuestionPanel
          currentIndex={session.currentIndex}
          totalQuestions={session.totalQuestions}
          remainingSeconds={session.remainingSeconds}
          question={
            session.currentQuestion
              ? {
                  id: session.currentQuestion.id,
                  orderNo: session.currentIndex + 1,
                  content: session.currentQuestion.content,
                  timeLimitSec: session.currentQuestion.timeLimitSeconds ?? 120,
                  kind: 'question',
                }
              : null
          }
        />
      </main>

      <InterviewControls
        sessionId={sessionId}
        isSubmitting={session.status === 'submitting' || learning.isCompleting}
        isPaused={session.isManualPaused}
        isLocked={(antiCheatEnabled && session.isViolationPaused) || session.isAutoSubmitted}
        micEnabled={session.micEnabled}
        cameraEnabled={session.cameraEnabled}
        cameraAlwaysOn={session.proctoringConfig.cameraAlwaysOn}
        isRecording={session.isRecording}
        onSubmit={handleSubmit}
        onTogglePause={session.togglePause}
        onToggleMic={session.toggleMic}
        onToggleCamera={session.toggleCamera}
        onToggleRecording={session.toggleRecording}
        onSpeakAgain={() => setAiState('speaking')}
        speakAgainDisabled={session.isManualPaused || session.isViolationPaused}
        learningMode={session.isLearning}
        isLastQuestion={false}
        isEvaluating={learning.isEvaluating}
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
}
