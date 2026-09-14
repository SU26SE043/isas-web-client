/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import type { RubricPreviewRun } from '../../../types/rubricPreview.types';
import { goodRun } from '../../../mocks/rubricPreview.fixtures';
import { QuestionPreviewSummaryLine, countPreviewedQuestions, countUnlabeledQuestions } from './QuestionPreviewSummaryLine';

// Khoá CON SỐ chứ không chỉ khoá key: mock `t` trả chuỗi có placeholder cho hai key mang số (mẫu T9).
const messages: Record<string, string> = {
  'employer.campaigns.review.previewSummary.count': 'Đã chấm thử {{n}}/{{k}} câu.',
  'employer.campaigns.review.previewSummary.unlabeled': '{{m}} câu chưa gắn tiêu chí.',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

const hook = vi.hoisted(() => ({ args: [] as unknown[], runs: [] as unknown[] }));
vi.mock('../../../hooks/useRubricPreview', () => ({
  useRubricPreview: (options: unknown) => {
    hook.args.push(options);
    return { runs: hook.runs, latest: null, isLoadingHistory: false, isRunning: false, freeRunsRemaining: null, error: null, run: vi.fn(), clearError: vi.fn(), billingConfirm: null, clearBillingConfirm: vi.fn() };
  },
}));

afterEach(() => {
  cleanup();
  hook.args = [];
  hook.runs = [];
});

const QA = '11111111-1111-4111-8111-111111111111';
const QB = '22222222-2222-4222-8222-222222222222';
const QC = '33333333-3333-4333-8333-333333333333';
const q = (id: string, targets?: string[] | null): CampaignQuestion => ({ id, prompt: `Prompt ${id}`, skill: '', difficulty: 'middle', source: 'manual', isRequired: true, targetCriterionIds: targets });
const run = (id: string, questionId: string, status: RubricPreviewRun['status']) => goodRun({ id, questionId, status });
const withTargetable: RubricCriterion[] = [
  { id: 'c-a', name: 'Giao tiếp', description: '', weight: 50, maxScore: 5, scoringScope: 'Always' },
  { id: 'c-b', name: 'Chiều sâu', description: '', weight: 50, maxScore: 5, scoringScope: 'WhenTargeted' },
];
const allAlways: RubricCriterion[] = withTargetable.map((item) => ({ ...item, scoringScope: 'Always' }));

describe('QuestionPreviewSummaryLine — dòng tóm tắt bước 8 (SC2 · T10, D-1)', () => {
  it('0 lượt ⇒ "0/K"; hook đọc đúng campaignId (một cache chung với các card)', () => {
    render(<QuestionPreviewSummaryLine campaignId="c-1" questions={[q(QA), q(QB), q(QC)]} />);
    expect(screen.getByTestId('question-preview-summary-count')).toHaveTextContent('Đã chấm thử 0/3 câu.');
    expect(hook.args[0]).toEqual({ campaignId: 'c-1' });
  });

  it('n = số câu có ≥1 lượt Succeeded: 2 lượt cùng câu đếm 1; câu chỉ có lượt Failed KHÔNG đếm ⇒ "2/3"', () => {
    hook.runs = [run('r1', QA, 'Succeeded'), run('r2', QA, 'Succeeded'), run('r3', QB, 'Succeeded'), run('r4', QC, 'Failed')];
    render(<QuestionPreviewSummaryLine campaignId="c-1" questions={[q(QA), q(QB), q(QC)]} />);
    expect(screen.getByTestId('question-preview-summary-count')).toHaveTextContent('Đã chấm thử 2/3 câu.');
  });

  it('câu id TẠM (chưa lưu) không đếm vào n dù có lượt trùng id; vẫn đếm vào K', () => {
    hook.runs = [run('r1', 'question-1', 'Succeeded'), run('r2', QA, 'Succeeded')];
    render(<QuestionPreviewSummaryLine campaignId="c-1" questions={[q('question-1'), q(QA)]} />);
    expect(screen.getByTestId('question-preview-summary-count')).toHaveTextContent('Đã chấm thử 1/2 câu.');
  });

  it('m câu chưa gắn tiêu chí = null LẪN [] — chỉ hiện khi rubric có ≥1 WhenTargeted', () => {
    const questions = [q(QA, null), q(QB, []), q(QC, ['c-b'])];
    const { unmount } = render(<QuestionPreviewSummaryLine campaignId="c-1" questions={questions} rubric={withTargetable} />);
    expect(screen.getByTestId('question-preview-summary-unlabeled')).toHaveTextContent('2 câu chưa gắn tiêu chí.');
    unmount();

    render(<QuestionPreviewSummaryLine campaignId="c-1" questions={questions} rubric={allAlways} />);
    expect(screen.queryByTestId('question-preview-summary-unlabeled')).not.toBeInTheDocument();
    cleanup();

    render(<QuestionPreviewSummaryLine campaignId="c-1" questions={questions} />);
    expect(screen.queryByTestId('question-preview-summary-unlabeled')).not.toBeInTheDocument();
    cleanup();

    render(<QuestionPreviewSummaryLine campaignId="c-1" questions={[q(QA, ['c-b'])]} rubric={withTargetable} />);
    expect(screen.queryByTestId('question-preview-summary-unlabeled')).not.toBeInTheDocument();
  });

  it('campaignId null ⇒ chỉ dòng "chưa lưu", không có n/K, không đếm nhãn', () => {
    render(<QuestionPreviewSummaryLine campaignId={null} questions={[q(QA, null)]} rubric={withTargetable} />);
    expect(screen.getByTestId('question-preview-summary-unsaved')).toHaveTextContent('employer.campaigns.review.previewSummary.unsaved');
    expect(screen.queryByTestId('question-preview-summary-count')).not.toBeInTheDocument();
    expect(screen.queryByTestId('question-preview-summary-unlabeled')).not.toBeInTheDocument();
    expect(hook.args[0]).toEqual({ campaignId: null });
  });

  it('link "Sang bước 4" gọi onGoToQuestions; vắng callback ⇒ không có nút', () => {
    const onGoToQuestions = vi.fn();
    const { unmount } = render(<QuestionPreviewSummaryLine campaignId="c-1" questions={[q(QA)]} onGoToQuestions={onGoToQuestions} />);
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.review.previewSummary.goToQuestions' }));
    expect(onGoToQuestions).toHaveBeenCalledOnce();
    unmount();

    render(<QuestionPreviewSummaryLine campaignId="c-1" questions={[q(QA)]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('D-1: thuần thông tin — role="status", KHÔNG role="alert" (alert = chặn phát hành như K-rule), KHÔNG nút chạy', () => {
    hook.runs = [];
    render(<QuestionPreviewSummaryLine campaignId="c-1" questions={[q(QA, null), q(QB, null)]} rubric={withTargetable} />);
    expect(screen.getByTestId('question-preview-summary')).toHaveAttribute('role', 'status');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'employer.campaigns.rubricPreview.run' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' })).not.toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.review.previewSummary.optional')).toBeInTheDocument();
  });
});

describe('countPreviewedQuestions / countUnlabeledQuestions', () => {
  it('đếm theo run.questionId + status Succeeded; nhãn rỗng và null đều là "chưa gắn"', () => {
    expect(countPreviewedQuestions([q(QA), q(QB)], [run('r', QA, 'Succeeded'), run('r2', QB, 'Running')])).toBe(1);
    expect(countUnlabeledQuestions([q(QA), q(QB, []), q(QC, ['c-b'])])).toBe(2);
  });
});
