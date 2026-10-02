import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { usesMockData } from '@/shared/mock';
import { InterviewHeader } from './InterviewHeader';
import { AIInterviewerPanel } from './AIInterviewerPanel';
import { CandidateCameraPanel } from './CandidateCameraPanel';
import { InterviewQuestionPanel } from './InterviewQuestionPanel';
import { B2cInterviewControls } from './B2cInterviewControls';
import { B2cPracticeRoomDialogs } from './B2cPracticeRoomDialogs';
import { AnswerRecorderCard } from './audio-recorder/AnswerRecorderCard';
import { QuestionStartCountdown } from './QuestionStartCountdown';
import { FullscreenExitBanner } from './room/FullscreenExitBanner';
import { ExamSessionClock } from './room/ExamSessionClock';
import { ExamRoomEntryErrorPanel } from './room/ExamRoomEntryErrorPanel';
import { ExamTimeUpScreen } from './room/ExamTimeUpScreen';
import { SubmittedAnswerNote } from './room/SubmittedAnswerNote';
import { RoomStatusBanners } from './room/RoomStatusBanners';
import { useB2cPracticeRoom } from '../hooks/useB2cPracticeRoom';
import { useB2cRoomCoaching } from '../hooks/useB2cRoomCoaching';
import { useFrozenRecorderDuration } from '../hooks/useFrozenRecorderDuration';
import { mapSubmitPracticeAnswerErrorKey } from '../utils/b2cPracticeSessionErrors';
import type { AudioRecorderStatus } from '../types/audioRecorder.types';
import type { B2cPracticeInterviewRoomProps } from '../types/b2cPracticeRoom.types';
export type { B2cRoomMediaContext } from '../types/b2cPracticeRoom.types';
// ATT1-F5: hết giờ cả buổi ⇒ thẻ ghi âm dừng + nộp đoạn đang có (đang ghi / đã ghi chưa nộp / đang xin quyền mic).
const FINAL_FLUSH_STATUSES: ReadonlySet<AudioRecorderStatus> = new Set(['recording', 'recorded', 'requesting-permission']);
export function B2cPracticeInterviewRoom({ sessionId, completePath, startWithCountdown, countdownReady, deadlineAt, beginOnEnter = false, onSessionBegun, onExamClockChange, onExamTimeUp, onEntryError, examTimeUpBackPath, violationPaused = false, cameraAlwaysOn = false, allowEarlyFinish = false, onMediaContextChange, onPhaseChange, onSessionSubmitting, onAnswerUploadStateChange }: B2cPracticeInterviewRoomProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [autoSubmitRequestId, setAutoSubmitRequestId] = useState(0);
  const [recorderResetRequestId, setRecorderResetRequestId] = useState(0);
  const [recorderStatus, setRecorderStatus] = useState<AudioRecorderStatus>('idle');
  const [fullscreenBlocked, setFullscreenBlocked] = useState(false);
  const requestAutoSubmit = useCallback(() => setAutoSubmitRequestId((value) => value + 1), []);
  const recorderStatusRef = useRef(recorderStatus);
  recorderStatusRef.current = recorderStatus;
  const requestFinalRecording = useCallback(() => {
    if (!FINAL_FLUSH_STATUSES.has(recorderStatusRef.current)) return false;
    setAutoSubmitRequestId((value) => value + 1);
    return true;
  }, []);
  const room = useB2cPracticeRoom(sessionId, {
    completePath,
    startWithCountdown,
    countdownReady,
    deadlineAt,
    beginOnEnter,
    onSessionBegun,
    violationPaused: violationPaused || fullscreenBlocked,
    onAutoSubmitRequest: requestAutoSubmit,
    onExamTimeUp,
    requestFinalRecording,
  });
  const coaching = useB2cRoomCoaching({
    sessionId,
    phase: room.phase,
    videoRef: room.media.videoRef,
    uploadInFlight: room.isSubmittingAnswer,
    completed: room.interviewComplete,
  });
  const interviewCompleteToastRef = useRef(false);
  const mockSubmitCountRef = useRef(0);
  useEffect(() => {
    if (room.interviewComplete && !interviewCompleteToastRef.current) {
      interviewCompleteToastRef.current = true;
      toast.success(t('practice.finish.aiComplete'), { duration: 6000 });
    }
  }, [room.confirmFinish, room.interviewComplete, t]);
  useEffect(() => {
    onMediaContextChange?.({
      state: room.media.state,
      stream: room.media.stream,
      restart: room.media.startMedia,
    });
  }, [onMediaContextChange, room.media.startMedia, room.media.state, room.media.stream]);
  useEffect(() => { onPhaseChange?.(room.phase); }, [onPhaseChange, room.phase]);
  useEffect(() => { if (room.isSubmittingSession) onSessionSubmitting?.(); }, [onSessionSubmitting, room.isSubmittingSession]);
  useEffect(() => { onAnswerUploadStateChange?.(room.isSubmittingAnswer); }, [onAnswerUploadStateChange, room.isSubmittingAnswer]);
  const examClockRunning = room.examClock != null;
  useEffect(() => { onExamClockChange?.(examClockRunning); }, [examClockRunning, onExamClockChange]);
  useEffect(() => { if (room.entryError) onEntryError?.(room.entryError); }, [onEntryError, room.entryError]);
  const recorderMaxDuration = useFrozenRecorderDuration(
    room.currentQuestion?.id ?? null,
    room.remainingSeconds,
    room.currentQuestion?.timeLimitSec,
  );
  if (room.entryError) return <ExamRoomEntryErrorPanel reason={room.entryError} backPath={completePath ?? '/practice'} />;
  if (room.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.room.loading')}</span>
      </div>
    );
  }
  const speechStatus = room.speech.isLoadingSpeech
    ? t('practice.speech.loading')
    : room.speech.isPlaying
    ? t('practice.speech.aiSpeaking')
    : room.speech.needsManualPlay
      ? null
      : t('practice.speech.readyToAnswer');
  const nextActionLabel = room.lastNextAction ? t(`practice.nextAction.${room.lastNextAction}`) : null;
  const finishLabel = room.interviewComplete ? t('practice.finish.complete') : t('practice.finish.action');
  const answer = room.currentQuestion ? room.answersByQuestionId[room.currentQuestion.id] : undefined;
  const timeUp = room.examTimeUp != null;
  return (
    <>
      <div className="relative flex min-h-screen flex-col surface-base pb-32 font-sans" inert={timeUp} aria-hidden={timeUp || undefined}>
        <InterviewHeader
          sessionId={sessionId}
          isRecording={recorderStatus === 'recording'}
          onExit={() => room.setFinishOpen(true)}
          examClock={room.examClock ? <ExamSessionClock remainingSeconds={room.examClock.remainingSeconds} /> : null}
        />
        {timeUp ? null : <FullscreenExitBanner onBlockingChange={setFullscreenBlocked} />}
        <RoomStatusBanners
          mediaError={room.media.state === 'error'}
          onRetryMedia={() => void room.media.startMedia()}
          speechWarning={room.speechWarning}
          answerError={room.answerError}
          examRemainingSeconds={room.examClock?.remainingSeconds ?? null}
        />
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
              {room.currentQuestion ? (
                <AnswerRecorderCard
                  sessionId={sessionId}
                  questionId={room.currentQuestion.id}
                  maxDurationSeconds={recorderMaxDuration}
                  sharedStream={room.media.stream}
                  autoSubmitRequestId={autoSubmitRequestId}
                  resetRequestId={recorderResetRequestId}
                  disabled={violationPaused || fullscreenBlocked || room.speech.isBusy || room.phase !== 'answering' || room.isSubmittingSession || room.isTimingOut || room.remainingSeconds <= 0}
                  paused={room.isTimingOut}
                  onStatusChange={setRecorderStatus}
                  onSubmitRecording={(file, durationSec) => room.submitAnswerWithFile(file, durationSec)}
                  onAutoSubmitRecording={(file, durationSec) =>
                    room.submitAnswerWithFile(file, durationSec, { allowDuringTimeout: true })
                  }
                  onAutoSubmitEmpty={room.submitEmptyAnswer}
                  onAutoSubmitEmptyResult={room.handleAutoSubmitEmptyResult}
                  mapSubmitErrorKey={mapSubmitPracticeAnswerErrorKey}
                />
              ) : null}
            </div>
          </div>

          {answer ? <SubmittedAnswerNote transcript={answer.transcript} /> : null}

          {room.speech.needsManualPlay ? (
            <button type="button" className="btn-secondary self-start" disabled={violationPaused || fullscreenBlocked || room.speech.isBusy} onClick={room.speech.playManual}>
              {t('practice.speech.play')}
            </button>
          ) : null}
        </main>
        <B2cInterviewControls
          micEnabled={room.micEnabled}
          cameraEnabled={room.cameraEnabled}
          cameraAlwaysOn={cameraAlwaysOn || coaching.cameraAlwaysOn}
          onToggleMic={room.toggleMic}
          onToggleCamera={room.toggleCamera}
          onFinish={() => room.setFinishOpen(true)}
          onSubmitAnswer={usesMockData('practice') ? async () => {
            const file = new File([new Uint8Array([0])], 'e2e-answer.webm', { type: 'audio/webm' });
            mockSubmitCountRef.current += 1;
            if (mockSubmitCountRef.current >= room.questions.length) {
              // Wait for the mock session to settle before changing routes. A
              // fire-and-forget submit raced WebKit's route render and could
              // leave the room mounted at /complete.
              await room.confirmFinish();
              navigate(`/interview/${sessionId}/complete`, { replace: true });
              return;
            }
            await room.submitAnswerWithFile(file, 1);
          } : undefined}
          finishLabel={finishLabel}
          finishPrimary={room.interviewComplete}
          allowEarlyFinish={allowEarlyFinish}
          finishDisabled={
            allowEarlyFinish ? (violationPaused || fullscreenBlocked || !room.canFinishEarly) : undefined
          }
          disabled={violationPaused || fullscreenBlocked || room.speech.isBusy || (usesMockData('practice') ? false : room.phase !== 'answering' || room.isSubmittingSession || room.isTimingOut)}
        />

        <QuestionStartCountdown visible={room.phase === 'countdown'} value={room.countdownValue} />
        <B2cPracticeRoomDialogs
          room={room}
          hasPendingRecording={recorderStatus !== 'idle' && recorderStatus !== 'error'}
          onConfirmFinish={() => {
            setRecorderResetRequestId((value) => value + 1);
            void room.confirmFinish();
          }}
          earlyFinish={allowEarlyFinish}
        />

        <span className="sr-only">{navigate.length}</span>
      </div>
      {room.examTimeUp ? (
        <ExamTimeUpScreen
          status={room.examTimeUp}
          answered={room.mainQuestionsAnswered.answered}
          total={room.mainQuestionsAnswered.total}
          onBack={() => navigate(examTimeUpBackPath ?? completePath ?? '/candidate/campaigns', { replace: true })}
        />
      ) : null}
    </>
  );
}
