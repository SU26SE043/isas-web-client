import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitPracticeSession } from '../services/b2cPracticeSession.service';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { mapSubmitPracticeAnswerErrorKey } from '../utils/b2cPracticeSessionErrors';
import { getNextPracticeQuestion } from '../utils/getNextPracticeQuestion';
import { createSilentUnansweredAudioFile } from '../utils/createSilentUnansweredAudioFile';
import { getPracticeApiErrorCode } from '../utils/practiceApiErrorCode';
import { submitAnswerWithBeginRetry } from './submitAnswerWithBeginRetry';
import type { usePracticeAnswerRecorder } from './usePracticeAnswerRecorder';

type Recorder = ReturnType<typeof usePracticeAnswerRecorder>;

interface UseB2cPracticeAnswerSubmitOptions {
  sessionId: string;
  recorder: Recorder;
  currentQuestionId: string | null;
  currentQuestion: { id: string } | null;
  remainingSeconds: number;
  stage: string;
  isTimingOut: boolean;
  answersByQuestionId: Record<string, unknown>;
  onStopSpeech: () => void;
  onStopMedia: () => void;
  completePath?: string;
  /**
   * ATT1-F5 — đồng hồ cả buổi đã về 0 (hoặc server báo SESSION_TIME_UP): câu vừa lưu KHÔNG được chuyển câu,
   * KHÔNG tự nộp bài ở đây (luồng hết giờ tự nộp đúng 1 lần). Chặn nộp câu trống nằm ở phòng (`useB2cPracticeRoom`).
   */
  isExamTimeUp?: () => boolean;
  /** ATT1 [I3] — upload bị 409 SESSION_TIME_UP ⇒ báo phòng vào luồng hết giờ (bỏ câu đó, nộp bài). */
  onSessionTimeUp?: () => void;
  /** Nộp bài (dùng chung với phòng để không bao giờ gửi submit 2 lần song song). */
  submitSession?: () => Promise<void>;
}

interface SubmitAnswerOptions {
  allowDuringTimeout?: boolean;
}

export function useB2cPracticeAnswerSubmit({
  sessionId,
  recorder,
  currentQuestion,
  remainingSeconds,
  stage,
  isTimingOut,
  answersByQuestionId,
  onStopSpeech,
  onStopMedia,
  completePath,
  isExamTimeUp,
  onSessionTimeUp,
  submitSession,
}: UseB2cPracticeAnswerSubmitOptions) {
  const navigate = useNavigate();
  const store = useB2cPracticeInterviewStore();
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const pendingOverrideRef = useRef<{ file: File; durationSec: number } | null>(null);
  const inFlightRef = useRef(false);
  // Lời hứa "upload đang bay đã xong" (thành công hay lỗi) — luồng hết giờ chờ nó trước khi nộp bài.
  const inFlightDoneRef = useRef<Promise<void> | null>(null);
  // `store` and `recorder` are fresh object references every render (Zustand
  // returns a new object on any store write anywhere; the recorder hook
  // returns new inline callbacks each render). Reading them via refs instead
  // of putting them in useCallback deps keeps submit* function identities
  // stable across unrelated store/recorder churn — callers (e.g. the
  // question-timeout effect in useB2cPracticeRoom) depend on that stability.
  const storeRef = useRef(store);
  storeRef.current = store;
  const recorderRef = useRef(recorder);
  recorderRef.current = recorder;
  const onStopSpeechRef = useRef(onStopSpeech);
  onStopSpeechRef.current = onStopSpeech;
  const onStopMediaRef = useRef(onStopMedia);
  onStopMediaRef.current = onStopMedia;
  const isExamTimeUpRef = useRef(isExamTimeUp);
  isExamTimeUpRef.current = isExamTimeUp;
  const onSessionTimeUpRef = useRef(onSessionTimeUp);
  onSessionTimeUpRef.current = onSessionTimeUp;
  const submitSessionRef = useRef(submitSession);
  submitSessionRef.current = submitSession;
  const examTimeUp = useCallback(() => isExamTimeUpRef.current?.() === true, []);

  const canSubmitAnswer =
    Boolean(recorder.audioFile) &&
    recorder.durationSec > 0 &&
    Boolean(currentQuestion) &&
    !isSubmittingAnswer &&
    !isTimingOut &&
    remainingSeconds > 0 &&
    stage !== 'submitting_session' &&
    recorder.recordingStatus !== 'uploading';

  const performSubmit = useCallback(async (override?: { file: File; durationSec: number }) => {
    const store = storeRef.current;
    const recorder = recorderRef.current;
    const file = override?.file ?? recorder.audioFile;
    const durationSec = override?.durationSec ?? recorder.durationSec;
    if (!currentQuestion || !file) {
      setAnswerError('practice.errors.audioRequired');
      throw new Error('audio-required');
    }
    if (inFlightRef.current) throw new Error('submit-in-flight');
    inFlightRef.current = true;
    let markDone!: () => void;
    inFlightDoneRef.current = new Promise<void>((resolve) => { markDone = resolve; });
    setIsSubmittingAnswer(true);
    setAnswerError(null);
    store.setStage('submitting_answer');
    recorder.setUploading();
    try {
      const response = await submitAnswerWithBeginRetry({
        sessionId,
        questionId: currentQuestion.id,
        file,
        durationSec,
      });
      store.setAnswer(currentQuestion.id, {
        answerId: response.answerId,
        questionId: response.questionId,
        status: response.status,
        transcript: response.transcript,
        nextAction: response.nextAction,
        interviewComplete: response.interviewComplete,
      });
      recorder.setSubmitted();
      // Stop the previous question's narration the instant we know we're
      // moving on, regardless of which branch below runs — previously this
      // only happened on the interviewComplete branch, leaving old audio
      // playing (and racing new-question TTS) on the normal advance path.
      onStopSpeechRef.current();
      // Hết giờ cả buổi: câu này đã lưu — dừng ở đây (không chuyển câu, không tự nộp bài).
      if (examTimeUp()) return;

      if (response.nextQuestion) {
        store.appendQuestion(response.nextQuestion);
        store.setCurrentQuestion(response.nextQuestion.id, response.nextQuestion.timeLimitSec);
        store.setStage('interviewing');
        recorder.clearRecording();
      } else if (response.interviewComplete) {
        store.setInterviewComplete(true, response.nextAction ?? 'end');
        recorder.stopRecordingAndDiscard();
        try {
          await (submitSessionRef.current ?? (() => submitPracticeSession(sessionId)))();
          // Hết giờ ập tới khi đang nộp: màn hết giờ đã hiện "Đã nộp bài" — không rời phòng.
          if (examTimeUp()) return;
          onStopMediaRef.current();
          navigate(completePath ?? `/interview/${sessionId}/complete`, { replace: true });
        } catch {
          store.setStage('ready_to_finish');
        }
      } else {
        // AI may degrade and return no nextQuestion. Continue with the next
        // original question instead of leaving the submitted question active.
        const nextQuestion = getNextPracticeQuestion(store.questions, currentQuestion.id);
        if (nextQuestion) {
          store.setCurrentQuestion(nextQuestion.id, nextQuestion.timeLimitSec);
        }
        store.setStage('interviewing');
      }
    } catch (error) {
      setAnswerError(mapSubmitPracticeAnswerErrorKey(error));
      if (getPracticeApiErrorCode(error) === 'SESSION_TIME_UP') onSessionTimeUpRef.current?.();
      store.setStage('interviewing');
      store.setQuestionState(currentQuestion.id, 'error');
      recorder.setStopped();
      throw error;
    } finally {
      inFlightRef.current = false;
      inFlightDoneRef.current = null;
      markDone();
      setIsSubmittingAnswer(false);
      setOverwriteConfirmOpen(false);
    }
  }, [completePath, currentQuestion, examTimeUp, navigate, sessionId]);

  const submitAnswer = useCallback(async () => {
    if (!canSubmitAnswer) {
      setAnswerError('practice.errors.audioRequired');
      return;
    }
    if (!currentQuestion) return;

    const prior = answersByQuestionId[currentQuestion.id];
    if (prior) {
      setOverwriteConfirmOpen(true);
      return;
    }
    try {
      await performSubmit();
    } catch {
      // Error surfaced via answerError
    }
  }, [answersByQuestionId, canSubmitAnswer, currentQuestion, performSubmit]);

  const submitAnswerWithFile = useCallback(
    async (file: File, durationSec: number, options?: SubmitAnswerOptions) => {
      if (!currentQuestion) {
        setAnswerError('practice.errors.audioRequired');
        throw new Error('missing-question');
      }
      if (
        inFlightRef.current ||
        (!options?.allowDuringTimeout && (isTimingOut || remainingSeconds <= 0))
      ) {
        throw new Error('submit-blocked');
      }
      // Modal retake + submit is an intentional overwrite of any prior answer.
      await performSubmit({ file, durationSec });
    },
    [currentQuestion, isSubmittingAnswer, isTimingOut, performSubmit, remainingSeconds],
  );

  const submitEmptyAnswer = useCallback(async () => {
    if (!currentQuestion || inFlightRef.current || recorderRef.current.audioFile) return false;
    await performSubmit({
      file: createSilentUnansweredAudioFile(),
      durationSec: 0,
    });
    storeRef.current.setQuestionState(currentQuestion.id, 'unanswered');
    return true;
  }, [currentQuestion, performSubmit]);

  const confirmOverwriteSubmit = useCallback(() => {
    const pending = pendingOverrideRef.current;
    pendingOverrideRef.current = null;
    void performSubmit(pending ?? undefined).catch(() => undefined);
  }, [performSubmit]);

  const isSubmitInFlight = useCallback(() => inFlightRef.current, []);
  /** Upload đang bay ⇒ lời hứa xong (không bao giờ reject); không có ⇒ `null`. */
  const waitForInFlight = useCallback(() => inFlightDoneRef.current, []);

  return {
    isSubmittingAnswer,
    answerError,
    setAnswerError,
    canSubmitAnswer,
    submitAnswer,
    submitAnswerWithFile,
    submitEmptyAnswer,
    overwriteConfirmOpen,
    setOverwriteConfirmOpen,
    confirmOverwriteSubmit,
    isSubmitInFlight,
    waitForInFlight,
  };
}
