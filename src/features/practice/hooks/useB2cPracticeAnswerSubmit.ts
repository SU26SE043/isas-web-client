import { useCallback, useState } from 'react';
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
}: UseB2cPracticeAnswerSubmitOptions) {
  const navigate = useNavigate();
  const store = useB2cPracticeInterviewStore();
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);

  const canSubmitAnswer =
    Boolean(recorder.audioFile) &&
    recorder.durationSec > 0 &&
    Boolean(currentQuestion) &&
    !isSubmittingAnswer &&
    !isTimingOut &&
    remainingSeconds > 0 &&
    stage !== 'submitting_session' &&
    recorder.recordingStatus !== 'uploading';

  const performSubmit = useCallback(async () => {
    if (!currentQuestion || !recorder.audioFile) {
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
        onStopSpeech();
        recorder.stopRecordingAndDiscard();
        try {
          await submitPracticeSession(sessionId);
          onStopMedia();
          navigate(`/interview/${sessionId}/complete`, { replace: true });
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
    } finally {
      setIsSubmittingAnswer(false);
      setOverwriteConfirmOpen(false);
    }
  }, [currentQuestion, navigate, onStopMedia, onStopSpeech, recorder, sessionId, store]);

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
    await performSubmit();
  }, [answersByQuestionId, canSubmitAnswer, currentQuestion, performSubmit]);

  const confirmOverwriteSubmit = useCallback(() => {
    void performSubmit();
  }, [performSubmit]);

  return {
    isSubmittingAnswer,
    answerError,
    setAnswerError,
    canSubmitAnswer,
    submitAnswer,
    overwriteConfirmOpen,
    setOverwriteConfirmOpen,
    confirmOverwriteSubmit,
  };
}
