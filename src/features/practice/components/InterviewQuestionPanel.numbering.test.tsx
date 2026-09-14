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

const question = (id: string, orderNo: number, kind = 'Seed'): PracticeQuestionResponse => ({
  id,
  orderNo,
  content: `Nội dung ${id}`,
  timeLimitSec: 120,
  kind,
  citations: [],
});

// Vòng tròn đang tô đậm trong stepper (`aria-current="step"` nằm trên <span> số hiệu).
const activeStep = () => document.querySelector('[aria-current="step"]')?.textContent;

/**
 * Nhãn "Câu N / M" và vòng tròn tô đậm trong stepper phải là CÙNG MỘT SỐ, và số đó PHÂN CẤP:
 * câu gốc 1, 2, 3…; câu đào sâu 1.1, 1.2…; mẫu số = số câu GỐC.
 *
 * Lịch sử: nhãn từng đếm theo thứ tự XUẤT HIỆN (map cấp số lúc hydrate) còn stepper theo VỊ TRÍ ⇒ đo trên dev
 * 2026-09-12: câu Clarify của câu 1 hiện "Câu hỏi 6 / 6" với vòng tròn 2 tô đậm. Đánh số phẳng theo vị trí
 * thì thống nhất nhưng câu gốc phía sau bị đẩy lùi mỗi khi có câu đào sâu ⇒ user chốt kiểu 1 · 1.1 · 2.
 */
describe('InterviewQuestionPanel — đánh số câu phân cấp', () => {
  it('câu đào sâu chèn ngay sau câu 1 ⇒ "1.1", câu gốc kế vẫn là "2", mẫu số = số câu gốc', () => {
    const seeds = [question('s1', 1), question('s2', 5), question('s3', 9)];
    const { rerender } = render(
      <InterviewQuestionPanel currentIndex={0} totalQuestions={3} remainingSeconds={100} question={seeds[0]} questions={seeds} />,
    );
    expect(screen.getByText('Câu 1/3')).toBeInTheDocument();
    expect(activeStep()).toBe('1');

    // Câu đào sâu của s1 về, `appendQuestion` chèn NGAY SAU s1 và nó thành câu hiện tại.
    const follow = question('f1', 2, 'Clarify');
    const withFollow = [seeds[0], follow, seeds[1], seeds[2]];
    rerender(
      <InterviewQuestionPanel currentIndex={1} totalQuestions={4} remainingSeconds={100} question={follow} questions={withFollow} />,
    );
    expect(screen.getByText('Câu 1.1/3')).toBeInTheDocument();
    expect(activeStep()).toBe('1.1');
    // Vòng tròn theo thứ tự: 1 · 1.1 · 2 · 3 — s2 vẫn là "2", không bị đẩy thành "3".
    expect(Array.from(document.querySelectorAll('ol li span:last-child')).map((el) => el.textContent)).toEqual(['1', '1.1', '2', '3']);

    // Sang câu gốc thứ hai.
    rerender(
      <InterviewQuestionPanel currentIndex={2} totalQuestions={4} remainingSeconds={100} question={seeds[1]} questions={withFollow} />,
    );
    expect(screen.getByText('Câu 2/3')).toBeInTheDocument();
    expect(activeStep()).toBe('2');
  });

  it('quay lại buổi dở: nhãn khớp vòng tròn tô đậm, câu đào sâu đã nộp mang số con', () => {
    const items = [question('s1', 1), question('f1', 2, 'Clarify'), question('s2', 5), question('s3', 9)];
    render(
      <InterviewQuestionPanel
        currentIndex={2}
        totalQuestions={4}
        remainingSeconds={100}
        question={items[2]}
        questions={items}
        questionStates={{ s1: 'submitted', f1: 'submitted', s2: 'reading_question', s3: 'not_started' }}
      />,
    );
    expect(screen.getByText('Câu 2/3')).toBeInTheDocument();
    expect(activeStep()).toBe('2');
  });

  it('chưa có danh sách câu ⇒ rơi về vị trí + tổng khai báo (vòng tròn rỗng)', () => {
    render(<InterviewQuestionPanel currentIndex={0} totalQuestions={5} remainingSeconds={100} />);
    expect(screen.getByText('Câu 1/5')).toBeInTheDocument();
  });
});
