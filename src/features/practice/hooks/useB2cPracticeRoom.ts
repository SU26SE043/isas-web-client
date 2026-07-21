import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import {
  getPracticeSession,
  submitPracticeAnswer,
  submitPracticeSession,
} from '../services/b2cPracticeSession.service';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { createSilentUnansweredAudioFile } from '../utils/createSilentUnansweredAudioFile';
import { getNextPracticeQuestion } from '../utils/getNextPracticeQuestion';
import { useQuestionSpeech } from './useQuestionSpeech';
import { usePracticeAnswerRecorder } from './usePracticeAnswerRecorder';
import { useInterviewMedia } from './useInterviewMedia';

const TIMEOUT_ADVANCE_DELAY_MS = 1000;

export function useB2cPracticeRoom(sessionId: string) {
  const navigate = useNavigate();
  const store = useB2cPracticeInterviewStore();
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [isTimingOut, setIsTimingOut] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [retryConfirmOpen, setRetryConfirmOpen] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const warned10Ref = useRef(false);
  const timeoutHandledForQuestionRef = useRef<string | null>(null);
  const media = useInterviewMedia(true, true);
  const recorder = usePracticeAnswerRecorder(media.stream);
  const speech = useQuestionSpeech(sessionId || null, store.currentQuestionId);

  const currentQuestion = useMemo(
    () => store.questions.find((q) => q.id === store.currentQuestionId) ?? null,
    [store.currentQuestionId, store.questions],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!sessionId) return;
      if (store.sessionId === sessionId && store.questions.length > 0) {
        store.setStage('interviewing');
        return;
      }
      store.setStage('interviewing');
      try {
        const session = await getPracticeSession(sessionId);
        if (cancelled) return;
        store.hydrateFromSession(session);
      } catch {
        if (!cancelled) store.setStage('error');
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally only on sessionId — avoid re-hydrate loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    void media.startMedia();
    return () => {
      media.stopMedia();
      speech.stopPlayback();
      recorder.stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (store.stage !== 'interviewing' && store.stage !== 'ready_to_finish') return undefined;
    if (isSubmittingAnswer || isSubmittingSession || isTimingOut) return undefined;
    const id = window.setInterval(() => store.tickTimer(), 1000);
    return () => window.clearInterval(id);
  }, [isSubmittingAnswer, isSubmittingSession, isTimingOut, store]);

  useEffect(() => {
    if (store.remainingSeconds === 10 && !warned10Ref.current) {
      warned10Ref.current = true;
      setShowTimerWarning(true);
    }
    if (store.remainingSeconds > 10) {
      warned10Ref.current = false;
      setShowTimerWarning(false);
    }
  }, [store.remainingSeconds]);

  useEffect(() => {
    warned10Ref.current = false;
    timeoutHandledForQuestionRef.current = null;
    setIsTimingOut(false);
    recorder.clearRecording();
    setAnswerError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentQuestionId]);

  useEffect(() => {
    if (store.remainingSeconds !== 0) return;
    if (store.stage !== 'interviewing') return;
    if (isSubmittingAnswer || isSubmittingSession) return;

    const questionId = store.currentQuestionId;
    if (!questionId) return;
    if (store.answersByQuestionId[questionId]) return;
    if (timeoutHandledForQuestionRef.current === questionId) return;

    let cancelled = false;
    timeoutHandledForQuestionRef.current = questionId;
    setIsTimingOut(true);
    setShowTimerWarning(false);
    speech.stopPlayback();
    recorder.stopRecordingAndDiscard();
    store.setQuestionState(questionId, 'unanswered');

    const advanceTimer = window.setTimeout(() => {
      if (cancelled) return;

      void (async () => {
        try {
          // Register an empty answer so session submit is allowed; UI stays unanswered (0 score).
          const response = await submitPracticeAnswer({
            sessionId,
            questionId,
            file: createSilentUnansweredAudioFile(),
            durationSec: 0,
          });
          if (cancelled) return;
          store.setAnswer(questionId, {
            answerId: response.answerId,
            questionId: response.questionId,
            status: response.status,
            transcript: response.transcript,
            nextAction: response.nextAction,
            interviewComplete: response.interviewComplete,
          });
          store.setQuestionState(questionId, 'unanswered');

          if (response.nextQuestion) {
            store.appendQuestion(response.nextQuestion);
            store.setCurrentQuestion(response.nextQuestion.id, response.nextQuestion.timeLimitSec);
            store.setStage('interviewing');
          } else if (response.interviewComplete || response.nextAction === 'end') {
            store.setInterviewComplete(true, response.nextAction ?? 'end');
          } else {
            const nextQuestion = getNextPracticeQuestion(store.questions, questionId);
            if (nextQuestion) {
              store.setCurrentQuestion(nextQuestion.id, nextQuestion.timeLimitSec);
              store.setStage('interviewing');
            } else {
              store.setInterviewComplete(true, 'end');
            }
          }
        } catch {
          if (cancelled) return;
          const nextQuestion = getNextPracticeQuestion(store.questions, questionId);
          if (nextQuestion) {
            store.setCurrentQuestion(nextQuestion.id, nextQuestion.timeLimitSec);
            store.setStage('interviewing');
          } else {
            store.setInterviewComplete(true, 'end');
          }
        } finally {
          if (!cancelled) setIsTimingOut(false);
        }
      })();
    }, TIMEOUT_ADVANCE_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(advanceTimer);
      if (timeoutHandledForQuestionRef.current === questionId) {
        timeoutHandledForQuestionRef.current = null;
      }
    };
    // Do not depend on isTimingOut — setting it would re-run and clear the advance timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSubmittingAnswer,
    isSubmittingSession,
    sessionId,
    store.answersByQuestionId,
    store.currentQuestionId,
    store.questions,
    store.remainingSeconds,
    store.stage,
  ]);

  const canSubmitAnswer =
    Boolean(recorder.audioFile) &&
    recorder.durationSec > 0 &&
    Boolean(currentQuestion) &&
    !isSubmittingAnswer &&
    !isTimingOut &&
    store.remainingSeconds > 0 &&
    store.stage !== 'submitting_session';

  const canReplay =
    store.remainingSeconds > 0 &&
    !isSubmittingAnswer &&
    !isTimingOut &&
    store.stage === 'interviewing';

  const submitAnswer = useCallback(async () => {
    if (!canSubmitAnswer || !currentQuestion || !recorder.audioFile) {
      setAnswerError('practice.errors.audioRequired');
      return;
    }
    setIsSubmittingAnswer(true);
    setAnswerError(null);
    store.setStage('submitting_answer');
    recorder.setUploading();
    try {
      const response = await submitPracticeAnswer({
        sessionId,
        questionId: currentQuestion.id,
        file: recorder.audioFile,
        durationSec: recorder.durationSec,
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

      if (response.nextQuestion) {
        store.appendQuestion(response.nextQuestion);
        store.setCurrentQuestion(response.nextQuestion.id, response.nextQuestion.timeLimitSec);
        store.setStage('interviewing');
        recorder.clearRecording();
      } else if (response.interviewComplete || response.nextAction === 'end') {
        store.setInterviewComplete(true, response.nextAction ?? 'end');
      } else {
        store.setStage('interviewing');
      }
    } catch (error) {
      const status = getApiStatusCode(error);
      if (status === 400) setAnswerError('practice.errors.audioRequired');
      else if (status === 403) setAnswerError('practice.errors.forbidden');
      else if (status === 404) setAnswerError('practice.errors.sessionNotFound');
      else if (status === 409) setAnswerError('practice.errors.conflict');
      else setAnswerError('practice.errors.submitAnswerFailed');
      store.setStage('interviewing');
      store.setQuestionState(currentQuestion.id, 'error');
      recorder.setIdle();
    } finally {
      setIsSubmittingAnswer(false);
    }
  }, [canSubmitAnswer, currentQuestion, recorder, sessionId, store]);

  const confirmFinish = useCallback(async () => {
    setIsSubmittingSession(true);
    store.setStage('submitting_session');
    speech.stopPlayback();
    recorder.stopRecordingAndDiscard();
    try {
      // Backfill silent answers for timed-out questions that never reached the API.
      const unansweredWithoutServerAnswer = store.questions.filter(
        (question) =>
          store.questionStates[question.id] === 'unanswered' &&
          !store.answersByQuestionId[question.id],
      );
      for (const question of unansweredWithoutServerAnswer) {
        try {
          const response = await submitPracticeAnswer({
            sessionId,
            questionId: question.id,
            file: createSilentUnansweredAudioFile(),
            durationSec: 0,
          });
          store.setAnswer(question.id, {
            answerId: response.answerId,
            questionId: response.questionId,
            status: response.status,
            transcript: response.transcript,
            nextAction: response.nextAction,
            interviewComplete: response.interviewComplete,
          });
          store.setQuestionState(question.id, 'unanswered');
        } catch {
          // Continue; submit below will surface a clear error if still no answers.
        }
      }

      const serverAnswerCount = Object.keys(
        useB2cPracticeInterviewStore.getState().answersByQuestionId,
      ).length;
      if (serverAnswerCount === 0) {
        setAnswerError('practice.errors.noAnswers');
        store.setStage(store.interviewComplete ? 'ready_to_finish' : 'interviewing');
        return;
      }

      await submitPracticeSession(sessionId);
      media.stopMedia();
      navigate(`/interview/${sessionId}/complete`, { replace: true });
    } catch (error) {
      const status = getApiStatusCode(error);
      const message = getApiErrorMessage(error, '').toLowerCase();
      if (status === 400) {
        if (
          message.includes('already') ||
          message.includes('submitted') ||
          message.includes('đã submit') ||
          message.includes('da submit')
        ) {
          navigate(`/interview/${sessionId}/complete`, { replace: true });
          return;
        }
        setAnswerError('practice.errors.noAnswers');
      } else if (status === 403) setAnswerError('practice.errors.forbidden');
      else if (status === 404) setAnswerError('practice.errors.sessionNotFound');
      else setAnswerError('practice.errors.submitSessionFailed');
      store.setStage(store.interviewComplete ? 'ready_to_finish' : 'interviewing');
    } finally {
      setIsSubmittingSession(false);
      setFinishOpen(false);
    }
  }, [media, navigate, recorder, sessionId, speech, store]);

  const submittedCount = store.questions.filter(
    (question) => store.questionStates[question.id] === 'submitted',
  ).length;
  const unansweredCount = store.questions.filter(
    (question) => store.questionStates[question.id] === 'unanswered',
  ).length;
  const hasPendingRecording =
    Boolean(recorder.audioFile) && recorder.recordingStatus !== 'submitted';

  return {
    isLoading: store.stage === 'setup' && store.questions.length === 0,
    stage: store.stage,
    questions: store.questions,
    currentQuestion,
    currentIndex: Math.max(
      0,
      store.questions.findIndex((q) => q.id === store.currentQuestionId),
    ),
    remainingSeconds: store.remainingSeconds,
    answersByQuestionId: store.answersByQuestionId,
    questionStates: store.questionStates,
    interviewComplete: store.interviewComplete,
    lastNextAction: store.lastNextAction,
    speechWarning: store.speechWarning,
    media,
    speech,
    recorder,
    isSubmittingAnswer,
    isSubmittingSession,
    isTimingOut,
    answerError,
    showTimerWarning,
    canSubmitAnswer,
    canReplay,
    submitAnswer,
    finishOpen,
    setFinishOpen,
    retryConfirmOpen,
    setRetryConfirmOpen,
    confirmFinish,
    submittedCount,
    unansweredCount,
    hasPendingRecording,
    startRecording: () => {
      if (store.remainingSeconds <= 0 || isTimingOut) return;
      if (store.answersByQuestionId[store.currentQuestionId ?? '']) {
        setRetryConfirmOpen(true);
        return;
      }
      recorder.startRecording();
      if (store.currentQuestionId) {
        store.setQuestionState(store.currentQuestionId, 'recording');
      }
    },
    confirmRetryRecording: () => {
      if (isTimingOut || store.remainingSeconds <= 0) return;
      setRetryConfirmOpen(false);
      recorder.clearRecording();
      recorder.startRecording();
      if (store.currentQuestionId) {
        store.setQuestionState(store.currentQuestionId, 'recording');
      }
    },
  };
}
