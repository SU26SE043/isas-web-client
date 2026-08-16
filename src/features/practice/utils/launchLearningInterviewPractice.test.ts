import { describe, expect, it } from 'vitest';
import {
  getLearningSessionRouteContext,
  learningInterviewPreparePath,
  learningInterviewRoomPath,
  learningPracticeReportPath,
} from './launchLearningInterviewPractice';

const context = { roadmapId: 'roadmap 1', lessonId: 'lesson/1' };

describe('learning session route context', () => {
  it('keeps roadmap ownership in every interview route', () => {
    expect(learningInterviewPreparePath('session-1', context)).toBe(
      '/interview/session-1/prepare?roadmapId=roadmap+1&lessonId=lesson%2F1',
    );
    expect(learningInterviewRoomPath('session-1', context, true)).toBe(
      '/interview/session-1/room?roadmapId=roadmap+1&lessonId=lesson%2F1&start=countdown',
    );
    expect(learningPracticeReportPath('session-1', context)).toBe(
      '/candidate/learning/roadmaps/roadmap%201/lessons/lesson%2F1/report?sessionId=session-1',
    );
  });

  it('requires both roadmap and lesson ids to identify a learning session', () => {
    expect(getLearningSessionRouteContext(new URLSearchParams('roadmapId=roadmap-1'))).toBeNull();
    expect(
      getLearningSessionRouteContext(
        new URLSearchParams('roadmapId=roadmap-1&lessonId=lesson-1'),
      ),
    ).toEqual({ roadmapId: 'roadmap-1', lessonId: 'lesson-1' });
  });
});
