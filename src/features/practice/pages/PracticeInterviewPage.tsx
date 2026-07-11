import React, { useEffect } from 'react';
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
import { useInterviewFlowStore } from '../stores/interviewFlowStore';
import { useInterviewSession } from '../hooks/useInterviewSession';

export const PracticeInterviewPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const identityVerified = useInterviewFlowStore((state) => state.identityVerified);
  const session = useInterviewSession(sessionId);

  useEffect(() => {
    if (!identityVerified) {
      navigate(`/interview/${sessionId}/prepare`, { replace: true });
    }
  }, [identityVerified, navigate, sessionId]);

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
            <CandidateCameraPanel />
            <InterviewInfoCard
              sessionTitle={session.sessionTitle}
              currentIndex={session.currentIndex}
              totalQuestions={session.totalQuestions}
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
        onSubmit={() => void session.submitAnswer()}
        onTogglePause={session.togglePause}
        onToggleMic={session.toggleMic}
        onToggleCamera={session.toggleCamera}
      />

      <TabLockOverlay visible={session.isTabHidden} />
      <NetworkLossDialog open={session.isOffline} />
      <PauseOverlay visible={session.status === 'paused'} onResume={session.togglePause} />
    </div>
  );
};
