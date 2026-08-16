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
import { useB2cPracticeAnswerSubmit } from './useB2cPracticeAnswerSubmit';
import { useQuestionSpeech } from './useQuestionSpeech';
import { usePracticeAnswerRecorder } from './usePracticeAnswerRecorder';
import { useInterviewMedia } from './useInterviewMedia';
import { readCampaignInterviewSession } from '@/features/campaigns/utils/campaignInterviewSession';

// Brief enough to let the "time's up" state paint before the auto-submit
// request fires, but short enough not to add a needless extra second on top
// of the real submit latency.
const TIMEOUT_ADVANCE_DELAY_MS = 150;
const COUNTDOWN_STEP_MS = 1000;
const COUNTDOWN_START_HOLD_MS = 800;

export type InterviewPhase = 'loading' | 'reading' | 'countdown' | 'answering' | 'submitting';
type CountdownValue = number | 'START' | null;

export function useB2cPracticeRoom(
  sessionId: string,
  options?: {
    completePath?: string;
    startWithCountdown?: boolean;
    countdownReady?: boolean;
    deadlineAt?: string | null;
    violationPaused?: boolean;
    answerRecorderOpen?: boolean;
    onAutoSubmitRequest?: () => void;
  },
) {
  const navigate = useNavigate();
  const completePath = options?.completePath;
  const store = useB2cPracticeInterviewStore();
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [isTimingOut, setIsTimingOut] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [retryConfirmOpen, setRetryConfirmOpen] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [phase, setPhase] = useState<InterviewPhase>('loading');
  const [countdownValue, setCountdownValue] = useState<CountdownValue>(null);
  const [initialCountdownComplete, setInitialCountdownComplete] = useState(
    !options?.startWithCountdown,
  );
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [serverRemainingSeconds, setServerRemainingSeconds] = useState<number | null>(null);
  const warned10Ref = useRef(false);
  const timeoutHandledForQuestionRef = useRef<string | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const countdownTimeoutRef = useRef<number | null>(null);
  const countdownQuestionRef = useRef<string | null>(null);
  const violationPausedRef = useRef(Boolean(options?.violationPaused));
  violationPausedRef.current = Boolean(options?.violationPaused);
  const media = useInterviewMedia(micEnabled, cameraEnabled);
  const recorder = usePracticeAnswerRecorder(media.stream);
  const sessionReady = store.sessionId === sessionId && store.questions.length > 0;

  const clearQuestionCountdown = useCallback(() => {
    if (countdownIntervalRef.current != null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (countdownTimeoutRef.current != null) {
      window.clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
    countdownQuestionRef.current = null;
    setCountdownValue(null);
  }, []);

  const startQuestionCountdown = useCallback((questionId: string) => {
    if (media.state !== 'ready' || countdownIntervalRef.current != null) return;
    if (questionId !== useB2cPracticeInterviewStore.getState().currentQuestionId) return;

    clearQuestionCountdown();
    countdownQuestionRef.current = questionId;
    setPhase('countdown');
    setCountdownValue(3);
    let current = 3;
    countdownIntervalRef.current = window.setInterval(() => {
      if (violationPausedRef.current) return;
      current -= 1;
      if (current > 0) {
        setCountdownValue(current);
        return;
      }

      if (countdownIntervalRef.current != null) {
        window.clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdownValue('START');
      countdownTimeoutRef.current = window.setTimeout(() => {
        countdownTimeoutRef.current = null;
        if (countdownQuestionRef.current !== useB2cPracticeInterviewStore.getState().currentQuestionId) return;
        setCountdownValue(null);
        // Answerable as soon as the countdown ends: no longer wait for the AI
        // narration to finish playing. Actual answer capture happens in the
        // AudioRecorderModal (useAudioRecorder), which opens its own
        // MediaRecorder on demand — do not also start `recorder`
        // (usePracticeAnswerRecorder) here.
        setInitialCountdownComplete(true);
        setPhase('answering');
        useB2cPracticeInterviewStore.getState().setQuestionState(questionId, 'recording');
      }, COUNTDOWN_START_HOLD_MS);
    }, COUNTDOWN_STEP_MS);
  }, [clearQuestionCountdown, media.state]);

  // Narration is now purely supplementary: it plays in the background and no
  // longer gates `phase`, so candidates can answer as soon as the question
  // text is on screen instead of waiting for the AI voice to load and finish.
  const speech = useQuestionSpeech(sessionId || null, store.currentQuestionId, {
    enabled: media.state === 'ready' && initialCountdownComplete && sessionReady,
  });

  const currentQuestion = useMemo(
    () => store.questions.find((q) => q.id === store.currentQuestionId) ?? null,
    [store.currentQuestionId, store.questions],
  );

  useEffect(() => {
    if (!options?.deadlineAt) {
      setServerRemainingSeconds(null);
      return;
    }
    const deadlineMs = new Date(options.deadlineAt).getTime();
    if (!Number.isFinite(deadlineMs)) {
      setServerRemainingSeconds(null);
      return;
    }
    const update = () => {
      if (violationPausedRef.current) return;
      setServerRemainingSeconds(Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [options?.deadlineAt]);

  const effectiveRemainingSeconds =
    serverRemainingSeconds == null
      ? store.remainingSeconds
      : Math.min(store.remainingSeconds, serverRemainingSeconds);

  const answerSubmit = useB2cPracticeAnswerSubmit({
    sessionId,
    recorder,
    currentQuestionId: store.currentQuestionId,
    currentQuestion,
    remainingSeconds: effectiveRemainingSeconds,
    stage: store.stage,
    isTimingOut,
    answersByQuestionId: store.answersByQuestionId,
    onStopSpeech: () => speech.stopPlayback(),
    onStopMedia: () => media.stopMedia(),
    completePath,
  });

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
        const campaignSession = readCampaignInterviewSession(sessionId);
        if (campaignSession) {
          store.hydrateFromSession({
            id: sessionId,
            status: 'InProgress',
            questions: campaignSession.questions.map((question) => ({
              ...question,
              kind: 'question',
            })),
            answers: [],
            result: null,
          });
          return;
        }
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
    if (options?.violationPaused) {
      speech.pausePlayback();
      recorder.pauseRecording();
      return;
    }
    void speech.resumePlayback();
    recorder.resumeRecording();
  }, [
    options?.violationPaused,
    recorder.pauseRecording,
    recorder.resumeRecording,
    speech.pausePlayback,
    speech.resumePlayback,
  ]);

  useEffect(() => {
    if (store.stage !== 'interviewing' && store.stage !== 'ready_to_finish') return undefined;
    if (options?.violationPaused || phase !== 'answering' || answerSubmit.isSubmittingAnswer || isSubmittingSession || isTimingOut) return undefined;
    const id = window.setInterval(() => store.tickTimer(), 1000);
    return () => window.clearInterval(id);
  }, [answerSubmit.isSubmittingAnswer, isSubmittingSession, isTimingOut, options?.violationPaused, phase, store]);

  useEffect(() => {
    if (effectiveRemainingSeconds === 10 && !warned10Ref.current) {
      warned10Ref.current = true;
      setShowTimerWarning(true);
    }
    if (effectiveRemainingSeconds > 10) {
      warned10Ref.current = false;
      setShowTimerWarning(false);
    }
  }, [effectiveRemainingSeconds]);

  useEffect(() => {
    clearQuestionCountdown();
    const ready = media.state === 'ready' && (!options?.startWithCountdown || options.countdownReady !== false);
    // The very first question still goes through the 3-2-1 countdown (started by
    // the effect below); everything after that is answerable the moment the
    // question text is set, without waiting for the AI narration to play.
    const pendingInitialCountdown = Boolean(options?.startWithCountdown) && !initialCountdownComplete;
    setPhase(ready ? (pendingInitialCountdown ? 'loading' : 'answering') : 'loading');
    if (ready && !pendingInitialCountdown && store.currentQuestionId) {
      store.setQuestionState(store.currentQuestionId, 'recording');
    }
    warned10Ref.current = false;
    timeoutHandledForQuestionRef.current = null;
    setIsTimingOut(false);
    recorder.clearRecording();
    answerSubmit.setAnswerError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearQuestionCountdown, media.state, options?.countdownReady, options?.startWithCountdown, store.currentQuestionId]);

  useEffect(() => {
    if (initialCountdownComplete || !options?.startWithCountdown) return;
    if (!sessionReady || media.state !== 'ready' || !store.currentQuestionId || options.countdownReady === false) return;
    startQuestionCountdown(store.currentQuestionId);
  }, [initialCountdownComplete, media.state, options?.countdownReady, options?.startWithCountdown, sessionReady, startQuestionCountdown, store.currentQuestionId]);

  useEffect(() => () => clearQuestionCountdown(), [clearQuestionCountdown]);

  useEffect(() => {
    if (options?.violationPaused || phase !== 'answering') return undefined;
    if (effectiveRemainingSeconds !== 0) return;
    if (store.stage !== 'interviewing') return;
    if (isSubmittingSession) return;

    const questionId = store.currentQuestionId;
    if (!questionId) return;
    if (store.answersByQuestionId[questionId]) return;
    if (timeoutHandledForQuestionRef.current === questionId) return;

    let cancelled = false;
    timeoutHandledForQuestionRef.current = questionId;
    setIsTimingOut(true);
    setShowTimerWarning(false);
    speech.stopPlayback();
    store.setQuestionState(questionId, 'unanswered');

    const advanceTimer = window.setTimeout(() => {
      if (cancelled) return;

      void (async () => {
        try {
          if (options?.answerRecorderOpen && options.onAutoSubmitRequest) {
            options.onAutoSubmitRequest();
          } else {
            await answerSubmit.submitEmptyAnswer();
          }
        } catch {
          if (cancelled) return;
          // Auto-submit failed outright (as opposed to being superseded by a
          // question change) — let the next tick retry instead of leaving
          // this question permanently stuck behind the guard.
          if (timeoutHandledForQuestionRef.current === questionId) {
            timeoutHandledForQuestionRef.current = null;
          }
        } finally {
          if (!cancelled) setIsTimingOut(false);
        }
      })();
    }, TIMEOUT_ADVANCE_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(advanceTimer);
    };
    // Do not depend on isTimingOut — setting it would re-run and clear the advance timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    answerSubmit.isSubmittingAnswer,
    answerSubmit.submitEmptyAnswer,
    options?.answerRecorderOpen,
    options?.onAutoSubmitRequest,
    isSubmittingSession,
    options?.violationPaused,
    phase,
    sessionId,
    store.answersByQuestionId,
    store.currentQuestionId,
    effectiveRemainingSeconds,
    store.stage,
  ]);

  const canReplay =
    effectiveRemainingSeconds > 0 &&
    !options?.violationPaused &&
    !answerSubmit.isSubmittingAnswer &&
    !isTimingOut &&
    store.stage === 'interviewing';

  const confirmFinish = useCallback(async () => {
    if (options?.violationPaused) return;
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
        answerSubmit.setAnswerError('practice.errors.noAnswers');
        store.setStage(store.interviewComplete ? 'ready_to_finish' : 'interviewing');
        return;
      }

      await submitPracticeSession(sessionId);
      media.stopMedia();
      navigate(completePath ?? `/interview/${sessionId}/complete`, { replace: true });
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
          navigate(completePath ?? `/interview/${sessionId}/complete`, { replace: true });
          return;
        }
        answerSubmit.setAnswerError('practice.errors.noAnswers');
      } else if (status === 403) answerSubmit.setAnswerError('practice.errors.forbidden');
      else if (status === 404) answerSubmit.setAnswerError('practice.errors.sessionNotFound');
      else answerSubmit.setAnswerError('practice.errors.submitSessionFailed');
      store.setStage(store.interviewComplete ? 'ready_to_finish' : 'interviewing');
    } finally {
      setIsSubmittingSession(false);
      setFinishOpen(false);
    }
  }, [answerSubmit, completePath, media, navigate, options?.violationPaused, recorder, sessionId, speech, store]);

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
    remainingSeconds: effectiveRemainingSeconds,
    answersByQuestionId: store.answersByQuestionId,
    questionStates: store.questionStates,
    interviewComplete: store.interviewComplete,
    lastNextAction: store.lastNextAction,
    speechWarning: store.speechWarning,
    media,
    micEnabled,
    cameraEnabled,
    toggleMic: () => setMicEnabled((value) => !value),
    toggleCamera: () => setCameraEnabled((value) => !value),
    speech,
    recorder,
    isSubmittingAnswer: answerSubmit.isSubmittingAnswer,
    isSubmittingSession,
    isTimingOut: isTimingOut || Boolean(options?.violationPaused),
    phase,
    countdownValue,
    answerError: answerSubmit.answerError,
    showTimerWarning,
    canSubmitAnswer: answerSubmit.canSubmitAnswer,
    canReplay,
    submitAnswer: answerSubmit.submitAnswer,
    submitAnswerWithFile: answerSubmit.submitAnswerWithFile,
    submitEmptyAnswer: answerSubmit.submitEmptyAnswer,
    overwriteConfirmOpen: answerSubmit.overwriteConfirmOpen,
    setOverwriteConfirmOpen: answerSubmit.setOverwriteConfirmOpen,
    confirmOverwriteSubmit: answerSubmit.confirmOverwriteSubmit,
    finishOpen,
    setFinishOpen,
    retryConfirmOpen,
    setRetryConfirmOpen,
    confirmFinish,
    submittedCount,
    unansweredCount,
    hasPendingRecording,
    startRecording: () => {
      if (options?.violationPaused || effectiveRemainingSeconds <= 0 || isTimingOut) return;
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
      if (options?.violationPaused || isTimingOut || effectiveRemainingSeconds <= 0) return;
      setRetryConfirmOpen(false);
      recorder.clearRecording();
      recorder.startRecording();
      if (store.currentQuestionId) {
        store.setQuestionState(store.currentQuestionId, 'recording');
      }
    },
  };
}
