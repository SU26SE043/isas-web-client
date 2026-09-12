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
 * Nhãn "Câu N / M" và vòng tròn tô đậm trong stepper phải là CÙNG MỘT SỐ.
 *
 * Trước đây nhãn đếm theo thứ tự XUẤT HIỆN (map cấp số lúc hydrate: 5 câu gốc nhận 1..5, câu đào sâu
 * về sau nhận 6) còn stepper đếm theo VỊ TRÍ mảng ⇒ đo trên dev 2026-09-12: câu Clarify của câu 1
 * hiện "Câu hỏi 6 / 6" trong khi vòng tròn số 2 được tô đậm. Hai cách đếm trên cùng màn hình.
 */
describe('InterviewQuestionPanel — đánh số câu', () => {
  it('nhãn và vòng tròn tô đậm cùng một số khi câu đào sâu chèn ngay sau câu vừa trả lời', () => {
    const seeds = [question('s1', 1), question('s2', 5), question('s3', 9)];
    const { rerender } = render(
      <InterviewQuestionPanel currentIndex={0} totalQuestions={3} plannedTotal={3} remainingSeconds={100} question={seeds[0]} questions={seeds} />,
    );
    expect(screen.getByText('Câu 1/3')).toBeInTheDocument();
    expect(activeStep()).toBe('1');

    // Câu đào sâu của s1 về, `appendQuestion` chèn NGAY SAU s1 và nó thành câu hiện tại.
    const follow = question('f1', 2, 'Clarify');
    const withFollow = [seeds[0], follow, seeds[1], seeds[2]];
    rerender(
      <InterviewQuestionPanel currentIndex={1} totalQuestions={4} plannedTotal={4} remainingSeconds={100} question={follow} questions={withFollow} />,
    );
    // Không phải "Câu 4/4" (thứ tự xuất hiện) — là "Câu 2", đúng vòng tròn số 2 đang tô đậm.
    expect(screen.getByText('Câu 2/4')).toBeInTheDocument();
    expect(activeStep()).toBe('2');
  });

  it('quay lại buổi dở: đứng ở câu đầu chưa trả lời, nhãn khớp vòng tròn tô đậm', () => {
    // Server trả cả câu đào sâu đã xen kẽ (theo orderNo); 2 câu đầu đã nộp ⇒ hiện tại là chỉ số 2.
    const items = [question('s1', 1), question('f1', 2, 'Clarify'), question('s2', 5), question('s3', 9)];
    render(
      <InterviewQuestionPanel
        currentIndex={2}
        totalQuestions={4}
        plannedTotal={4}
        remainingSeconds={100}
        question={items[2]}
        questions={items}
        questionStates={{ s1: 'submitted', f1: 'submitted', s2: 'reading_question', s3: 'not_started' }}
      />,
    );
    expect(screen.getByText('Câu 3/4')).toBeInTheDocument();
    expect(activeStep()).toBe('3');
  });

  it('mẫu số là số câu đã chọn, không phình theo số câu đang có', () => {
    const items = [question('s1', 1), question('f1', 2)];
    render(
      <InterviewQuestionPanel currentIndex={0} totalQuestions={2} plannedTotal={20} remainingSeconds={100} question={items[0]} questions={items} />,
    );
    expect(screen.getByText('Câu 1/20')).toBeInTheDocument();
  });
});
