import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { learningPathService } from '../services/learningPath.service';
import {
  appendLearningAnswer,
  clearLearningPending,
  getLearningAnswered,
  getLearningPracticeSession,
} from '../services/learningPracticeSession.registry';
import type { PracticeQuestion } from '../mocks/session.fixtures';

function questionReportPath(
  roadmapId: string,
  lessonId: string,
  questionId: string,
  sessionId: string,
) {
  return `/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/practice/questions/${questionId}/report?sessionId=${encodeURIComponent(sessionId)}`;
}

function lessonReportPath(roadmapId: string, lessonId: string, reportId: string) {
  return `/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/report?reportId=${reportId}`;
}

/**
 * Learning practice orchestrator: Submit → per-question report page;
 * last question Complete → aggregate lesson report.
 */
export function useLearningLiveFeedback(sessionId: string, isLearning: boolean) {
  const navigate = useNavigate();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const learningMeta = isLearning ? getLearningPracticeSession(sessionId) : undefined;
  const exitHref = learningMeta
    ? `/candidate/learning/roadmaps/${learningMeta.roadmapId}`
    : `/interview/${sessionId}/complete`;

  const submitForReport = async (question: PracticeQuestion | undefined) => {
    if (!question || !learningMeta || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const feedback = await learningPathService.evaluateAnswer(question.id);
      appendLearningAnswer(sessionId, {
        questionId: question.id,
        prompt: question.content,
        promptVi: question.content,
        feedback,
      });
      navigate(
        questionReportPath(
          learningMeta.roadmapId,
          learningMeta.lessonId,
          question.id,
          sessionId,
        ),
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const completeSession = async (
    question: PracticeQuestion | undefined,
    submitCurrentAnswer: () => Promise<boolean>,
  ) => {
    if (!learningMeta || !question || isCompleting) return;
    setIsCompleting(true);
    setIsEvaluating(true);
    try {
      const feedback = await learningPathService.evaluateAnswer(question.id);
      appendLearningAnswer(sessionId, {
        questionId: question.id,
        prompt: question.content,
        promptVi: question.content,
        feedback,
      });
      clearLearningPending(sessionId);
      await submitCurrentAnswer();
      const { report } = await learningPathService.completePracticeSession(
        learningMeta.roadmapId,
        learningMeta.lessonId,
        getLearningAnswered(sessionId),
      );
      navigate(lessonReportPath(learningMeta.roadmapId, learningMeta.lessonId, report.id));
    } catch {
      setIsCompleting(false);
      setIsEvaluating(false);
    }
  };

  return {
    isEvaluating,
    isCompleting,
    exitHref,
    submitForReport,
    completeSession,
  };
}
