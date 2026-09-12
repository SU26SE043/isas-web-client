/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goodRun, sample } from '../../../mocks/rubricPreview.fixtures';
import type { RubricPreviewSampleScore } from '../../../types/rubricPreview.types';
import { isOffExpected, offBy, RubricPreviewResultTable } from './RubricPreviewResultTable';

const messages: Record<string, string> = {
  'employer.campaigns.rubricPreview.band.Weak': 'Yếu',
  'employer.campaigns.rubricPreview.band.Good': 'Khá',
  'employer.campaigns.rubricPreview.band.Excellent': 'Xuất sắc',
  'employer.campaigns.rubricPreview.band.Custom': 'Của bạn',
  'employer.campaigns.rubricPreview.details.expectedLevel': 'mốc kỳ vọng {{level}}',
  'employer.campaigns.rubricPreview.details.wordCount': '{{n}} từ',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

afterEach(cleanup);

const score = (criterionId: string, name: string, expectedLevel: number, actualScore: number, levelMatched: number | null, reasoning: string | null): RubricPreviewSampleScore => ({
  criterionId, criterionName: name, maxScore: 5, expectedLevel, actualScore, levelMatched, reasoning,
});

describe('RubricPreviewResultTable — tầng 2', () => {
  const run = goodRun({
    samples: [
      sample('Weak', 20, 18, [score('c-depth', 'Chiều sâu kỹ thuật', 1, 1, 1, 'Trích: "chỉ nêu tên công cụ"'), score('c-comm', 'Giao tiếp', 1, 3, 3, null)]),
      sample('Good', 60, 62, [score('c-depth', 'Chiều sâu kỹ thuật', 3, 3, 3, 'ok'), score('c-comm', 'Giao tiếp', 3, 3, 3, 'ok')]),
      sample('Excellent', 100, 88, [score('c-depth', 'Chiều sâu kỹ thuật', 5, 4, 4, 'thiếu trade-off'), score('c-comm', 'Giao tiếp', 5, 5, 5, 'ok')]),
      sample('Custom', 0, 50, [score('c-depth', 'Chiều sâu kỹ thuật', 0, 2, 2, 'custom'), score('c-comm', 'Giao tiếp', 0, 3, 3, 'custom')]),
    ],
  });

  it('ô = điểm/max + mốc kỳ vọng; ô lệch mức tô cảnh báo; Custom không có mốc kỳ vọng', () => {
    render(<RubricPreviewResultTable run={run} />);
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
    const depthRow = rows[1];
    expect(within(depthRow).getByText('Chiều sâu kỹ thuật')).toBeInTheDocument();
    const weakCell = within(depthRow).getByRole('button', { name: /Chiều sâu kỹ thuật · Yếu/ });
    expect(weakCell).toHaveTextContent('1/5');
    expect(weakCell).toHaveTextContent('mốc kỳ vọng 1');
    expect(weakCell).not.toHaveClass('text-warning');
    const commWeak = within(rows[2]).getByRole('button', { name: /Giao tiếp · Yếu/ });
    expect(commWeak).toHaveTextContent('3/5');
    expect(commWeak).toHaveClass('text-warning');
    const customCell = within(depthRow).getByRole('button', { name: /Chiều sâu kỹ thuật · Của bạn/ });
    expect(customCell).toHaveTextContent('2/5');
    expect(customCell).not.toHaveTextContent('mốc kỳ vọng');
    expect(customCell).not.toHaveClass('text-warning');
  });

  it('H3: phân bậc lệch — 1 mức = mũi tên + chữ xám (không ⚠), ≥2 mức = cam + ⚠; đúng mức = không mũi tên', () => {
    render(<RubricPreviewResultTable run={run} />);
    const rows = screen.getAllByRole('row');
    // Xuất sắc · Chiều sâu: 4/5 kỳ vọng 5 ⇒ lệch −1 ⇒ nhẹ.
    const mild = within(rows[1]).getByRole('button', { name: /Chiều sâu kỹ thuật · Xuất sắc/ });
    expect(mild).toHaveTextContent('↓1 · mốc kỳ vọng 5');
    expect(mild).not.toHaveClass('text-warning');
    expect(mild.querySelector('svg')).toBeNull();
    expect(mild.closest('td')).toHaveAttribute('data-off', '-1');
    // Yếu · Giao tiếp: 3/5 kỳ vọng 1 ⇒ lệch +2 ⇒ nghiêm trọng.
    const severe = within(rows[2]).getByRole('button', { name: /Giao tiếp · Yếu/ });
    expect(severe).toHaveTextContent('↑2 · mốc kỳ vọng 1');
    expect(severe).toHaveClass('text-warning');
    expect(severe.querySelector('svg')).not.toBeNull();
    // Khá · Chiều sâu: 3/5 kỳ vọng 3 ⇒ đúng mức.
    const exact = within(rows[1]).getByRole('button', { name: /Chiều sâu kỹ thuật · Khá/ });
    expect(exact).not.toHaveTextContent('↑');
    expect(exact).not.toHaveTextContent('↓');
    expect(exact.closest('td')).toHaveAttribute('data-off', '0');
  });

  it('offBy: so theo MỨC đã chọn, không theo điểm; không có mức thì làm tròn điểm; Custom luôn 0', () => {
    expect(offBy(score('c', 'x', 3, 4.6, 5, null), 'Good')).toBe(2);
    expect(offBy(score('c', 'x', 3, 4.6, null, null), 'Good')).toBe(2);
    expect(offBy(score('c', 'x', 3, 2.4, null, null), 'Good')).toBe(-1);
    expect(offBy(score('c', 'x', 0, 5, 5, null), 'Custom')).toBe(0);
  });

  it('bấm ô mở lý do chấm; ô không có lý do nói rõ là không có', async () => {
    const user = userEvent.setup();
    render(<RubricPreviewResultTable run={run} />);
    await user.click(screen.getByRole('button', { name: /Chiều sâu kỹ thuật · Yếu/ }));
    expect(await screen.findByText('Trích: "chỉ nêu tên công cụ"')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.details.close' }));
    await user.click(screen.getByRole('button', { name: /Giao tiếp · Yếu/ }));
    expect(await screen.findByText('employer.campaigns.rubricPreview.details.noReasoning')).toBeInTheDocument();
  });

  it('bấm cột bài mở nguyên văn + số từ', async () => {
    const user = userEvent.setup();
    render(<RubricPreviewResultTable run={run} />);
    await user.click(screen.getByRole('button', { name: /openAnswer: Xuất sắc/ }));
    expect(await screen.findByText('Bài Excellent — nội dung trả lời mẫu.')).toBeInTheDocument();
    expect(screen.getByText('210 từ')).toBeInTheDocument();
  });

  it('isOffExpected: so theo MỐC khi có, theo điểm khi không; Custom không bao giờ lệch', () => {
    expect(isOffExpected(score('c', 'n', 3, 3, 4, null), 'Good')).toBe(true);
    expect(isOffExpected(score('c', 'n', 3, 2, 3, null), 'Good')).toBe(false);
    expect(isOffExpected(score('c', 'n', 3, 2.5, null, null), 'Good')).toBe(false);
    expect(isOffExpected(score('c', 'n', 3, 1, null, null), 'Good')).toBe(true);
    expect(isOffExpected(score('c', 'n', 0, 5, 5, null), 'Custom')).toBe(false);
  });
});
