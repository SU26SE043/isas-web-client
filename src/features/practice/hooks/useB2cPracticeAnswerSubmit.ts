import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiStatusCode } from '@/shared/api/apiError';
import {
  submitPracticeAnswer,
  submitPracticeSession,
} from '../services/b2cPracticeSession.service';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { mapSubmitPracticeAnswerErrorKey } from '../utils/b2cPracticeSessionErrors';
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
}: UseB2cPracticeAnswerSubmitOptions) {
  const navigate = useNavigate();
  const store = useB2cPracticeInterviewStore();
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const pendingOverrideRef = useRef<{ file: File; durationSec: number } | null>(null);

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
    const file = override?.file ?? recorder.audioFile;
    const durationSec = override?.durationSec ?? recorder.durationSec;
    if (!currentQuestion || !file) {
      setAnswerError('practice.errors.audioRequired');
      throw new Error('audio-required');
    }
    setIsSubmittingAnswer(true);
    setAnswerError(null);
    store.setStage('submitting_answer');
    recorder.setUploading();
    try {
      const response = await submitPracticeAnswer({
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

      if (response.nextQuestion) {
        store.appendQuestion(response.nextQuestion);
        store.setCurrentQuestion(response.nextQuestion.id, response.nextQuestion.timeLimitSec);
        store.setStage('interviewing');
        recorder.clearRecording();
      } else if (response.interviewComplete || response.nextAction === 'end') {
        store.setInterviewComplete(true, response.nextAction ?? 'end');
        onStopSpeech();
        recorder.stopRecordingAndDiscard();
        try {
          await submitPracticeSession(sessionId);
          onStopMedia();
          navigate(completePath ?? `/interview/${sessionId}/complete`, { replace: true });
        } catch {
          store.setStage('ready_to_finish');
        }
      } else {
        store.setStage('interviewing');
      }
    } catch (error) {
      const status = getApiStatusCode(error);
      setAnswerError(mapSubmitPracticeAnswerErrorKey(status));
      store.setStage('interviewing');
      store.setQuestionState(currentQuestion.id, 'error');
      recorder.setStopped();
      throw error;
    } finally {
      setIsSubmittingAnswer(false);
      setOverwriteConfirmOpen(false);
    }
  }, [
    completePath,
    currentQuestion,
    navigate,
    onStopMedia,
    onStopSpeech,
    recorder,
    sessionId,
    store,
  ]);

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
    async (file: File, durationSec: number) => {
      if (!currentQuestion) {
        setAnswerError('practice.errors.audioRequired');
        throw new Error('missing-question');
      }
      if (isSubmittingAnswer || isTimingOut || remainingSeconds <= 0) {
        throw new Error('submit-blocked');
      }
      // Modal retake + submit is an intentional overwrite of any prior answer.
      await performSubmit({ file, durationSec });
    },
    [currentQuestion, isSubmittingAnswer, isTimingOut, performSubmit, remainingSeconds],
  );

  const confirmOverwriteSubmit = useCallback(() => {
    const pending = pendingOverrideRef.current;
    pendingOverrideRef.current = null;
    void performSubmit(pending ?? undefined).catch(() => undefined);
  }, [performSubmit]);

  return {
    isSubmittingAnswer,
    answerError,
    setAnswerError,
    canSubmitAnswer,
    submitAnswer,
    submitAnswerWithFile,
    overwriteConfirmOpen,
    setOverwriteConfirmOpen,
    confirmOverwriteSubmit,
  };
}
