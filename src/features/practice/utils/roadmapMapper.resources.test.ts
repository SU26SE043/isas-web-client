import { describe, expect, it } from 'vitest';
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
});
