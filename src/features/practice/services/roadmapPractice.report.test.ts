import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: (...args: unknown[]) => get(...args),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import { roadmapPracticeService } from './roadmapPractice.service';

/** Payload đúng hợp đồng backend cho `GET /roadmaps/{id}/report`. */
function reportPayload(overrides: Record<string, unknown> = {}) {
  return {
    roadmapId: 'rm-1',
    roadmapStatus: 'Active',
    radar: [
      {
        criterionId: 'c1',
        name: 'Giao tiếp & trình bày',
        maxScore: 5,
        weight: 0.2,
        percentage: 72,
        averageScore: 3.6,
        startPercentage: 40,
        sessionCount: 4,
        recentCount: 3,
      },
      {
        criterionId: 'c2',
        name: 'Chiều sâu kỹ thuật',
        maxScore: 5,
        weight: 0.2,
        percentage: 55,
        averageScore: 2.75,
        startPercentage: null,
        sessionCount: 1,
        recentCount: 1,
      },
    ],
    levelEvaluation: [
      { criterionName: 'Giao tiếp & trình bày', percentage: 72, levelThreshold: 60, passed: true },
      { criterionName: 'Chiều sâu kỹ thuật', percentage: 55, levelThreshold: 60, passed: false },
    ],
    progress: [
      {
        order: 1,
        lessonTitle: 'Bài mở đầu',
        completedAt: '2026-08-01T10:00:00Z',
        overallPercentage: 40,
        scores: [{ name: 'Giao tiếp & trình bày', percentage: 40 }],
      },
      {
        order: 2,
        lessonTitle: 'Bài thứ hai',
        completedAt: '2026-08-05T10:00:00Z',
        overallPercentage: 72,
        scores: [
          { name: 'Giao tiếp & trình bày', percentage: 72 },
          { name: 'Chiều sâu kỹ thuật', percentage: 55 },
        ],
      },
    ],
    strengths: ['Trình bày mạch lạc'],
    weaknesses: ['Thiếu chiều sâu'],
    improvements: ['Giao tiếp & trình bày'],
    overallComment: null,
    ...overrides,
  };
}

describe('getRoadmapReport — ánh xạ theo hợp đồng backend', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('đọc percentage/startPercentage/sessionCount/recentCount đúng tên field', async () => {
    get.mockResolvedValue({ data: reportPayload() });
    const report = await roadmapPracticeService.getRoadmapReport('rm-1');

    expect(report.radarData[0]).toMatchObject({
      subject: 'Giao tiếp & trình bày',
      A: 72,
      B: 60, // ngưỡng ghép từ levelEvaluation theo tên
      C: 40,
      sessionCount: 4,
      recentCount: 3,
    });
  });

  it('startPercentage null giữ NGUYÊN null — không được rơi về 0', async () => {
    get.mockResolvedValue({ data: reportPayload() });
    const report = await roadmapPracticeService.getRoadmapReport('rm-1');

    expect(report.radarData[1]!.C).toBeNull();
    // Vế này mới là cái đắt: 0 sẽ vẽ mốc xuất phát ở đáy ⇒ trông như tiến bộ vượt bậc.
    expect(report.radarData[1]!.C).not.toBe(0);
  });

  it('startPercentage = 0 là số đo thật và phải giữ nguyên 0', async () => {
    const payload = reportPayload();
    (payload.radar[1] as Record<string, unknown>).startPercentage = 0;
    get.mockResolvedValue({ data: payload });
    const report = await roadmapPracticeService.getRoadmapReport('rm-1');

    expect(report.radarData[1]!.C).toBe(0);
  });

  it('ánh xạ progress đủ order/lessonTitle/completedAt/overallPercentage/scores', async () => {
    get.mockResolvedValue({ data: reportPayload() });
    const report = await roadmapPracticeService.getRoadmapReport('rm-1');

    expect(report.progress).toHaveLength(2);
    expect(report.progress[0]).toEqual({
      order: 1,
      lessonTitle: 'Bài mở đầu',
      completedAt: '2026-08-01T10:00:00Z',
      overallPercentage: 40,
      scores: [{ name: 'Giao tiếp & trình bày', percentage: 40 }],
    });
    expect(report.progress[1]!.scores).toHaveLength(2);
  });

  it('sắp progress theo `order`, không tin thứ tự mảng backend gửi', async () => {
    const payload = reportPayload();
    payload.progress = [payload.progress[1]!, payload.progress[0]!];
    get.mockResolvedValue({ data: payload });
    const report = await roadmapPracticeService.getRoadmapReport('rm-1');

    expect(report.progress.map((p) => p.order)).toEqual([1, 2]);
  });

  it('progress VẮNG trong payload (báo cáo cũ đã chốt sổ) ⇒ mảng rỗng, không ném', async () => {
    const payload = reportPayload();
    delete (payload as Record<string, unknown>).progress;
    get.mockResolvedValue({ data: payload });
    const report = await roadmapPracticeService.getRoadmapReport('rm-1');

    expect(report.progress).toEqual([]);
    expect(report.radarData).toHaveLength(2);
  });

  it('payload RỖNG toàn bộ (lộ trình chưa chấm buổi nào) vẫn map được, không ném', async () => {
    get.mockResolvedValue({
      data: {
        roadmapId: 'rm-1',
        roadmapStatus: 'Active',
        radar: [],
        levelEvaluation: [],
        progress: [],
        strengths: [],
        weaknesses: [],
        improvements: [],
        overallComment: null,
      },
    });
    const report = await roadmapPracticeService.getRoadmapReport('rm-1');

    expect(report.radarData).toEqual([]);
    expect(report.progress).toEqual([]);
    expect(report.kind).toBe('interim');
  });

  it('roadmapStatus Completed ⇒ snapshot; Active ⇒ interim', async () => {
    get.mockResolvedValue({ data: reportPayload({ roadmapStatus: 'Completed' }) });
    expect((await roadmapPracticeService.getRoadmapReport('rm-1')).kind).toBe('snapshot');

    get.mockResolvedValue({ data: reportPayload({ roadmapStatus: 'Active' }) });
    expect((await roadmapPracticeService.getRoadmapReport('rm-1')).kind).toBe('interim');
  });
});
