import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { InterviewHeader } from './InterviewHeader';
import { AIInterviewerPanel } from './AIInterviewerPanel';
import { CandidateCameraPanel } from './CandidateCameraPanel';
import { InterviewQuestionPanel } from './InterviewQuestionPanel';
import { B2cInterviewControls } from './B2cInterviewControls';
import { PracticeAnswerPreview } from './PracticeAnswerPreview';
import { B2cPracticeRoomModals } from './B2cPracticeRoomModals';
import { useB2cPracticeRoom } from '../hooks/useB2cPracticeRoom';
import { useAnswerPlayback } from '../hooks/useAnswerPlayback';
import { useState } from 'react';

interface B2cPracticeInterviewRoomProps {
  sessionId: string;
}

export function B2cPracticeInterviewRoom({ sessionId }: B2cPracticeInterviewRoomProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const room = useB2cPracticeRoom(sessionId);
  const answerPlayback = useAnswerPlayback(room.recorder.audioFile);
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

  const canRetrySubmit =
    Boolean(room.recorder.audioFile) &&
    room.recorder.recordingStatus !== 'uploading' &&
    room.recorder.recordingStatus !== 'submitted';

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
          {canRetrySubmit ? (
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

        {room.recorder.audioFile &&
        (room.recorder.recordingStatus === 'stopped' || room.recorder.recordingStatus === 'uploading') ? (
          <PracticeAnswerPreview
            durationSec={room.recorder.durationSec}
            recordingStatus={room.recorder.recordingStatus}
            isPlaying={answerPlayback.isPlaying}
            onPlay={() => void answerPlayback.play()}
            disabled={room.isSubmittingAnswer || room.isTimingOut}
          />
        ) : null}

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
