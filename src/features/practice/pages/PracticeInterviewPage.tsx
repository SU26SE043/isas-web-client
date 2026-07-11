import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { InterviewHeader } from '../components/InterviewHeader';
import { AIInterviewerPanel } from '../components/AIInterviewerPanel';
import { CandidateCameraPanel } from '../components/CandidateCameraPanel';
import { InterviewInfoCard } from '../components/InterviewInfoCard';
import { PersonalNotes } from '../components/PersonalNotes';
import { InterviewControls } from '../components/InterviewControls';
import { ProctoringAlertBanner } from '../components/room/ProctoringAlertBanner';
import { TabLockOverlay } from '../components/room/TabLockOverlay';
import { NetworkLossDialog } from '../components/room/NetworkLossDialog';
import { PauseOverlay } from '../components/room/PauseOverlay';
import { QuestionListDialog } from '../components/room/QuestionListDialog';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useInterviewMedia } from '../hooks/useInterviewMedia';
import { useInterviewRecording } from '../hooks/useInterviewRecording';

export const PracticeInterviewPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const identityVerified = useInterviewFlowStore((state) => state.identityVerified);
  const session = useInterviewSession(sessionId);
  const media = useInterviewMedia(session.micEnabled, session.cameraEnabled);
  const [questionListOpen, setQuestionListOpen] = useState(false);

  const recording = useInterviewRecording({
    sessionId,
    stream: media.stream,
    enabled: session.isRecording && session.isRoomActive,
    paused: session.status === 'paused',
  });

  useEffect(() => {
    if (!identityVerified) {
      navigate(`/interview/${sessionId}/prepare`, { replace: true });
    }
  }, [identityVerified, navigate, sessionId]);

  useEffect(() => {
    if (session.isLoading || session.status === 'completed') return;
    void media.startMedia();
  }, [media, session.isLoading, session.status]);

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.room.loading')}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col surface-base pb-24 font-sans">
      <InterviewHeader sessionId={sessionId} isRecording={session.isRecording} />
      <ProctoringAlertBanner violationCount={session.tabViolationCount} />

      {recording.recorderError ? (
        <div role="alert" className="border-b border-red-500/30 bg-red-500/10 px-6 py-2 text-sm text-red-300">
          {t('practice.room.recordingError')}
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-[calc(100vh-140px)] min-h-[600px] lg:col-span-8">
            <AIInterviewerPanel
              aiState={session.aiState}
              messages={session.messages}
              isGenerating={session.status === 'generating'}
            />
          </div>

          <div className="flex h-[calc(100vh-140px)] min-h-[600px] flex-col gap-6 lg:col-span-4">
            <CandidateCameraPanel
              videoRef={media.videoRef}
              cameraEnabled={session.cameraEnabled}
              micEnabled={session.micEnabled}
              mediaReady={media.state === 'ready'}
            />
            <InterviewInfoCard
              sessionTitle={session.sessionTitle}
              currentIndex={session.currentIndex}
              totalQuestions={session.totalQuestions}
              onViewQuestions={() => setQuestionListOpen(true)}
            />
            <PersonalNotes />
          </div>
        </div>
      </main>

      <InterviewControls
        sessionId={sessionId}
        remainingSeconds={session.remainingSeconds}
        isSubmitting={session.status === 'submitting'}
        isPaused={session.status === 'paused'}
        micEnabled={session.micEnabled}
        cameraEnabled={session.cameraEnabled}
        isRecording={session.isRecording}
        chunksUploaded={recording.chunksUploaded}
        onSubmit={() => void session.submitAnswer()}
        onTogglePause={session.togglePause}
        onToggleMic={session.toggleMic}
        onToggleCamera={session.toggleCamera}
        onToggleRecording={session.toggleRecording}
      />

      <QuestionListDialog
        open={questionListOpen}
        questions={session.questions}
        currentIndex={session.currentIndex}
        onClose={() => setQuestionListOpen(false)}
      />
      <TabLockOverlay visible={session.isTabHidden} />
      <NetworkLossDialog open={session.isOffline} />
      <PauseOverlay visible={session.status === 'paused'} onResume={session.togglePause} />
    </div>
  );
};
