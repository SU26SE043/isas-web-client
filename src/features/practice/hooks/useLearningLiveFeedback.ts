import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { roadmapPracticeService } from '../services/roadmapPractice.service';
import {
  appendLearningAnswer,
  getLearningPracticeSession,
} from '../services/learningPracticeSession.registry';
import type { PracticeQuestion } from '../mocks/session.fixtures';
import type { LearningPracticeQuestionFeedback } from '../types/learningPath.types';
import type { PracticeAnswerDetail } from '../types/roadmapPractice.api.types';

function questionReportPath(
  roadmapId: string,
  lessonId: string,
  questionId: string,
  sessionId: string,
) {
  return `/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/practice/questions/${questionId}/report?sessionId=${encodeURIComponent(sessionId)}`;
}

function toFeedback(detail: PracticeAnswerDetail): LearningPracticeQuestionFeedback {
  return {
    score: detail.score ?? 0,
    strengths: detail.strengths ?? [],
    strengthsVi: detail.strengthsVi?.length ? detail.strengthsVi : detail.strengths ?? [],
    weaknesses: detail.weaknesses ?? [],
    weaknessesVi: detail.weaknessesVi?.length ? detail.weaknessesVi : detail.weaknesses ?? [],
    missingKnowledge: detail.improvements ?? [],
    missingKnowledgeVi: detail.improvementsVi?.length
      ? detail.improvementsVi
      : detail.improvements ?? [],
    betterAnswer: detail.betterAnswer ?? detail.feedback ?? '',
    betterAnswerVi: detail.betterAnswerVi ?? detail.feedbackVi ?? detail.betterAnswer ?? detail.feedback ?? '',
    tips: detail.tips ?? detail.improvements ?? [],
    tipsVi: detail.tipsVi?.length ? detail.tipsVi : detail.improvementsVi ?? detail.tips ?? [],
  };
}

/**
 * Learning practice: Submit answer → wait for score → question report page.
 * Last-question completion happens on the report page (not here).
 */
export function useLearningLiveFeedback(sessionId: string, isLearning: boolean) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const inFlightRef = useRef(false);

  const learningMeta = isLearning ? getLearningPracticeSession(sessionId) : undefined;
  const exitHref = learningMeta
    ? `/candidate/learning/roadmaps/${learningMeta.roadmapId}`
    : `/interview/${sessionId}/complete`;

  const submitForReport = async (
    question: PracticeQuestion | undefined,
    captureAnswer: () => Promise<{ blob: Blob; durationSec: number }>,
  ) => {
    if (!question || !learningMeta || inFlightRef.current || isEvaluating) return;
    inFlightRef.current = true;
    setIsEvaluating(true);
    try {
      const { blob, durationSec } = await captureAnswer();
      if (blob.size <= 0) {
        toast.error(t('practice.learningPath.answerEmpty'));
        return;
      }
      if (blob.size > roadmapPracticeService.maxAnswerBytes) {
        toast.error(t('practice.learningPath.answerTooLarge'));
        return;
      }

      const submitted = await roadmapPracticeService.submitAnswer(sessionId, {
        questionId: question.id,
        file: blob,
        durationSec,
        fileName: 'answer.webm',
      });

      const scored = await roadmapPracticeService.waitForSessionQuestionFeedback(
        sessionId,
        question.id,
      );

      appendLearningAnswer(sessionId, {
        questionId: question.id,
        prompt: question.content,
        promptVi: question.content,
        feedback: toFeedback({ ...submitted, ...scored }),
        transcript: scored.transcript ?? submitted.transcript,
        scoringStatus: scored.scoringStatus ?? scored.status,
      });

      navigate(
        questionReportPath(
          learningMeta.roadmapId,
          learningMeta.lessonId,
          question.id,
          sessionId,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'ANSWER_FILE_TOO_LARGE') {
        toast.error(t('practice.learningPath.answerTooLarge'));
      } else {
        toast.error(t('practice.learningPath.answerUploadError'));
      }
    } finally {
      inFlightRef.current = false;
      setIsEvaluating(false);
    }
  };

  return {
    isEvaluating,
    isCompleting,
    setIsCompleting,
    exitHref,
    submitForReport,
  };
}
