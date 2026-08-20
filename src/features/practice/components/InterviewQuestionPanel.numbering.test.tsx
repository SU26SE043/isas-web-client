// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InterviewQuestionPanel } from './InterviewQuestionPanel';
import type { PracticeQuestionResponse } from '../types/b2cPracticeSession.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => (key === 'practice.room.questionOf' ? 'Câu {current}/{total}' : key),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const question = (id: string, orderNo: number): PracticeQuestionResponse => ({
  id,
  orderNo,
  content: `Nội dung ${id}`,
  timeLimitSec: 120,
  kind: 'Seed',
  citations: [],
});

/**
 * Số hiệu câu KHÔNG được đổi sau khi đã hiện.
 *
 * Backend cố ý đánh `orderNo` có khoảng trống (câu gốc 1, 5, 9… — `SeedOrderStride`) để chuỗi đào
 * sâu chèn vào giữa, và trả danh sách đã sắp theo `orderNo`. Câu đào sâu của câu 1 mang `orderNo=2`
 * nên nó chen vào GIỮA mảng — nếu số hiệu lấy từ vị trí mảng thì câu gốc thứ hai đang là "Câu 2" sẽ
 * nhảy thành "Câu 3" ngay trước mắt ứng viên.
 */
describe('InterviewQuestionPanel — đánh số câu', () => {
  it('giữ nguyên số hiệu của câu đã hiện khi câu đào sâu chèn vào giữa', () => {
    const seed1 = question('s1', 1);
    const seed2 = question('s2', 5);

    const { rerender } = render(
      <InterviewQuestionPanel
        currentIndex={1}
        totalQuestions={2}
        displayNumber={2}
        plannedTotal={6}
        remainingSeconds={100}
        question={seed2}
        questions={[seed1, seed2]}
      />,
    );
    expect(screen.getByText('Câu 2/6')).toBeInTheDocument();

    // Câu đào sâu về, chen vào giữa: mảng thành [s1, f1, s2] ⇒ vị trí của s2 nhảy từ 1 lên 2.
    const follow = question('f1', 2);
    rerender(
      <InterviewQuestionPanel
        currentIndex={2}
        totalQuestions={3}
        displayNumber={2}
        plannedTotal={6}
        remainingSeconds={100}
        question={seed2}
        questions={[seed1, follow, seed2]}
      />,
    );

    // Vẫn là "Câu 2" — số đã cấp cho s2 không đổi, dù nó đã trôi sang vị trí khác.
    expect(screen.getByText('Câu 2/6')).toBeInTheDocument();
  });

  it('mẫu số là số câu đã chọn, không phình theo số câu đang có', () => {
    const items = [question('s1', 1), question('f1', 2)];
    render(
      <InterviewQuestionPanel
        currentIndex={0}
        totalQuestions={2}
        displayNumber={1}
        plannedTotal={20}
        remainingSeconds={100}
        question={items[0]}
        questions={items}
      />,
    );
    expect(screen.getByText('Câu 1/20')).toBeInTheDocument();
  });

  it('không có số hiệu thì rơi về vị trí mảng — giữ tương thích call site cũ', () => {
    const items = [question('s1', 1), question('s2', 5)];
    render(
      <InterviewQuestionPanel
        currentIndex={1}
        totalQuestions={2}
        remainingSeconds={100}
        question={items[1]}
        questions={items}
      />,
    );
    expect(screen.getByText('Câu 2/2')).toBeInTheDocument();
  });
});
