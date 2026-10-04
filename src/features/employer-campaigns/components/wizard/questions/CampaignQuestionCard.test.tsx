/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import type { QuestionPreviewContext } from '../../../types/questionPreview.types';
import type { UseQuestionPreviewApi } from '../../../types/rubricPreview.types';
import { CampaignQuestionCard } from './CampaignQuestionCard';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(() => cleanup());

const baseQuestion: CampaignQuestion = {
  id: 'question-1',
  prompt: 'Tell us about a recent project.',
  skill: 'frontend',
  difficulty: 'middle',
  source: 'ai',
  isRequired: false,
};

const handlers = () => ({
  onChangePrompt: vi.fn(), onToggleRequired: vi.fn(), onChangeGroup: vi.fn(), onMoveUp: vi.fn(), onMoveDown: vi.fn(), onRemove: vi.fn(),
});

const rubric: RubricCriterion[] = [
  { id: 'c-a', name: 'Giao tiếp', description: '', weight: 25, maxScore: 5, scoringScope: 'Always' },
  { id: 'c-b', name: 'Chiều sâu', description: '', weight: 25, maxScore: 5, scoringScope: 'WhenTargeted' },
  { id: 'c-c', name: 'Thiết kế', description: '', weight: 25, maxScore: 5, scoringScope: 'WhenTargeted' },
  { id: 'c-d', name: 'Bảo mật', description: '', weight: 25, maxScore: 5, scoringScope: 'WhenTargeted' },
];

describe('CampaignQuestionCard placement', () => {
  it('uses a placement menu instead of a required checkbox', () => {
    render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} {...handlers()} /></ul>);

    expect(screen.getByRole('combobox', { name: 'employer.campaigns.campaignQuestions.question.placement' })).toHaveValue('pool');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});

describe('CampaignQuestionCard — Collapsible (SC2 · T9)', () => {
  it('đóng: panel VẪN trong DOM (keepMounted) nhưng hidden; mở: hiện; bấm hàng đầu ⇒ onOpenChange', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open={false} onOpenChange={onOpenChange} {...handlers()} /></ul>);
    const panel = screen.getByTestId('question-card-panel');
    expect(panel).toHaveAttribute('hidden');
    expect(screen.getByRole('textbox', { hidden: true })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'employer.campaigns.campaignQuestions.question.placement' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tell us about a recent project/ }));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open onOpenChange={onOpenChange} {...handlers()} /></ul>);
    expect(screen.getByTestId('question-card-panel')).not.toHaveAttribute('hidden');
    expect(screen.getByRole('combobox', { name: 'employer.campaigns.campaignQuestions.question.placement' })).toBeInTheDocument();
  });

  it('không controlled: card đầu (index 0) mặc định mở, card khác đóng', () => {
    render(<ul><CampaignQuestionCard question={baseQuestion} index={1} total={2} {...handlers()} /></ul>);
    expect(screen.getByTestId('question-card-panel')).toHaveAttribute('hidden');
  });

  it('nút lên/xuống/xoá nằm NGOÀI trigger (không lồng button trong button)', () => {
    render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={2} open {...handlers()} /></ul>);
    const trigger = screen.getByRole('button', { name: /Tell us about a recent project/ });
    expect(trigger.querySelector('button')).toBeNull();
    expect(screen.getByRole('button', { name: 'employer.campaigns.campaignQuestions.question.delete' })).toBeInTheDocument();
  });

  it('chip tiêu chí ở hàng đầu khớp targetCriterionIds: tối đa 2 tên + "+n"; id lệch rubric bị bỏ', () => {
    render(<ul><CampaignQuestionCard question={{ ...baseQuestion, targetCriterionIds: ['c-b', 'c-c', 'c-d', 'id-la'] }} index={0} total={1} rubric={rubric} onChangeTargets={vi.fn()} {...handlers()} /></ul>);
    expect(screen.getAllByTestId('question-card-criterion-chip').map((chip) => chip.textContent)).toEqual(['Chiều sâu', 'Thiết kế']);
    expect(screen.getByTestId('question-card-criterion-more')).toHaveTextContent('employer.campaigns.questionCard.moreCriteria');
  });

  it('không rubric ⇒ không picker, không chip; có rubric ⇒ picker ghi qua onChangeTargets', () => {
    const { unmount } = render(<ul><CampaignQuestionCard question={{ ...baseQuestion, targetCriterionIds: ['c-b'] }} index={0} total={1} open {...handlers()} /></ul>);
    expect(screen.queryByTestId('question-scope-picker')).not.toBeInTheDocument();
    expect(screen.queryByTestId('question-card-criterion-chip')).not.toBeInTheDocument();
    unmount();
    const onChangeTargets = vi.fn();
    render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open rubric={rubric} onChangeTargets={onChangeTargets} {...handlers()} /></ul>);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Bảo mật' }));
    expect(onChangeTargets).toHaveBeenCalledWith(['c-d']);
  });

  it('câu mẫu: textarea ghi qua onChangeSampleAnswer; vắng callback ⇒ không có ô', () => {
    const onChangeSampleAnswer = vi.fn();
    render(<ul><CampaignQuestionCard question={{ ...baseQuestion, sampleAnswer: 'Bài mẫu' }} index={0} total={1} open onChangeSampleAnswer={onChangeSampleAnswer} {...handlers()} /></ul>);
    const field = screen.getByLabelText('employer.campaigns.questionCard.sampleAnswer.label');
    expect(field).toHaveValue('Bài mẫu');
    fireEvent.change(field, { target: { value: 'Sửa' } });
    expect(onChangeSampleAnswer).toHaveBeenCalledWith('Sửa');
    cleanup();
    render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open {...handlers()} /></ul>);
    expect(screen.queryByLabelText('employer.campaigns.questionCard.sampleAnswer.label')).not.toBeInTheDocument();
  });

  it('deep-link: scrollIntoViewOnMount ⇒ cuộn tới card', () => {
    const scrollSpy = vi.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollSpy;
    try {
      render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open scrollIntoViewOnMount {...handlers()} /></ul>);
      expect(scrollSpy).toHaveBeenCalledTimes(1);
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it('không có preview/previewCtx ⇒ không panel chấm thử', () => {
    render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open {...handlers()} /></ul>);
    expect(screen.queryByTestId('question-preview-panel')).not.toBeInTheDocument();
  });
});

describe('CampaignQuestionCard — hai tab Nội dung · Chấm thử', () => {
  const LEVELS = [{ score: 1, descriptor: 'Yếu' }, { score: 5, descriptor: 'Tốt' }];
  const scoredRubric: RubricCriterion[] = [{ id: 'c-a', name: 'Giao tiếp', description: '', weight: 100, maxScore: 5, levels: LEVELS, scoringScope: 'Always' }];
  const previewApi = (): UseQuestionPreviewApi => ({
    runs: [], latest: null, isLoadingHistory: false, isRunning: false, runningQuestionId: null, freeRunsRemaining: 1, error: null,
    run: vi.fn(async () => null), clearError: vi.fn(), billingConfirm: null, clearBillingConfirm: vi.fn(),
  });
  const previewCtx = (overrides: Partial<QuestionPreviewContext> = {}): QuestionPreviewContext => ({
    campaignId: 'c-1', campaignStatus: 'draft', rubric: scoredRubric, questions: [baseQuestion], passScorePct: 60,
    currentRubricVersion: 1, beforeRun: vi.fn(async () => 'c-1'), onRunningChange: vi.fn(), runningQuestionId: null, ...overrides,
  });
  const tab = (name: 'content' | 'preview') => screen.getByRole('tab', { name: new RegExp(`questionCard\\.tabs\\.${name}`) });

  it('wizard mở tab Nội dung; bấm / ←→ sang Chấm thử; tab ẩn vẫn mount nên câu trả lời đang gõ không mất', () => {
    render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open {...handlers()} rubric={scoredRubric} previewCtx={previewCtx()} preview={previewApi()} /></ul>);

    expect(tab('content')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('textbox', { name: 'employer.campaigns.campaignQuestions.question.contentLabel' })).toBeVisible();
    expect(screen.getByTestId('question-preview-panel').closest('[role="tabpanel"]')).toHaveAttribute('hidden');

    fireEvent.click(tab('preview'));
    expect(tab('preview')).toHaveAttribute('aria-selected', 'true');
    fireEvent.change(screen.getByLabelText('employer.campaigns.questionCard.preview.custom.label'), { target: { value: 'Bài thử' } });

    fireEvent.keyDown(tab('preview'), { key: 'ArrowRight' });
    expect(tab('content')).toHaveAttribute('aria-selected', 'true');
    expect(tab('content')).toHaveFocus();
    fireEvent.keyDown(tab('content'), { key: 'ArrowLeft' });
    expect(screen.getByLabelText('employer.campaigns.questionCard.preview.custom.label')).toHaveValue('Bài thử');
  });

  it('trang chi tiết (readOnly) mở thẳng tab Chấm thử; câu đang chấm tự chuyển sang tab Chấm thử', () => {
    render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open {...handlers()} previewCtx={previewCtx({ readOnly: true })} preview={previewApi()} /></ul>);
    expect(tab('preview')).toHaveAttribute('aria-selected', 'true');
    cleanup();

    const ctx = previewCtx();
    const { rerender } = render(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open {...handlers()} previewCtx={ctx} preview={previewApi()} /></ul>);
    expect(tab('content')).toHaveAttribute('aria-selected', 'true');
    rerender(<ul><CampaignQuestionCard question={baseQuestion} index={0} total={1} open {...handlers()} previewCtx={{ ...ctx, runningQuestionId: baseQuestion.id }} preview={previewApi()} /></ul>);
    expect(tab('preview')).toHaveAttribute('aria-selected', 'true');
  });
});
