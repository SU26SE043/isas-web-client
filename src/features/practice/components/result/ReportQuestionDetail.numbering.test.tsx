// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
const q = (id: string, orderNo: number, label: string, kind = 'Seed'): QuestionResultViewModel => ({
  questionId: id,
  orderNo,
  label,
  kind,
  content: `Nội dung ${id}`,
  status: 'Scored',
  answered: true,
  skipped: false,
  criteria: [],
});
// 1 · 1.1 · 1.2 · 2 · 2.1 · 3 — vị trí mảng 0..5.
const questions = [
  q('q1', 1, '1'),
  q('q1a', 2, '1.1', 'Clarify'),
  q('q1b', 3, '1.2', 'FollowUp'),
  q('q2', 4, '2'),
  q('q2a', 5, '2.1', 'Clarify'),
  q('q3', 6, '3'),
];
const tabNames = () => screen.getAllByRole('tab').map((el) => el.textContent);
const headings = () => screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);

describe('Màn kết quả B2C — chỉ câu gốc trong dải tab, câu theo sau hiện cùng câu gốc', () => {
  it('dải tab chỉ có câu gốc 1 · 2 · 3, kèm +N câu theo sau; KHÔNG có tab 1.1 / 2.1', () => {
    render(<ReportQuestionDetail questions={questions} sessionId="s1" activeQuestionIndex={0} onQuestionChange={() => undefined} />);
    expect(tabNames()).toEqual(['Câu 1+2', 'Câu 2+1', 'Câu 3']);
    expect(screen.queryByRole('tab', { name: /1\.1/ })).not.toBeInTheDocument();
  });

  it('đang ở câu gốc 1 ⇒ thẻ 1 + thẻ 1.1 + thẻ 1.2 hiện cùng nhau, không hiện thẻ 2', () => {
    render(<ReportQuestionDetail questions={questions} sessionId="s1" activeQuestionIndex={0} onQuestionChange={() => undefined} />);
    expect(headings()).toEqual(['Câu 1', 'Câu 1.1', 'Câu 1.2']);
    expect(screen.getByText('practice.result.followUps · 2')).toBeInTheDocument();
  });

  it('deep-link vào câu đào sâu (?question=5 ⇒ 2.1) ⇒ tab 2 sáng và nhóm 2 mở, không phải nhóm 1', () => {
    render(<ReportQuestionDetail questions={questions} sessionId="s1" activeQuestionIndex={4} onQuestionChange={() => undefined} />);
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Câu 2');
    expect(headings()).toEqual(['Câu 2', 'Câu 2.1']);
  });

  it('bấm tab câu gốc 3 ⇒ onQuestionChange nhận VỊ TRÍ PHẲNG của câu gốc (5), không phải thứ tự tab (2)', () => {
    const onChange = vi.fn();
    render(<ReportQuestionDetail questions={questions} sessionId="s1" activeQuestionIndex={0} onQuestionChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Câu 3' }));
    expect(onChange).toHaveBeenCalledWith(5);
    fireEvent.click(screen.getByRole('tab', { name: /^Câu 2/ }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('câu gốc không có câu theo sau ⇒ không có khối "Câu theo sau"', () => {
    render(<ReportQuestionDetail questions={questions} sessionId="s1" activeQuestionIndex={5} onQuestionChange={() => undefined} />);
    expect(headings()).toEqual(['Câu 3']);
    expect(screen.queryByText(/practice\.result\.followUps ·/)).not.toBeInTheDocument();
  });

  it('thẻ câu in label, không in orderNo', () => {
    render(<PracticeQuestionResultCard defaultOpen sessionId="s1" question={q('q1b', 2, '1.1')} />);
    expect(screen.getByRole('heading', { name: 'Câu 1.1' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Câu 2' })).not.toBeInTheDocument();
  });
});
