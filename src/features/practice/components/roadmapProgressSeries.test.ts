import { describe, expect, it } from 'vitest';
import {
  buildProgressRows,
  canPlotTrend,
  collectCriterionNames,
  criterionKey,
} from './roadmapProgressSeries';
import type { RoadmapProgressPoint } from '../types/roadmapPractice.api.types';

function point(
  order: number,
  overall: number,
  scores: Array<[string, number]> = [],
): RoadmapProgressPoint {
  return {
    order,
    lessonTitle: `Bài ${order}`,
    completedAt: null,
    overallPercentage: overall,
    scores: scores.map(([name, percentage]) => ({ name, percentage })),
  };
}

describe('canPlotTrend', () => {
  it('không vẽ khi chưa có buổi nào', () => {
    expect(canPlotTrend([])).toBe(false);
  });

  it('không vẽ khi mới có MỘT buổi — một điểm không phải một xu hướng', () => {
    expect(canPlotTrend([point(1, 70)])).toBe(false);
  });

  it('vẽ được từ hai buổi trở lên', () => {
    expect(canPlotTrend([point(1, 70), point(2, 80)])).toBe(true);
  });
});

describe('collectCriterionNames', () => {
  it('gom theo thứ tự xuất hiện lần đầu và không lặp lại', () => {
    const names = collectCriterionNames([
      point(1, 70, [['Giao tiếp', 60], ['Thuật ngữ', 50]]),
      point(2, 80, [['Thuật ngữ', 70], ['Chiều sâu', 40]]),
    ]);
    expect(names).toEqual(['Giao tiếp', 'Thuật ngữ', 'Chiều sâu']);
  });

  it('trả mảng rỗng khi không buổi nào có tiêu chí', () => {
    expect(collectCriterionNames([point(1, 70)])).toEqual([]);
  });
});

describe('buildProgressRows', () => {
  it('giữ điểm tổng và nhãn của từng buổi', () => {
    const rows = buildProgressRows([point(1, 70), point(2, 82)], []);
    expect(rows.map((r) => r.overall)).toEqual([70, 82]);
    expect(rows.map((r) => r.label)).toEqual(['Bài 1', 'Bài 2']);
  });

  it('buổi KHÔNG chấm tiêu chí ⇒ null (đường hở), tuyệt đối không phải 0', () => {
    const names = ['Giao tiếp', 'Thuật ngữ'];
    const rows = buildProgressRows(
      [point(1, 70, [['Giao tiếp', 60]]), point(2, 80, [['Giao tiếp', 65], ['Thuật ngữ', 90]])],
      names,
    );
    // Buổi 1 không chấm "Thuật ngữ".
    expect(rows[0]![criterionKey(1)]).toBeNull();
    expect(rows[0]![criterionKey(1)]).not.toBe(0);
    expect(rows[1]![criterionKey(1)]).toBe(90);
  });

  it('điểm 0 thật vẫn giữ nguyên là 0, không bị nhầm thành khuyết', () => {
    const rows = buildProgressRows([point(1, 0, [['Giao tiếp', 0]])], ['Giao tiếp']);
    expect(rows[0]![criterionKey(0)]).toBe(0);
  });

  it('dùng khoá crit_<index>, không dùng tên tiêu chí làm dataKey', () => {
    // Tên thật chứa dấu chấm/`&` sẽ bị recharts hiểu là đường dẫn `a.b` và tra trượt.
    const names = ['Kỹ năng: giao tiếp & trình bày. Nâng cao'];
    const rows = buildProgressRows([point(1, 70, [[names[0]!, 55]])], names);
    expect(rows[0]![criterionKey(0)]).toBe(55);
    expect(Object.keys(rows[0]!)).not.toContain(names[0]);
  });

  it('nhãn rơi về số thứ tự khi buổi không có tên bài', () => {
    const rows = buildProgressRows(
      [{ order: 3, lessonTitle: '', completedAt: null, overallPercentage: 40, scores: [] }],
      [],
    );
    expect(rows[0]!.label).toBe('#3');
  });
});
