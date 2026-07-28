import { describe, expect, it } from 'vitest';
import { mapApiRoadmapLessonDetail } from './roadmapMapper';

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
