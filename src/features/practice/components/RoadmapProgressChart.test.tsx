import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('recharts', async () => await import('./__rechartsStub'));
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));

import { RoadmapProgressChart } from './RoadmapProgressChart';
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

function lines() {
  return Array.from(document.querySelectorAll('[data-stub="Line"]'));
}

describe('RoadmapProgressChart', () => {
  afterEach(() => cleanup());

  it('progress RỖNG ⇒ không render biểu đồ nào, chỉ có lời giải thích', () => {
    render(<RoadmapProgressChart progress={[]} />);
    expect(screen.getByText('practice.learningPath.progressChartTooFew')).toBeInTheDocument();
    expect(document.querySelector('[data-stub="LineChart"]')).toBeNull();
    expect(screen.queryByTestId('roadmap-progress-chart')).not.toBeInTheDocument();
  });

  it('CHỈ MỘT buổi ⇒ vẫn không vẽ: một điểm không phải một xu hướng', () => {
    render(<RoadmapProgressChart progress={[point(1, 70)]} />);
    expect(document.querySelector('[data-stub="LineChart"]')).toBeNull();
    expect(screen.getByText('practice.learningPath.progressChartTooFew')).toBeInTheDocument();
  });

  it('từ hai buổi trở lên ⇒ vẽ, mặc định CHỈ đường điểm tổng', () => {
    render(
      <RoadmapProgressChart
        progress={[point(1, 40, [['Giao tiếp', 40]]), point(2, 72, [['Giao tiếp', 72]])]}
      />,
    );
    expect(screen.getByTestId('roadmap-progress-chart')).toBeInTheDocument();
    expect(lines()).toHaveLength(1);
    expect(lines()[0]!.getAttribute('data-key')).toBe('overall');
  });

  it('đường phải HỞ ở chỗ khuyết — connectNulls tắt', () => {
    render(<RoadmapProgressChart progress={[point(1, 40), point(2, 72)]} />);
    expect(lines()[0]!.getAttribute('data-connect-nulls')).toBe('false');
  });

  it('bật một tiêu chí thì mới thêm đường của tiêu chí đó', async () => {
    const user = userEvent.setup();
    render(
      <RoadmapProgressChart
        progress={[
          point(1, 40, [['Giao tiếp', 40], ['Thuật ngữ', 30]]),
          point(2, 72, [['Giao tiếp', 72], ['Thuật ngữ', 66]]),
        ]}
      />,
    );
    expect(lines()).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /Giao tiếp/ }));
    expect(lines()).toHaveLength(2);
    expect(lines()[1]!.getAttribute('data-name')).toBe('Giao tiếp');
    expect(lines()[1]!.getAttribute('data-connect-nulls')).toBe('false');
    /*
      Khoá luôn ĐƯỜNG TRA CỨU, không chỉ khoá cái nhãn.
      `data-name` chỉ là chữ hiện ở chú thích; thứ quyết định đường có vẽ ra gì hay
      không là `dataKey`. Trỏ nó vào tên tiêu chí thì recharts tra một khoá không tồn
      tại trong hàng dữ liệu (và với tên có dấu chấm thì nó còn hiểu là đường dẫn a.b)
      ⇒ đường vẽ RỖNG mà không lỗi ở đâu cả — đúng lớp lỗi khoá dữ liệu đang chặn.
    */
    const key = lines()[1]!.getAttribute('data-key')!;
    expect(key).toBe('crit_0');
    const rows = JSON.parse(
      document.querySelector('[data-stub="LineChart"]')!.getAttribute('data-chart-data')!,
    ) as Array<Record<string, unknown>>;
    expect(Object.keys(rows[0]!)).toContain(key);

    // Bấm lại để tắt.
    await user.click(screen.getByRole('button', { name: /Giao tiếp/ }));
    expect(lines()).toHaveLength(1);
  });

  it('vẽ đường ngang ngưỡng khi biết ngưỡng', () => {
    render(<RoadmapProgressChart progress={[point(1, 40), point(2, 72)]} threshold={60} />);
    const ref = document.querySelector('[data-stub="ReferenceLine"]');
    expect(ref).not.toBeNull();
    expect(ref!.getAttribute('data-y')).toBe('60');
  });

  it('ngưỡng null = KHÔNG BIẾT ⇒ không vẽ đường ngang bịa ra 0%', () => {
    render(<RoadmapProgressChart progress={[point(1, 40), point(2, 72)]} threshold={null} />);
    expect(document.querySelector('[data-stub="ReferenceLine"]')).toBeNull();
  });

  it('dữ liệu đưa vào biểu đồ giữ null cho buổi không chấm tiêu chí', () => {
    render(
      <RoadmapProgressChart
        progress={[point(1, 40, [['Giao tiếp', 40]]), point(2, 72, [['Giao tiếp', 72], ['Thuật ngữ', 66]])]}
      />,
    );
    const chart = document.querySelector('[data-stub="LineChart"]')!;
    const rows = JSON.parse(chart.getAttribute('data-chart-data')!) as Array<Record<string, unknown>>;
    expect(rows[0]!.crit_1).toBeNull();
    expect(rows[1]!.crit_1).toBe(66);
  });
});
