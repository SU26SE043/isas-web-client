/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RubricCriterion } from '../../../types/campaignManagement.types';
import { QuestionScopePicker } from './QuestionScopePicker';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
afterEach(() => cleanup());

const rubric: RubricCriterion[] = [
  { id: 'c-comm', name: 'Giao tiếp', description: '', weight: 30, maxScore: 5, scoringScope: 'Always' },
  { id: 'c-fluency', name: 'Trôi chảy', description: '', weight: 10, maxScore: 5 },
  { id: 'c-depth', name: 'Chiều sâu', description: '', weight: 30, maxScore: 5, scoringScope: 'WhenTargeted' },
  { id: 'c-design', name: 'Thiết kế', description: '', weight: 30, maxScore: 5, scoringScope: 'WhenTargeted' },
];

describe('QuestionScopePicker — I2 ba trạng thái', () => {
  it('chỉ chip cho WhenTargeted; dòng "Luôn chấm" liệt kê Always (kể cả tiêu chí vắng scope); chưa chạm ⇒ KHÔNG gọi onChange', () => {
    const onChange = vi.fn();
    render(<QuestionScopePicker questionId="q1" rubric={rubric} value={null} onChange={onChange} />);
    expect(screen.getAllByRole('checkbox').map((chip) => chip.textContent)).toEqual(['Chiều sâu', 'Thiết kế']);
    expect(screen.getByText('employer.campaigns.questionCard.scope.untouched')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  // R8 — ĐỔI TIỀN ĐỀ: trước đây "thứ tự theo rubric, không theo thứ tự bấm" ⇒ thêm chip vào [B, A] thành [A, B, C]
  // ⇒ tiêu chí CHÍNH (nhãn[0], BE rút đều theo nó) đổi từ B sang A mà HR không biết. Nay giữ thứ tự hiện có.
  it('chọn 1 chip ⇒ [id]; chip thêm sau NỐI CUỐI (tiêu chí chính = phần tử đầu KHÔNG đổi), không sắp lại theo rubric', () => {
    const onChange = vi.fn();
    const { rerender } = render(<QuestionScopePicker questionId="q1" rubric={rubric} value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Thiết kế' }));
    expect(onChange).toHaveBeenLastCalledWith(['c-design']);
    rerender(<QuestionScopePicker questionId="q1" rubric={rubric} value={['c-design']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Chiều sâu' }));
    expect(onChange).toHaveBeenLastCalledWith(['c-design', 'c-depth']);
    expect(screen.getByRole('checkbox', { name: 'Thiết kế' })).toHaveAttribute('aria-checked', 'true');
  });

  it('R8: câu AI có nhãn [B, A] (ngược thứ tự rubric) ⇒ thêm C ⇒ [B, A, C]; bỏ B (đang là chính) ⇒ [A] — xoá tại chỗ, không sắp lại', () => {
    const onChange = vi.fn();
    const { rerender } = render(<QuestionScopePicker questionId="q1" rubric={rubric} value={['c-design', 'c-depth']} onChange={onChange} />);
    // Rubric có thêm tiêu chí C WhenTargeted để nối cuối.
    const rubricC = [...rubric, { id: 'c-algo', name: 'Thuật toán', description: '', weight: 0, maxScore: 5, scoringScope: 'WhenTargeted' as const }];
    rerender(<QuestionScopePicker questionId="q1" rubric={rubricC} value={['c-design', 'c-depth']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Thuật toán' }));
    expect(onChange).toHaveBeenLastCalledWith(['c-design', 'c-depth', 'c-algo']);
    rerender(<QuestionScopePicker questionId="q1" rubric={rubricC} value={['c-design', 'c-depth', 'c-algo']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Thiết kế' }));
    expect(onChange).toHaveBeenLastCalledWith(['c-depth', 'c-algo']);
  });

  it('bỏ chip cuối cùng ⇒ [] (đã xét, không nhắm) — KHÔNG quay về null; dòng giải thích đổi theo', () => {
    const onChange = vi.fn();
    render(<QuestionScopePicker questionId="q1" rubric={rubric} value={['c-depth']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Chiều sâu' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    cleanup();
    render(<QuestionScopePicker questionId="q1" rubric={rubric} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('employer.campaigns.questionCard.scope.empty')).toBeInTheDocument();
  });

  it('0 tiêu chí WhenTargeted ⇒ không chip, dòng giải thích + link sang bước 3', () => {
    const onGoToCriteria = vi.fn();
    render(<QuestionScopePicker questionId="q1" rubric={rubric.slice(0, 2)} value={null} onChange={vi.fn()} onGoToCriteria={onGoToCriteria} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.questionCard.scope.none')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.questionCard.scope.goToCriteria' }));
    expect(onGoToCriteria).toHaveBeenCalledTimes(1);
  });

  it('disabled ⇒ chip không bấm được', () => {
    const onChange = vi.fn();
    render(<QuestionScopePicker questionId="q1" rubric={rubric} value={null} disabled onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Chiều sâu' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
