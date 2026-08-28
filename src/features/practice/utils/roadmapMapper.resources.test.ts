import { describe, expect, it } from 'vitest';
import {
  MOCK_LESSON_MISTAKES,
  MOCK_LESSON_MISTAKES_EMPTY,
  MOCK_LESSON_MISTAKES_NULL,
} from '../mocks/learningPath.fixtures';
import { mapApiRoadmapDetail, mapApiRoadmapLessonDetail } from './roadmapMapper';

describe('mapApiRoadmapLessonDetail resources', () => {
  it('maps learning resources and keeps null urls as null', () => {
    const mapped = mapApiRoadmapLessonDetail({
      id: 'lesson-1',
      orderNo: 1,
      title: 'REST basics',
      theoryContent: '<p>Hello</p>',
      sessionId: null,
      status: 'Theory',
      resources: [
        {
          title: 'MDN Fetch',
          type: 'Doc',
          publisher: 'MDN',
          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API',
        },
        {
          title: 'Internal notes',
          type: 'Article',
          publisher: null,
          url: null,
        },
      ],
    });

    expect(mapped.resources).toHaveLength(2);
    expect(mapped.resources[0]).toMatchObject({
      title: 'MDN Fetch',
      type: 'Doc',
      publisher: 'MDN',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API',
    });
    expect(mapped.resources[1]?.url).toBeNull();
    expect(mapped.resources[1]?.publisher).toBeNull();
  });

  it('defaults resources to [] when backend omits the field', () => {
    const mapped = mapApiRoadmapLessonDetail({
      id: 'lesson-2',
      title: 'No resources',
      status: 'Done',
    });
    expect(mapped.resources).toEqual([]);
  });

  it.each([
    ['null', MOCK_LESSON_MISTAKES_NULL, null],
    ['empty', MOCK_LESSON_MISTAKES_EMPTY, []],
    ['rich', MOCK_LESSON_MISTAKES, MOCK_LESSON_MISTAKES.mistakes],
  ])('preserves the API mistakes state for %s', (_name, fixture, expected) => {
    const mapped = mapApiRoadmapLessonDetail(fixture);
    expect(mapped.mistakes).toEqual(expected);
  });

  it('keeps learner text as data instead of interpreting markdown-like characters', () => {
    const mapped = mapApiRoadmapLessonDetail(MOCK_LESSON_MISTAKES);
    expect(mapped.mistakes?.[0]?.answer).toContain('# phần này');
    expect(mapped.mistakes?.[0]?.answer).toContain('<strong>không phải HTML</strong>');
  });
});

describe('mapApiRoadmapDetail provenance', () => {
  it('maps resolved practice sessions and preserves a missing baseline', () => {
    const mapped = mapApiRoadmapDetail({
      id: 'roadmap-1',
      name: 'Frontend path',
      milestones: [],
      resolvedFrom: {
        sessionIds: [
          { sessionId: 'session-1', createdAt: '2026-08-20T10:00:00Z' },
          { id: 'session-2', date: '2026-08-21T10:00:00Z' },
        ],
        baselineAvailable: false,
        scope: 'Frontend',
      },
    });

    expect(mapped.resolvedFrom).toEqual({
      sessions: [
        { id: 'session-1', date: '2026-08-20T10:00:00Z' },
        { id: 'session-2', date: '2026-08-21T10:00:00Z' },
      ],
      baselineAvailable: false,
      scope: 'Frontend',
    });
  });

  it('keeps provenance absent when the backend omits resolvedFrom', () => {
    expect(mapApiRoadmapDetail({ id: 'roadmap-2', milestones: [] }).resolvedFrom).toBeNull();
  });

  it('maps milestone mistakeCount from the roadmap detail API', () => {
    const mapped = mapApiRoadmapDetail({
      id: 'roadmap-mistakes',
      milestones: [
        {
          id: 'milestone-1',
          orderNo: 1,
          title: 'Technical depth',
          status: 'InProgress',
          mistakeCount: 3,
          lessons: [],
        },
      ],
    });

    expect(mapped.milestones[0]?.mistakeCount).toBe(3);
  });
});
