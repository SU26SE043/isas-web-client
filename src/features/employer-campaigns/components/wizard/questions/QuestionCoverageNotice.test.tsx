/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import { QuestionCoverageNotice } from './QuestionCoverageNotice';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => (key === 'employer.campaigns.questionCard.coverage.item' ? '{{name}} — sẽ bị loại khỏi điểm.' : key),
  }),
}));
afterEach(() => cleanup());

const rubric: RubricCriterion[] = [
  { id: 'c-a', name: 'Giao tiếp', description: '', weight: 40, maxScore: 5, scoringScope: 'Always' },
  { id: 'c-b', name: 'Chiều sâu', description: '', weight: 30, maxScore: 5, scoringScope: 'WhenTargeted' },
  { id: 'c-c', name: 'Thiết kế', description: '', weight: 30, maxScore: 5, scoringScope: 'WhenTargeted' },
];
// isRequired=false: câu bắt buộc luôn được rút ⇒ không bao giờ rơi tiêu chí (BUG-2) — K-rule chỉ có nghĩa với câu tuỳ chọn.
const q = (id: string, targets: string[] | null): CampaignQuestion => ({ id, prompt: 'Q', skill: '', difficulty: 'middle', source: 'manual', isRequired: false, targetCriterionIds: targets });

describe('QuestionCoverageNotice', () => {
  it('có rubric ⇒ bao phủ tính CỤC BỘ (nhãn chưa lưu vẫn tính), bỏ qua số server', () => {
    render(<QuestionCoverageNotice questions={[q('q1', ['c-b'])]} questionsPerSession={null} rubric={rubric} serverCoverageWarnings={[{ criterionId: 'c-b', name: 'Chiều sâu' }]} />);
    const box = screen.getByTestId('question-coverage');
    expect(box).toHaveTextContent('Thiết kế');
    expect(box).not.toHaveTextContent('Chiều sâu');
    expect(screen.queryByTestId('question-k-rule')).not.toBeInTheDocument();
  });

  it('không rubric ⇒ dùng coverageWarnings server; vắng cả hai ⇒ không render', () => {
    const { unmount } = render(<QuestionCoverageNotice questions={[]} questionsPerSession={null} serverCoverageWarnings={[{ criterionId: 'c-c', name: 'Thiết kế' }]} />);
    expect(screen.getByTestId('question-coverage')).toHaveTextContent('Thiết kế');
    unmount();
    const { container } = render(<QuestionCoverageNotice questions={[]} questionsPerSession={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('K-rule cục bộ: K=1 < 2 tiêu chí chính ⇒ khối lỗi (chặn phát hành) kèm số', () => {
    render(<QuestionCoverageNotice questions={[q('q1', ['c-b']), q('q2', ['c-c'])]} questionsPerSession={1} rubric={rubric} />);
    expect(screen.getByTestId('question-k-rule')).toHaveTextContent('employer.campaigns.questionCard.coverage.kRule');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // R4 (khe nối): notice phải TRUYỀN rubric xuống K-rule — nhãn[0] trỏ tiêu chí Always (HR lật scope sau khi gắn) không
  // phải tiêu chí chính ⇒ K=1 với q1 [A(Always)] + q2 [C] chỉ có 1 tiêu chí chính ⇒ KHÔNG chặn.
  it('R4: nhãn[0] trỏ tiêu chí Always không đếm là tiêu chí chính ⇒ K=1 không chặn', () => {
    const { container } = render(<QuestionCoverageNotice questions={[q('q1', ['c-a']), q('q2', ['c-c'])]} questionsPerSession={1} rubric={rubric} />);
    expect(container.querySelector('[data-testid="question-k-rule"]')).toBeNull();
  });

  it('BUG-2: câu bắt buộc chiếm khe — K=2, q4 bắt buộc KHÔNG nhãn + q1 [B] + q2 [C] ⇒ chặn; q4 bắt buộc [C] ⇒ KHÔNG chặn', () => {
    const { unmount } = render(<QuestionCoverageNotice questions={[{ ...q('q4', null), isRequired: true }, q('q1', ['c-b']), q('q2', ['c-c'])]} questionsPerSession={2} rubric={rubric} />);
    expect(screen.getByTestId('question-k-rule')).toBeInTheDocument();
    unmount();
    render(<QuestionCoverageNotice questions={[{ ...q('q4', ['c-c']), isRequired: true }, q('q1', ['c-b']), q('q2', ['c-c'])]} questionsPerSession={2} rubric={rubric} />);
    expect(screen.queryByTestId('question-k-rule')).not.toBeInTheDocument();
  });

  it('K-rule server (chuỗi có tiền tố K_BELOW_CRITERIA_GROUPS) ⇒ khối lỗi, bỏ tiền tố mã; cảnh báo mềm KHÔNG vào đây', () => {
    render(<QuestionCoverageNotice questions={[]} questionsPerSession={null} questionBankWarnings={['K_BELOW_CRITERIA_GROUPS: questions_per_session (2) nhỏ hơn số tiêu chí chính (3).', 'Cảnh báo mềm']} />);
    const box = screen.getByTestId('question-k-rule');
    expect(box).toHaveTextContent('questions_per_session (2)');
    expect(box).not.toHaveTextContent('K_BELOW_CRITERIA_GROUPS');
    expect(box).not.toHaveTextContent('Cảnh báo mềm');
  });
});
