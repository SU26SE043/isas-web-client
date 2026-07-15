import type { LearningLesson, LearningRoadmapDetail } from '../types/learningPath.types';

export function flattenLessons(roadmap: LearningRoadmapDetail): LearningLesson[] {
  return roadmap.milestones
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((milestone) => milestone.lessons.slice().sort((a, b) => a.order - b.order));
}

export function findNextLesson(
  roadmap: LearningRoadmapDetail,
  lessonId: string,
): LearningLesson | null {
  const lessons = flattenLessons(roadmap);
  const index = lessons.findIndex((item) => item.id === lessonId);
  if (index < 0 || index >= lessons.length - 1) return null;
  return lessons[index + 1] ?? null;
}

export function theoryPath(roadmapId: string, lessonId: string) {
  return `/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/theory`;
}

export function roadmapDetailPath(roadmapId: string) {
  return `/candidate/learning/roadmaps/${roadmapId}`;
}

export function continueLearningPath(card: {
  id: string;
  currentLessonId?: string;
  status: string;
  readOnly: boolean;
}) {
  if (card.readOnly || card.status === 'completed' || !card.currentLessonId) {
    return roadmapDetailPath(card.id);
  }
  return theoryPath(card.id, card.currentLessonId);
}
