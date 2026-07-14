import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { learningPathService } from '../services/learningPath.service';
import { getLearningPracticeSession } from '../services/learningPracticeSession.registry';
import type {
  LearningPracticeQuestionFeedback,
  LearningPracticeReport,
} from '../types/learningPath.types';
import type { PracticeQuestion } from '../mocks/session.fixtures';

export function useLearningLiveFeedback(sessionId: string, isLearning: boolean) {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<LearningPracticeQuestionFeedback | null>(null);
  const [answered, setAnswered] = useState<LearningPracticeReport['questionFeedback']>([]);
  const answeredRef = useRef(answered);
  answeredRef.current = answered;
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const learningMeta = isLearning ? getLearningPracticeSession(sessionId) : undefined;
  const exitHref = learningMeta
    ? `/candidate/learning/roadmaps/${learningMeta.roadmapId}`
    : `/interview/${sessionId}/complete`;

  const evaluateAnswer = async (question: PracticeQuestion | undefined) => {
    if (!question || feedback) return;
    setIsEvaluating(true);
    try {
      const nextFeedback = await learningPathService.evaluateAnswer(question.id);
      setFeedback(nextFeedback);
      setAnswered((prev) => [
        ...prev,
        {
          questionId: question.id,
          prompt: question.content,
          promptVi: question.content,
          feedback: nextFeedback,
        },
      ]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const clearFeedback = () => setFeedback(null);

  const completeSession = async (submitCurrentAnswer: () => Promise<boolean>) => {
    if (!learningMeta) return;
    setIsCompleting(true);
    try {
      await submitCurrentAnswer();
      const { report } = await learningPathService.completePracticeSession(
        learningMeta.roadmapId,
        learningMeta.lessonId,
        answeredRef.current,
      );
      navigate(
        `/candidate/learning/roadmaps/${learningMeta.roadmapId}/lessons/${learningMeta.lessonId}/report?reportId=${report.id}`,
      );
    } catch {
      setIsCompleting(false);
    }
  };

  return {
    feedback,
    isEvaluating,
    isCompleting,
    exitHref,
    evaluateAnswer,
    clearFeedback,
    completeSession,
  };
}
