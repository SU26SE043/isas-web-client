// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { QuestionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { PracticeQuestionResultCard } from './PracticeQuestionResultCard';
import { ReportQuestionDetail } from './ReportQuestionDetail';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => (key === 'practice.result.question' ? 'Câu' : key), language: 'vi' }),
}));

afterEach(cleanup);

// `label` ≠ `orderNo` CỐ Ý ở mọi câu — fixture hai giá trị trùng nhau (orderNo 1 / label "1") làm phép hoán đổi
// label↔orderNo xanh oan (đúng bẫy seed-trùng của vòng 2026-08-13).
const q = (id: string, orderNo: number, label: string): QuestionResultViewModel => ({
  questionId: id,
  orderNo,
  label,
  content: `Nội dung ${id}`,
  status: 'Scored',
  answered: true,
  skipped: false,
  criteria: [],
});
const questions = [q('q1', 1, '1'), q('q1b', 2, '1.1'), q('q2', 3, '2')];

describe('Màn kết quả B2C — số hiệu phân cấp', () => {
  it('dải tab in 1 · 1.1 · 2 (label), không in vị trí mảng', () => {
    render(<ReportQuestionDetail questions={questions} sessionId="s1" activeQuestionIndex={1} onQuestionChange={() => undefined} />);
    expect(screen.getByRole('tab', { name: 'Câu 1.1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Câu 2' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Câu 3' })).not.toBeInTheDocument();
  });

  it('thẻ câu in label, không in orderNo', () => {
    render(<PracticeQuestionResultCard defaultOpen sessionId="s1" question={q('q1b', 2, '1.1')} />);
    expect(screen.getByRole('heading', { name: 'Câu 1.1' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Câu 2' })).not.toBeInTheDocument();
  });
});
