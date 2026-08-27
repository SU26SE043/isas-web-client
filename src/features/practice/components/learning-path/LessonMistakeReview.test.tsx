// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_LESSON_MISTAKES } from '../../mocks/learningPath.fixtures';
import type { ApiLessonMistake } from '../../types/roadmap.api.types';
import { LessonMistakeReview, truncateAtWordBoundary } from './LessonMistakeReview';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(cleanup);

describe('LessonMistakeReview', () => {
  it.each([null, []])('does not render a shell for mistakes=%s', (mistakes) => {
    const { container } = render(<LessonMistakeReview mistakes={mistakes} />);
    expect(container.firstChild).toBeNull();
  });

  it('opens only the first mistake by default and keeps later mistakes collapsed', () => {
    render(<LessonMistakeReview mistakes={MOCK_LESSON_MISTAKES.mistakes} />);

    const firstToggle = screen.getByRole('button', { name: /Chiều sâu kỹ thuật/ });
    const secondToggle = screen.getByRole('button', { name: /Tư duy hệ thống/ });
    expect(firstToggle).toHaveAttribute('aria-expanded', 'true');
    expect(secondToggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('practice.learningPath.mistakes.question')).toBeInTheDocument();
    expect(screen.queryByText('Bạn xử lý giao dịch tạo đơn ra sao?')).toBeNull();
  });

  it('renders learner text literally, including markdown-like characters', () => {
    const learnerText = 'Dấu # ở giữa > không phải thẻ <strong>HTML</strong> *không phải danh sách';
    const mistake = { ...MOCK_LESSON_MISTAKES.mistakes?.[0], answer: learnerText } as ApiLessonMistake;
    const { container } = render(<LessonMistakeReview mistakes={[mistake]} />);

    expect(container.textContent).toContain(learnerText);
    expect(container.querySelector('h1,h2,h3,blockquote,ul,li')).toBeNull();
  });

  it('truncates long answers at a word boundary and reveals the full answer in place', () => {
    const answer = 'Một câu trả lời rất dài để kiểm tra cách rút gọn nội dung tại ranh giới từ trước giới hạn hiển thị đã chọn.'.repeat(3);
    expect(truncateAtWordBoundary(answer)).toMatch(/…$/u);
    expect(truncateAtWordBoundary(answer)).not.toContain('đã chọn.'.repeat(2));

    const mistake = { ...MOCK_LESSON_MISTAKES.mistakes?.[0], answer } as ApiLessonMistake;
    render(<LessonMistakeReview mistakes={[mistake]} />);
    expect(screen.queryByText(answer)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'practice.learningPath.mistakes.showFullAnswer' }));
    expect(screen.getByText(answer)).toBeInTheDocument();
  });

  it('keeps the sample answer collapsed until explicitly expanded', () => {
    const sampleAnswer = MOCK_LESSON_MISTAKES.mistakes?.[0]?.sampleAnswer ?? '';
    render(<LessonMistakeReview mistakes={MOCK_LESSON_MISTAKES.mistakes} />);

    expect(screen.queryByText(sampleAnswer)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'practice.learningPath.mistakes.showSampleAnswer' }));
    expect(screen.getByText(sampleAnswer)).toBeInTheDocument();
  });

  it('omits a label when an optional mistake value is null', () => {
    const mistake = { ...MOCK_LESSON_MISTAKES.mistakes?.[0], question: null } as unknown as ApiLessonMistake;
    render(<LessonMistakeReview mistakes={[mistake]} />);
    expect(screen.queryByText('practice.learningPath.mistakes.question')).toBeNull();
  });

  it('renders the older backend payload without throwing', () => {
    expect(() => render(<LessonMistakeReview mistakes={[{
      id: 'm1',
      whatWentWrong: 'Thiếu giải thích.',
      howToFixIt: 'Nêu rõ trade-off.',
    }]} />)).not.toThrow();
    expect(screen.getByText('Thiếu giải thích.')).toBeInTheDocument();
  });

  it('omits the answer section when answer is undefined', () => {
    render(<LessonMistakeReview mistakes={[{
      id: 'm1',
      criterionName: 'Tư duy hệ thống',
      question: 'Bạn xử lý lỗi thế nào?',
      whatWentWrong: 'Chưa nêu cách kiểm tra.',
    }]} />);
    expect(screen.getByText('practice.learningPath.mistakes.question')).toBeInTheDocument();
    expect(screen.getByText('practice.learningPath.mistakes.whatWentWrong')).toBeInTheDocument();
    expect(screen.queryByText('practice.learningPath.mistakes.answer')).toBeNull();
  });
});
