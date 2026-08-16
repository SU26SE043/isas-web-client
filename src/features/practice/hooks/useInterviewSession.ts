import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { practiceSessionService } from '../services/practiceSession.service';
import { getLearningQuestionIndex } from '../services/learningPracticeSession.registry';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';
import { useNetworkStatus } from './useNetworkStatus';
import { isLearningSessionId } from '../types/interviewFlow.types';

export function useInterviewSession(sessionId: string) {
  const navigate = useNavigate();
  const isLearning = isLearningSessionId(sessionId);
  const status = useInterviewSessionStore((state) => state.status);
  const remainingSeconds = useInterviewSessionStore((state) => state.remainingSeconds);
  const setLoading = useInterviewSessionStore((state) => state.setLoading);
  const initSession = useInterviewSessionStore((state) => state.initSession);
  const tickTimer = useInterviewSessionStore((state) => state.tickTimer);
  const submitCurrentAnswer = useInterviewSessionStore((state) => state.submitCurrentAnswer);
  const advanceToNextQuestion = useInterviewSessionStore((state) => state.advanceToNextQuestion);
  const reset = useInterviewSessionStore((state) => state.reset);

  const init = useCallback(async () => {
    setLoading();
    try {
      await practiceSessionService.startSession(sessionId);
    } catch {
      navigate(`/interview/${sessionId}/prepare`, { replace: true });
      return;
    }

    const session = await practiceSessionService.getSession(sessionId);
    const questions = session.questions.length
      ? session.questions
      : await practiceSessionService.pollQuestions(sessionId);
    const proctoringConfig = practiceSessionService.getProctoringConfig(sessionId);
    const startIndex = isLearningSessionId(sessionId) ? getLearningQuestionIndex(sessionId) : 0;
    initSession(session.title, questions, proctoringConfig, startIndex);
  }, [initSession, navigate, sessionId, setLoading]);

  useEffect(() => {
    void init();
    return () => reset();
  }, [init, reset]);

  const isRoomActive =
    status !== 'loading' && status !== 'completed' && status !== 'auto_submitted';

  useNetworkStatus(isRoomActive);

  useEffect(() => {
    if (status !== 'active') return undefined;
    const timerId = window.setInterval(() => tickTimer(), 1000);
    return () => window.clearInterval(timerId);
  }, [status, tickTimer]);

  useEffect(() => {
    if (isLearning) return;
    if (status !== 'active' || remainingSeconds > 0) return;
    void (async () => {
      const completed = await submitCurrentAnswer();
      if (completed) navigate(`/interview/${sessionId}/complete`);
    })();
  }, [isLearning, navigate, remainingSeconds, sessionId, status, submitCurrentAnswer]);

  useEffect(() => {
    if (isLearning) return;
    if (status !== 'completed' && status !== 'auto_submitted') return;
    navigate(`/interview/${sessionId}/complete`);
  }, [isLearning, navigate, sessionId, status]);

  const submitAnswer = useCallback(async () => {
    const completed = await submitCurrentAnswer();
    if (!isLearning && completed) {
      navigate(`/interview/${sessionId}/complete`);
    }
    return completed;
  }, [isLearning, navigate, sessionId, submitCurrentAnswer]);

  const sessionTitle = useInterviewSessionStore((state) => state.sessionTitle);
  const questions = useInterviewSessionStore((state) => state.questions);
  const currentIndex = useInterviewSessionStore((state) => state.currentIndex);
  const messages = useInterviewSessionStore((state) => state.messages);
  const aiState = useInterviewSessionStore((state) => state.aiState);
  const isRecording = useInterviewSessionStore((state) => state.isRecording);
  const micEnabled = useInterviewSessionStore((state) => state.micEnabled);
  const cameraEnabled = useInterviewSessionStore((state) => state.cameraEnabled);
  const violationCount = useInterviewSessionStore((state) => state.violationCount);
  const tabViolationCount = useInterviewSessionStore((state) => state.tabViolationCount);
  const violationReason = useInterviewSessionStore((state) => state.violationReason);
  const maxViolations = useInterviewSessionStore((state) => state.maxViolations);
  const isTabHidden = useInterviewSessionStore((state) => state.isTabHidden);
  const showTabLockWarning = useInterviewSessionStore((state) => state.showTabLockWarning);
  const isOffline = useInterviewSessionStore((state) => state.isOffline);
  const proctoringConfig = useInterviewSessionStore((state) => state.proctoringConfig);
  const togglePause = useInterviewSessionStore((state) => state.togglePause);
  const continueAfterViolation = useInterviewSessionStore((state) => state.continueAfterViolation);
  const toggleMic = useInterviewSessionStore((state) => state.toggleMic);
  const toggleCamera = useInterviewSessionStore((state) => state.toggleCamera);
  const toggleRecording = useInterviewSessionStore((state) => state.toggleRecording);

  return {
    status,
    sessionTitle,
    questions,
    currentIndex,
    messages,
    aiState,
    remainingSeconds,
    isRecording,
    micEnabled,
    cameraEnabled,
    violationCount,
    tabViolationCount,
    violationReason,
    maxViolations,
    isTabHidden,
    showTabLockWarning,
    isOffline,
    proctoringConfig,
    togglePause,
    continueAfterViolation,
    toggleMic,
    toggleCamera,
    toggleRecording,
    submitAnswer,
    submitCurrentAnswer,
    advanceToNextQuestion,
    isLearning,
    isLoading: status === 'loading',
    isRoomActive,
    isViolationPaused: status === 'paused_violation',
    isManualPaused: status === 'paused',
    isAutoSubmitted: status === 'auto_submitted',
    currentQuestion: questions[currentIndex],
    totalQuestions: questions.length,
  };
}
