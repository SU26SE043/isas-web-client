import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { getApiStatusCode } from '@/shared/api/apiError';
import { InterviewHeader } from './InterviewHeader';
import { AIInterviewerPanel } from './AIInterviewerPanel';
import { CandidateCameraPanel } from './CandidateCameraPanel';
import { InterviewQuestionPanel } from './InterviewQuestionPanel';
import { B2cInterviewControls } from './B2cInterviewControls';
import { B2cPracticeRoomModals } from './B2cPracticeRoomModals';
import { AnswerRecorderCard } from './audio-recorder/AnswerRecorderCard';
import { AudioRecorderModal } from './audio-recorder/AudioRecorderModal';
import { QuestionStartCountdown } from './QuestionStartCountdown';
import { FullscreenExitBanner } from './room/FullscreenExitBanner';
import { useB2cPracticeRoom } from '../hooks/useB2cPracticeRoom';
import { mapSubmitPracticeAnswerErrorKey } from '../utils/b2cPracticeSessionErrors';
import {
  mapModalToCardStatus,
  resolveAnswerCardStatus,
} from '../utils/resolveAnswerCardStatus';
import type { AudioRecorderStatus } from '../types/audioRecorder.types';

interface B2cPracticeInterviewRoomProps {
  sessionId: string;
  completePath?: string;
  startWithCountdown?: boolean;
  deadlineAt?: string | null;
}

export function B2cPracticeInterviewRoom({ sessionId, completePath, startWithCountdown, deadlineAt }: B2cPracticeInterviewRoomProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const room = useB2cPracticeRoom(sessionId, { completePath, startWithCountdown, deadlineAt });
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<AudioRecorderStatus | null>(null);
  const interviewCompleteToastRef = useRef(false);

  useEffect(() => {
    if (room.interviewComplete && !interviewCompleteToastRef.current) {
      interviewCompleteToastRef.current = true;
      toast.success(t('practice.finish.aiComplete'), { duration: 6000 });
    }
  }, [room.interviewComplete, t]);

  if (room.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.room.loading')}</span>
      </div>
    );
  }

  const speechStatus = room.speech.isPlaying
    ? t('practice.speech.aiSpeaking')
    : room.speech.needsManualPlay
      ? null
      : t('practice.speech.readyToAnswer');

  const nextActionLabel = room.lastNextAction
    ? t(`practice.nextAction.${room.lastNextAction}`)
    : null;

  const finishLabel = room.interviewComplete
    ? t('practice.finish.complete')
    : t('practice.finish.action');

  const answer = room.currentQuestion
    ? room.answersByQuestionId[room.currentQuestion.id]
    : undefined;

  const liveModalStatus = recorderOpen ? mapModalToCardStatus(modalStatus ?? 'idle') : null;
  const cardStatus =
    liveModalStatus ??
    resolveAnswerCardStatus({
      hasAnswer: Boolean(answer),
      questionState: room.currentQuestion
        ? room.questionStates[room.currentQuestion.id]
        : undefined,
      isSubmitting: room.isSubmittingAnswer,
      answerError: room.answerError,
    });

  const questionLabel = t('practice.room.questionOf')
    .replace('{current}', String(room.currentIndex + 1))
    .replace('{total}', String(Math.max(room.questions.length, 1)));

  const maxDurationSeconds = Math.max(
    1,
    Math.min(
      room.remainingSeconds || room.currentQuestion?.timeLimitSec || 120,
      room.currentQuestion?.timeLimitSec || room.remainingSeconds || 120,
    ),
  );

  const openRecorder = () => {
    if (room.phase !== 'answering' || room.isTimingOut || room.remainingSeconds <= 0 || room.isSubmittingAnswer) return;
    setRecorderOpen(true);
  };

  return (
    <div className="relative flex min-h-screen flex-col surface-base pb-32 font-sans">
      <InterviewHeader sessionId={sessionId} isRecording={recorderOpen && cardStatus === 'recording'} />
      <FullscreenExitBanner />

      {room.media.state === 'error' ? (
        <div role="alert" className="border-b border-error/30 bg-error/10 px-6 py-2 text-sm text-error">
          {t('practice.flow.device.denied')}
          <button
            type="button"
            className="ml-3 underline underline-offset-2"
            onClick={() => void room.media.startMedia()}
          >
            {t('practice.flow.device.retry')}
          </button>
        </div>
      ) : null}
      {room.speechWarning ? (
        <div role="status" className="border-b border-warning/30 bg-warning/10 px-6 py-2 text-sm text-warning">
          {t(room.speechWarning)}
        </div>
      ) : null}
      {room.answerError && !recorderOpen ? (
        <div role="alert" className="border-b border-error/30 bg-error/10 px-6 py-2 text-sm text-error">
          {t(room.answerError)}
        </div>
      ) : null}
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="min-h-[240px] lg:col-span-8 lg:min-h-[320px]">
            <AIInterviewerPanel aiState={room.speech.isPlaying ? 'speaking' : 'listening'} />
          </div>
          <div className="min-h-[220px] lg:col-span-4 lg:min-h-[320px]">
            <CandidateCameraPanel
              videoRef={room.media.videoRef}
              setVideoElement={room.media.setVideoElement}
              stream={room.media.stream}
              micEnabled={room.micEnabled}
              cameraEnabled={room.cameraEnabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-7 lg:gap-5">
          <div className="min-w-0 lg:col-span-5">
            <InterviewQuestionPanel
              currentIndex={room.currentIndex}
              totalQuestions={room.questions.length}
              remainingSeconds={room.remainingSeconds}
              question={room.currentQuestion}
              questions={room.questions}
              questionStates={room.questionStates}
              showWarning={room.showTimerWarning}
              nextActionLabel={nextActionLabel}
              speechStatus={speechStatus}
              isTimingOut={room.isTimingOut}
              hasNextQuestion={
                room.currentQuestion
                  ? room.currentIndex < room.questions.length - 1
                  : false
              }
            />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <AnswerRecorderCard
              status={cardStatus}
              disabled={room.phase !== 'answering' || room.isSubmittingSession || room.isTimingOut || room.remainingSeconds <= 0}
              onOpenRecorder={openRecorder}
            />
          </div>
        </div>

        {answer ? (
          <div className="rounded-xl border border-satin bg-surface-raised p-4 text-sm">
            <p className="font-medium text-foreground">{t('practice.recording.submitted')}</p>
            <p className="mt-2 text-muted-foreground">
              {answer.transcript
                ? `${t('practice.answer.transcriptTitle')}: ${answer.transcript}`
                : t('practice.answer.transcriptPending')}
            </p>
          </div>
        ) : null}

        {room.speech.needsManualPlay ? (
          <button type="button" className="btn-secondary self-start" onClick={room.speech.playManual}>
            {t('practice.speech.play')}
          </button>
        ) : null}
      </main>

      <B2cInterviewControls
        micEnabled={room.micEnabled}
        cameraEnabled={room.cameraEnabled}
        onToggleMic={room.toggleMic}
        onToggleCamera={room.toggleCamera}
        onFinish={() => room.setFinishOpen(true)}
        finishLabel={finishLabel}
        finishPrimary={room.interviewComplete}
        disabled={room.phase !== 'answering' || room.isSubmittingSession || room.isTimingOut}
      />

      <QuestionStartCountdown visible={room.phase === 'countdown'} value={room.countdownValue} />

      {room.currentQuestion ? (
        <AudioRecorderModal
          open={recorderOpen}
          onOpenChange={(open) => {
            setRecorderOpen(open);
            if (!open) setModalStatus(null);
          }}
          sessionId={sessionId}
          questionId={room.currentQuestion.id}
          questionContent={room.currentQuestion.content}
          questionLabel={questionLabel}
          maxDurationSeconds={maxDurationSeconds}
          sharedStream={room.media.stream}
          disabled={room.isTimingOut || room.remainingSeconds <= 0}
          onStatusChange={setModalStatus}
          onSubmitRecording={async (file, durationSec) => {
            await room.submitAnswerWithFile(file, durationSec);
          }}
          mapSubmitErrorKey={(error) => mapSubmitPracticeAnswerErrorKey(getApiStatusCode(error))}
        />
      ) : null}

      <B2cPracticeRoomModals
        finishOpen={room.finishOpen}
        isSubmittingSession={room.isSubmittingSession}
        submittedCount={room.submittedCount}
        unansweredCount={room.unansweredCount}
        hasPendingRecording={room.hasPendingRecording}
        onCloseFinish={() => room.setFinishOpen(false)}
        onConfirmFinish={() => void room.confirmFinish()}
        overwriteConfirmOpen={room.overwriteConfirmOpen}
        onCloseOverwrite={() => room.setOverwriteConfirmOpen(false)}
        onConfirmOverwrite={room.confirmOverwriteSubmit}
        retryConfirmOpen={room.retryConfirmOpen}
        onCloseRetry={() => room.setRetryConfirmOpen(false)}
        onConfirmRetry={room.confirmRetryRecording}
      />

      <span className="sr-only">{navigate.length}</span>
    </div>
  );
}
