import { describe, expect, it } from 'vitest';
import { hasHeadlineMismatch, mapMilestoneScoreReport } from './roadmapPractice.service';

/** Đúng hình dạng backend trả về (đã verify sống trên deploy). */
const wire = {
  milestoneId: 'ms-2',
  milestoneTitle: 'Chặng 2',
  orderNo: 2,
  milestoneStatus: 'Completed',
  source: 'snapshot',
  comparedWith: 'previousMilestone',
  comparedWithTitle: 'Chặng 1',
  criteria: [
    {
      name: 'Giao tiếp & trình bày',
      currentAveragePercentage: 50,
      currentSessions: [
        { sessionId: 's-1', lessonTitle: 'Bài 1', attemptNo: 1, percentage: 60, scoredAt: '2026-08-01T00:00:00Z' },
      ],
      referenceAveragePercentage: 70,
      referenceSessions: [],
      deltaPct: -20,
      headlineDeltaPct: -20,
    },
  ],
};

describe('mapMilestoneScoreReport', () => {
  it('đọc đúng tên field của backend, không tự đổi tên', () => {
    const report = mapMilestoneScoreReport(wire, 'fallback');
    expect(report.milestoneId).toBe('ms-2');
    expect(report.milestoneTitle).toBe('Chặng 2');
    expect(report.orderNo).toBe(2);
    expect(report.milestoneStatus).toBe('Completed');
    expect(report.source).toBe('snapshot');
    expect(report.comparedWith).toBe('previousMilestone');
    expect(report.comparedWithTitle).toBe('Chặng 1');
    expect(report.criteria[0]).toMatchObject({
      name: 'Giao tiếp & trình bày',
      currentAveragePercentage: 50,
      referenceAveragePercentage: 70,
      deltaPct: -20,
      headlineDeltaPct: -20,
    });
    expect(report.criteria[0].currentSessions[0]).toMatchObject({
      sessionId: 's-1', lessonTitle: 'Bài 1', attemptNo: 1, percentage: 60, scoredAt: '2026-08-01T00:00:00Z',
    });
  });

  it('gỡ được vỏ { data: … }', () => {
    expect(mapMilestoneScoreReport({ data: wire }, 'fallback').milestoneId).toBe('ms-2');
  });

  it('KHÔNG CÓ MỐC giữ nguyên null, tuyệt đối không hoá thành 0', () => {
    const report = mapMilestoneScoreReport(
      { ...wire, criteria: [{ ...wire.criteria[0], referenceAveragePercentage: null, deltaPct: null, headlineDeltaPct: null }] },
      'fallback',
    );
    const criterion = report.criteria[0];
    expect(criterion.referenceAveragePercentage).toBeNull();
    expect(criterion.deltaPct).toBeNull();
    expect(criterion.headlineDeltaPct).toBeNull();
    // Đúng cái bẫy: 0 là một số đo, null là "không có số đo".
    expect(criterion.deltaPct).not.toBe(0);
  });

  it('field vắng mặt cũng ra null chứ không ra 0', () => {
    const report = mapMilestoneScoreReport({ ...wire, criteria: [{ name: 'X' }] }, 'fallback');
    expect(report.criteria[0]).toMatchObject({
      currentAveragePercentage: null, referenceAveragePercentage: null, deltaPct: null, headlineDeltaPct: null,
    });
  });

  it('buổi chưa chấm giữ percentage null, và attemptNo mặc định là 1', () => {
    const report = mapMilestoneScoreReport(
      { ...wire, criteria: [{ ...wire.criteria[0], currentSessions: [{ sessionId: 's-9', lessonTitle: 'Bài 9' }] }] },
      'fallback',
    );
    expect(report.criteria[0].currentSessions[0].percentage).toBeNull();
    expect(report.criteria[0].currentSessions[0].attemptNo).toBe(1);
    expect(report.criteria[0].currentSessions[0].scoredAt).toBeNull();
  });

  it('giá trị source/comparedWith lạ thành `unknown`, KHÔNG bị gán bừa về một nhãn đã biết', () => {
    const report = mapMilestoneScoreReport({ ...wire, source: 'brand-new-mode', comparedWith: 'something' }, 'fallback');
    expect(report.source).toBe('unknown');
    expect(report.source).not.toBe('computed');
    expect(report.comparedWith).toBe('unknown');
  });

  it('giữ đủ ba trạng thái source mà backend khai', () => {
    for (const source of ['snapshot', 'computed', 'recomputed'] as const) {
      expect(mapMilestoneScoreReport({ ...wire, source }, 'fallback').source).toBe(source);
    }
  });
});

describe('hasHeadlineMismatch', () => {
  const criterion = (deltaPct: number | null, headlineDeltaPct: number | null) => ({
    name: 'c', currentAveragePercentage: 1, currentSessions: [], referenceAveragePercentage: 1, referenceSessions: [],
    deltaPct, headlineDeltaPct,
  });

  it('báo lệch khi hai con số khác nhau', () => {
    expect(hasHeadlineMismatch([criterion(-20, -15)])).toBe(true);
  });

  it('không báo lệch khi trùng nhau', () => {
    expect(hasHeadlineMismatch([criterion(-20, -20)])).toBe(false);
  });

  it('null không so được nên KHÔNG tính là lệch (nếu không mọi chặng thiếu mốc đều bị cảnh báo oan)', () => {
    expect(hasHeadlineMismatch([criterion(null, -20)])).toBe(false);
    expect(hasHeadlineMismatch([criterion(-20, null)])).toBe(false);
    expect(hasHeadlineMismatch([criterion(null, null)])).toBe(false);
  });
});
