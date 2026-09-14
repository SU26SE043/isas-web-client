/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import type { QuestionPreviewContext } from '../../../types/questionPreview.types';
import type { RubricPreviewRun, UseQuestionPreviewApi } from '../../../types/rubricPreview.types';
import { goodRun, sample, score } from '../../../mocks/rubricPreview.fixtures';
import { parseRubricPreviewRun } from '../../../services/campaignRubricPreview.service';
import { QuestionPreviewPanel } from './QuestionPreviewPanel';

const messages: Record<string, string> = {
  'employer.campaigns.questionCard.preview.quota.free': 'Còn {{n}} lượt miễn phí cho câu này',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));
afterEach(() => cleanup());

const LEVELS = [{ score: 0, descriptor: 'Trống hoàn toàn' }, { score: 5, descriptor: 'Xuất sắc toàn diện' }];
const SEVEN: RubricCriterion[] = ['comm', 'fluency', 'grammar', 'terms', 'depth', 'design', 'algo'].map((key, index) => ({
  id: `c-${key}`,
  name: `Tiêu chí ${key}`,
  description: '',
  weight: index === 0 ? 16 : 14,
  maxScore: 5,
  levels: LEVELS,
  scoringScope: index < 4 ? 'Always' : 'WhenTargeted',
}));
const FIVE_IDS = ['c-comm', 'c-fluency', 'c-grammar', 'c-terms', 'c-depth'];

function sevenRun(overrides: Partial<RubricPreviewRun> = {}): RubricPreviewRun {
  const rubric = SEVEN.map((item) => ({ criterionId: item.id, name: item.name, weight: item.weight / 100, maxScore: 5, levels: LEVELS }));
  const scores = (level: number) => SEVEN.map((item) => score(item.id, item.name, level, level));
  return goodRun({
    id: 'run-7',
    questionId: 'q-1',
    rubric,
    samples: [sample('Weak', 20, 18, scores(1)), sample('Good', 60, 62, scores(3)), sample('Excellent', 100, 88, scores(5))],
    ...overrides,
  });
}

const question: CampaignQuestion = { id: 'q-1', prompt: 'Thiết kế API thanh toán', skill: '', difficulty: 'middle', source: 'manual', isRequired: true, targetCriterionIds: ['c-depth'], sampleAnswer: 'Bài mẫu của HR' };
const other: CampaignQuestion = { id: 'q-2', prompt: 'Câu hai', skill: '', difficulty: 'middle', source: 'manual', isRequired: true };

function api(overrides: Partial<UseQuestionPreviewApi> = {}): UseQuestionPreviewApi {
  return { runs: [], latest: null, isLoadingHistory: false, isRunning: false, runningQuestionId: null, freeRunsRemaining: 1, error: null, run: vi.fn(async () => null), clearError: vi.fn(), billingConfirm: null, clearBillingConfirm: vi.fn(), ...overrides };
}
function ctx(overrides: Partial<QuestionPreviewContext> = {}): QuestionPreviewContext {
  return { campaignId: 'c-1', campaignStatus: 'draft', rubric: SEVEN, questions: [question, other], passScorePct: 60, currentRubricVersion: 1, beforeRun: vi.fn(async () => 'c-1'), onRunningChange: vi.fn(), runningQuestionId: null, ...overrides };
}
const RUN = 'employer.campaigns.rubricPreview.runSave';

describe('QuestionPreviewPanel — chấm thử theo câu', () => {
  it('bấm chấm thử ⇒ run(customAnswer = câu mẫu của chính câu) + onRunningChange(id) TRƯỚC, null SAU', async () => {
    const preview = api();
    const context = ctx();
    render(<QuestionPreviewPanel question={question} index={0} ctx={context} preview={preview} />);
    fireEvent.click(screen.getByRole('button', { name: RUN }));
    expect(context.onRunningChange).toHaveBeenNthCalledWith(1, 'q-1');
    expect(preview.run).toHaveBeenCalledWith('Bài mẫu của HR');
    await waitFor(() => expect(context.onRunningChange).toHaveBeenLastCalledWith(null));
    expect((context.onRunningChange as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]).toBeLessThan((preview.run as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]);
  });

  it('HR sửa ô bài tự dán ⇒ gửi bản sửa; xoá trống ⇒ null (chỉ 3 bài AI)', () => {
    const preview = api();
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={preview} />);
    const field = screen.getByLabelText('employer.campaigns.questionCard.preview.custom.label');
    expect(field).toHaveValue('Bài mẫu của HR');
    fireEvent.change(field, { target: { value: '  transcript thật  ' } });
    fireEvent.click(screen.getByRole('button', { name: RUN }));
    expect(preview.run).toHaveBeenLastCalledWith('transcript thật');
    fireEvent.change(field, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: RUN }));
    expect(preview.run).toHaveBeenLastCalledWith(null);
  });

  it('đang chấm câu KHÁC (#2) ⇒ nút disabled + lý do nêu "#2"; KHÔNG gọi run', () => {
    const preview = api();
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx({ runningQuestionId: 'q-2' })} preview={preview} />);
    expect(screen.getByRole('button', { name: /rubricPreview\.running/ })).toBeDisabled();
    expect(screen.getByTestId('question-preview-blocked')).toHaveTextContent('employer.campaigns.questionCard.preview.blocked.runningOther');
    expect(preview.run).not.toHaveBeenCalled();
  });

  it('hết lượt miễn phí (0) ⇒ nhãn "· −1 credit" + HỎI trước; huỷ không chạy, xác nhận mới chạy', async () => {
    const preview = api({ freeRunsRemaining: 0 });
    const user = userEvent.setup();
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={preview} />);
    const button = screen.getByRole('button', { name: /rubricPreview\.runPaid/ });
    await user.click(button);
    expect(preview.run).not.toHaveBeenCalled();
    expect(await screen.findByText(/questionCard\.preview\.confirm\.paidDescription/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.confirm.cancel' }));
    await waitFor(() => expect(screen.queryByText('employer.campaigns.rubricPreview.confirm.paidTitle')).not.toBeInTheDocument());
    expect(preview.run).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /rubricPreview\.runPaid/ }));
    await user.click(await screen.findByRole('button', { name: /confirm.*runPaid|rubricPreview\.runPaid/ }));
    expect(preview.run).toHaveBeenCalledTimes(1);
  });

  it('quota hiển thị THEO CÂU: chưa có lượt cho câu này ⇒ "Còn 1 lượt" (không phải 3 của campaign)', () => {
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={api({ freeRunsRemaining: 1, latest: null, runs: [] })} />);
    // Quota campaign-level (freeRunsForVersion) sẽ hiện 3 ở đúng ca này — số phải là 1 (per-question, W1).
    expect(screen.getByTestId('question-preview-quota')).toHaveTextContent('Còn 1 lượt miễn phí cho câu này');
    expect(screen.queryByText('employer.campaigns.questionCard.preview.quota.paid')).not.toBeInTheDocument();
  });

  it('thiếu mốc ở tiêu chí TRONG phạm vi câu ⇒ chặn, KHÔNG gọi run, có nút về bước 3; thiếu mốc ở tiêu chí NGOÀI phạm vi ⇒ không chặn', () => {
    const preview = api();
    const onGoToCriteria = vi.fn();
    const noLevelsDepth = SEVEN.map((item) => (item.id === 'c-depth' ? { ...item, levels: [] } : item));
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx({ rubric: noLevelsDepth, onGoToCriteria })} preview={preview} />);
    fireEvent.click(screen.getByRole('button', { name: RUN }));
    expect(preview.run).not.toHaveBeenCalled();
    expect(screen.getByTestId('question-preview-blocked')).toHaveTextContent('rubricPreview.blocked.missingLevels');
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.goToCriteria' }));
    expect(onGoToCriteria).toHaveBeenCalledTimes(1);
    cleanup();
    const noLevelsDesign = SEVEN.map((item) => (item.id === 'c-design' ? { ...item, levels: [] } : item));
    const preview2 = api();
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx({ rubric: noLevelsDesign })} preview={preview2} />);
    fireEvent.click(screen.getByRole('button', { name: RUN }));
    expect(preview2.run).toHaveBeenCalledTimes(1);
  });

  it('prompt rỗng ⇒ chặn với lý do riêng, không gọi run', () => {
    const preview = api();
    render(<QuestionPreviewPanel question={{ ...question, prompt: '  ' }} index={0} ctx={ctx()} preview={preview} />);
    fireEvent.click(screen.getByRole('button', { name: RUN }));
    expect(preview.run).not.toHaveBeenCalled();
    expect(screen.getByTestId('question-preview-blocked')).toHaveTextContent('blocked.emptyPrompt');
  });

  it('bảng kết quả CHỈ hiện tiêu chí trong run.scopedCriterionIds (7 tiêu chí, scoped 5 ⇒ 5 hàng) — điểm gộp giữ nguyên', () => {
    const run = sevenRun({ scopedCriterionIds: FIVE_IDS });
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={api({ runs: [run], latest: run })} />);
    expect(screen.getByTestId('question-preview-scoped')).toHaveTextContent('employer.campaigns.questionCard.preview.scoped');
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.details.show' }));
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.textContent?.includes('Tiêu chí design'))).not.toContain(true);
    expect(screen.getAllByText('88%').length).toBeGreaterThan(0);
  });

  it('ĐẦU-CUỐI (correction T9-R3 F1): JSON BE có scopedCriterionIds=[S1,S2] qua parser THẬT, nhãn HIỆN TẠI của câu là [S3] ⇒ bảng hiện S1,S2 (sự thật BE thắng nhãn hiện tại)', () => {
    // Nếu parser rụng field ⇒ rơi về suy cục bộ: Always(4) + depth = 5 hàng — khác hẳn 2 hàng.
    const run = parseRubricPreviewRun(JSON.parse(JSON.stringify({ ...sevenRun({ id: 'run-be' }), scopedCriterionIds: ['c-comm', 'c-fluency'] })));
    expect(run.scopedCriterionIds).toEqual(['c-comm', 'c-fluency']);
    render(<QuestionPreviewPanel question={{ ...question, targetCriterionIds: ['c-depth'] }} index={0} ctx={ctx()} preview={api({ runs: [run], latest: run })} />);
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.details.show' }));
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.textContent)).toEqual([expect.stringContaining('Tiêu chí comm'), expect.stringContaining('Tiêu chí fluency')]);
    expect(rows.some((row) => row.textContent?.includes('Tiêu chí depth'))).toBe(false);
  });

  it('lượt cũ không mang scopedCriterionIds ⇒ lọc theo nhãn câu cục bộ (Always 4 + depth = 5 hàng); không crash', () => {
    const run = sevenRun({ scopedCriterionIds: undefined });
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={api({ runs: [run], latest: run })} />);
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.details.show' }));
    expect(within(screen.getByRole('table')).getAllByRole('row').slice(1)).toHaveLength(5);
  });

  it('lỗi từ hook hiện headline theo mã + nút Đã hiểu gọi clearError', () => {
    const preview = api({ error: { code: 'noCredit', message: 'raw' } });
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={preview} />);
    expect(screen.getByTestId('question-preview-error')).toHaveTextContent('rubricPreview.error.noCredit');
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.error.dismiss' }));
    expect(preview.clearError).toHaveBeenCalled();
  });
});

/**
 * R3/I7 — POST không confirm từng trừ credit im lặng khi FE đoán sai quota. Nay: FE không biết ⇒ HỎI; HR đồng ý ⇒ POST
 * mang `confirmBilled: true`; BE 409 PREVIEW_BILLING_CONFIRM_REQUIRED ⇒ hộp thoại tự mở, đồng ý ⇒ gọi lại có cờ.
 */
describe('QuestionPreviewPanel — R3: xác nhận trả phí', () => {
  it('quota null (không biết) ⇒ HỎI trước với tiêu đề "có thể trừ"; đồng ý ⇒ run(custom, { confirmBilled: true })', async () => {
    const preview = api({ freeRunsRemaining: null });
    const user = userEvent.setup();
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={preview} />);
    await user.click(screen.getByRole('button', { name: RUN }));
    expect(preview.run).not.toHaveBeenCalled();
    expect(await screen.findByText('employer.campaigns.rubricPreview.confirm.maybePaidTitle')).toBeInTheDocument();
    expect(screen.getByText(/questionCard\.preview\.confirm\.unknownDescription/)).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: RUN }));
    expect(preview.run).toHaveBeenCalledTimes(1);
    expect(preview.run).toHaveBeenCalledWith('Bài mẫu của HR', { confirmBilled: true });
  });

  it('hết lượt (0) ⇒ đồng ý ⇒ POST mang confirmBilled: true', async () => {
    const preview = api({ freeRunsRemaining: 0 });
    const user = userEvent.setup();
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={preview} />);
    await user.click(screen.getByRole('button', { name: /rubricPreview\.runPaid/ }));
    await user.click(await screen.findByRole('button', { name: /confirm.*runPaid|rubricPreview\.runPaid/ }));
    expect(preview.run).toHaveBeenCalledWith('Bài mẫu của HR', { confirmBilled: true });
  });

  it('còn lượt miễn phí (1) ⇒ KHÔNG hỏi, run(custom) không có cờ', () => {
    const preview = api({ freeRunsRemaining: 1 });
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={preview} />);
    fireEvent.click(screen.getByRole('button', { name: RUN }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(preview.run).toHaveBeenCalledTimes(1);
    expect((preview.run as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual(['Bài mẫu của HR']);
  });

  it('BE 409 confirm-required (billingConfirm ≠ null) ⇒ hộp thoại TỰ mở; đồng ý ⇒ clearBillingConfirm + gọi lại có cờ; huỷ ⇒ chỉ clear, không run', async () => {
    const user = userEvent.setup();
    const billingConfirm = { freeRunsRemaining: 0, questionId: 'q-1', input: { questionId: 'q-1', customAnswer: 'Bài mẫu của HR' } };
    const preview = api({ freeRunsRemaining: 1, billingConfirm });
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={preview} />);
    expect(await screen.findByText('employer.campaigns.rubricPreview.confirm.paidTitle')).toBeInTheDocument();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /rubricPreview\.runPaid/ }));
    expect(preview.clearBillingConfirm).toHaveBeenCalledTimes(1);
    expect(preview.run).toHaveBeenCalledWith('Bài mẫu của HR', { confirmBilled: true });
    cleanup();

    const preview2 = api({ freeRunsRemaining: 1, billingConfirm });
    render(<QuestionPreviewPanel question={question} index={0} ctx={ctx()} preview={preview2} />);
    await user.click(await screen.findByRole('button', { name: 'employer.campaigns.rubricPreview.confirm.cancel' }));
    expect(preview2.clearBillingConfirm).toHaveBeenCalledTimes(1);
    expect(preview2.run).not.toHaveBeenCalled();
  });
});
