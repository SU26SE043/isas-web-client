import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { InterviewHeader } from './InterviewHeader';
import { AIInterviewerPanel } from './AIInterviewerPanel';
import { CandidateCameraPanel } from './CandidateCameraPanel';
import { InterviewQuestionPanel } from './InterviewQuestionPanel';
import { B2cInterviewControls } from './B2cInterviewControls';
import { useB2cPracticeRoom } from '../hooks/useB2cPracticeRoom';
import { useState } from 'react';

interface B2cPracticeInterviewRoomProps {
  sessionId: string;
}

export function B2cPracticeInterviewRoom({ sessionId }: B2cPracticeInterviewRoomProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const room = useB2cPracticeRoom(sessionId);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

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

  const submitLabel = room.isSubmittingAnswer
    ? t('practice.recording.submitting')
    : t('practice.recording.submit');

  const finishLabel = room.interviewComplete
    ? t('practice.finish.complete')
    : t('practice.finish.action');

  const answer = room.currentQuestion
    ? room.answersByQuestionId[room.currentQuestion.id]
    : undefined;

  return (
    <div className="flex min-h-screen flex-col surface-base pb-32 font-sans">
      <InterviewHeader sessionId={sessionId} isRecording={room.recorder.recordingStatus === 'recording'} />

      {room.speechWarning ? (
        <div role="status" className="border-b border-warning/30 bg-warning/10 px-6 py-2 text-sm text-warning">
          {t(room.speechWarning)}
        </div>
      ) : null}
      {room.answerError ? (
        <div role="alert" className="border-b border-error/30 bg-error/10 px-6 py-2 text-sm text-error">
          {t(room.answerError)}
          {room.answerError === 'practice.errors.submitAnswerFailed' ? (
            <button type="button" className="ml-3 underline" onClick={() => void room.submitAnswer()}>
              {t('practice.recording.retrySubmit')}
            </button>
          ) : null}
        </div>
      ) : null}
      {room.recorder.errorKey ? (
        <div role="alert" className="border-b border-error/30 bg-error/10 px-6 py-2 text-sm text-error">
          {t(room.recorder.errorKey)}
        </div>
      ) : null}
      {room.interviewComplete ? (
        <div role="status" className="border-b border-satin bg-surface-raised px-6 py-2 text-sm text-foreground">
          {t('practice.finish.aiComplete')}
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
              micEnabled={micEnabled}
              cameraEnabled={cameraEnabled}
            />
          </div>
        </div>

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
        micEnabled={micEnabled}
        cameraEnabled={cameraEnabled}
        onToggleMic={() => {
          const next = !micEnabled;
          setMicEnabled(next);
          room.media.stream?.getAudioTracks().forEach((track) => {
            track.enabled = next;
          });
        }}
        onToggleCamera={() => {
          const next = !cameraEnabled;
          setCameraEnabled(next);
          room.media.stream?.getVideoTracks().forEach((track) => {
            track.enabled = next;
          });
        }}
        recordingStatus={room.recorder.recordingStatus}
        onStartRecording={room.startRecording}
        onStopRecording={room.recorder.stopRecording}
        onReplay={() => void room.speech.replay()}
        replayDisabled={!room.canReplay || room.isSubmittingAnswer}
        replaying={room.speech.isPlaying}
        onSubmit={() => void room.submitAnswer()}
        submitDisabled={!room.canSubmitAnswer}
        submitLabel={submitLabel}
        onFinish={() => room.setFinishOpen(true)}
        finishLabel={finishLabel}
        finishPrimary={room.interviewComplete}
        disabled={room.isSubmittingSession || room.isTimingOut}
      />

      {room.finishOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-2xl border border-satin bg-surface-raised p-6">
            <h2 className="text-lg font-semibold text-foreground">{t('practice.finish.confirmTitle')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('practice.finish.confirmDescription')}</p>
            <ul className="mt-4 space-y-1 text-sm text-foreground">
              <li>{t('practice.finish.submittedCount').replace('{count}', String(room.submittedCount))}</li>
              <li>{t('practice.finish.unansweredCount').replace('{count}', String(room.unansweredCount))}</li>
              {room.hasPendingRecording ? <li>{t('practice.finish.pendingRecording')}</li> : null}
            </ul>
            {room.isSubmittingSession ? (
              <p className="mt-4 flex items-center gap-2 text-sm" aria-live="polite">
                <Loader2 className="size-4 animate-spin" />
                {t('practice.finish.submitting')}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                disabled={room.isSubmittingSession}
                onClick={() => room.setFinishOpen(false)}
              >
                {t('practice.finish.continue')}
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={room.isSubmittingSession}
                onClick={() => void room.confirmFinish()}
              >
                {t('practice.finish.confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {room.retryConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-2xl border border-satin bg-surface-raised p-6">
            <p className="text-sm text-foreground">{t('practice.recording.retryConfirm')}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => room.setRetryConfirmOpen(false)}>
                {t('practice.finish.continue')}
              </button>
              <button type="button" className="btn-primary" onClick={room.confirmRetryRecording}>
                {t('practice.recording.retry')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Keep navigate available for header exit flows if needed later */}
      <span className="sr-only">{navigate.length}</span>
    </div>
  );
}
