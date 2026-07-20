import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiStatusCode } from '@/shared/api/apiError';
import {
  getPracticeSession,
  submitPracticeAnswer,
  submitPracticeSession,
} from '../services/b2cPracticeSession.service';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { useQuestionSpeech } from './useQuestionSpeech';
import { usePracticeAnswerRecorder } from './usePracticeAnswerRecorder';
import { useInterviewMedia } from './useInterviewMedia';

export function useB2cPracticeRoom(sessionId: string) {
  const navigate = useNavigate();
  const store = useB2cPracticeInterviewStore();
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [retryConfirmOpen, setRetryConfirmOpen] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const warned10Ref = useRef(false);
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
    if (isSubmittingAnswer || isSubmittingSession) return undefined;
    const id = window.setInterval(() => store.tickTimer(), 1000);
    return () => window.clearInterval(id);
  }, [isSubmittingAnswer, isSubmittingSession, store]);

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
    if (store.remainingSeconds !== 0) return;
    if (recorder.recordingStatus === 'recording') {
      recorder.stopRecording();
    }
  }, [recorder, store.remainingSeconds]);

  useEffect(() => {
    warned10Ref.current = false;
    recorder.clearRecording();
    setAnswerError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentQuestionId]);

  const canSubmitAnswer =
    Boolean(recorder.audioFile) &&
    recorder.durationSec > 0 &&
    Boolean(currentQuestion) &&
    !isSubmittingAnswer &&
    store.remainingSeconds >= 0 &&
    store.stage !== 'submitting_session';

  const canReplay =
    store.remainingSeconds > 0 && !isSubmittingAnswer && store.stage === 'interviewing';

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
    recorder.stopRecording();
    try {
      await submitPracticeSession(sessionId);
      media.stopMedia();
      navigate(`/interview/${sessionId}/complete`, { replace: true });
    } catch (error) {
      const status = getApiStatusCode(error);
      if (status === 400) {
        // Already submitted → go scoring
        const message = String((error as { message?: string })?.message ?? '');
        if (message.toLowerCase().includes('already') || message.toLowerCase().includes('submitted')) {
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

  const submittedCount = Object.keys(store.answersByQuestionId).length;
  const unansweredCount = Math.max(0, store.questions.length - submittedCount);
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
      if (store.remainingSeconds <= 0) return;
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
      setRetryConfirmOpen(false);
      recorder.clearRecording();
      recorder.startRecording();
      if (store.currentQuestionId) {
        store.setQuestionState(store.currentQuestionId, 'recording');
      }
    },
  };
}
