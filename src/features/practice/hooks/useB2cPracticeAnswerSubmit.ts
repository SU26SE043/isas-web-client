import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiStatusCode } from '@/shared/api/apiError';
import {
  submitPracticeAnswer,
  submitPracticeSession,
} from '../services/b2cPracticeSession.service';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import { mapSubmitPracticeAnswerErrorKey } from '../utils/b2cPracticeSessionErrors';
import { getNextPracticeQuestion } from '../utils/getNextPracticeQuestion';
import { createSilentUnansweredAudioFile } from '../utils/createSilentUnansweredAudioFile';
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
}: UseB2cPracticeAnswerSubmitOptions) {
  const navigate = useNavigate();
  const store = useB2cPracticeInterviewStore();
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const pendingOverrideRef = useRef<{ file: File; durationSec: number } | null>(null);
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
      // Stop the previous question's narration the instant we know we're
      // moving on, regardless of which branch below runs — previously this
      // only happened on the interviewComplete branch, leaving old audio
      // playing (and racing new-question TTS) on the normal advance path.
      onStopSpeechRef.current();

      if (response.nextQuestion) {
        store.appendQuestion(response.nextQuestion);
        store.setCurrentQuestion(response.nextQuestion.id, response.nextQuestion.timeLimitSec);
        store.setStage('interviewing');
        recorder.clearRecording();
      } else if (response.interviewComplete) {
        store.setInterviewComplete(true, response.nextAction ?? 'end');
        recorder.stopRecordingAndDiscard();
        try {
          await submitPracticeSession(sessionId);
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
  }, [completePath, currentQuestion, navigate, sessionId]);

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
        isSubmittingAnswer ||
        (!options?.allowDuringTimeout && isTimingOut) ||
        remainingSeconds <= 0
      ) {
        throw new Error('submit-blocked');
      }
      // Modal retake + submit is an intentional overwrite of any prior answer.
      await performSubmit({ file, durationSec });
    },
    [currentQuestion, isSubmittingAnswer, isTimingOut, performSubmit, remainingSeconds],
  );

  const submitEmptyAnswer = useCallback(async () => {
    if (!currentQuestion || isSubmittingAnswer) return;
    await performSubmit({
      file: createSilentUnansweredAudioFile(),
      durationSec: 0,
    });
    storeRef.current.setQuestionState(currentQuestion.id, 'unanswered');
  }, [currentQuestion, isSubmittingAnswer, performSubmit]);

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
    submitEmptyAnswer,
    overwriteConfirmOpen,
    setOverwriteConfirmOpen,
    confirmOverwriteSubmit,
  };
}
