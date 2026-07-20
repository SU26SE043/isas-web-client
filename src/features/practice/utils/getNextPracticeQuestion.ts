import type { PracticeQuestionResponse } from '../types/b2cPracticeSession.types';

/** Next question after the current one in session order, or null if this was the last. */
export function getNextPracticeQuestion(
  questions: PracticeQuestionResponse[],
  currentQuestionId: string,
): PracticeQuestionResponse | null {
  const index = questions.findIndex((question) => question.id === currentQuestionId);
  if (index < 0) return null;
  return questions[index + 1] ?? null;
}
