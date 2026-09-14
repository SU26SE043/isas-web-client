/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_EMPLOYER_CAMPAIGNS } from '../../mocks/campaignManagement.fixtures';
import type { CampaignQuestion, EmployerCampaign, RubricCriterion } from '../../types/campaignManagement.types';
import type { UseQuestionPreviewApi } from '../../types/rubricPreview.types';
import { CampaignDetailQuestionsSection, editQuestionPath } from './CampaignDetailQuestionsSection';

// Khoá TÊN tiêu chí server trả (không chỉ key): mock `t` trả chuỗi có placeholder cho key mang tên.
const messages: Record<string, string> = { 'employer.campaigns.questionCard.coverage.item': '{{name}} — sẽ bị loại khỏi điểm.' };
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

const nav = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => nav.navigate,
}));

const hook = vi.hoisted(() => ({ args: [] as Array<Record<string, unknown>>, api: {} as Record<string, Partial<UseQuestionPreviewApi>> }));
vi.mock('../../hooks/useQuestionPreview', () => ({
  useQuestionPreview: (options: Record<string, unknown>) => {
    hook.args.push(options);
    const api: UseQuestionPreviewApi = {
      runs: [], latest: null, isLoadingHistory: false, isRunning: false, runningQuestionId: null, freeRunsRemaining: 1, error: null,
      run: vi.fn(async () => null), clearError: vi.fn(), billingConfirm: null, clearBillingConfirm: vi.fn(),
      ...(hook.api[options.questionId as string] ?? {}),
    };
    return api;
  },
}));

afterEach(() => {
  cleanup();
  hook.args = [];
  hook.api = {};
  nav.navigate.mockReset();
});

const QA = '11111111-1111-4111-8111-111111111111';
const QB = '22222222-2222-4222-8222-222222222222';
const LEVELS = [{ score: 0, descriptor: 'Trống hoàn toàn' }, { score: 5, descriptor: 'Xuất sắc toàn diện' }];
const rubric: RubricCriterion[] = [
  { id: 'c-comm', name: 'Giao tiếp', description: '', weight: 50, maxScore: 5, levels: LEVELS, scoringScope: 'Always' },
  { id: 'c-depth', name: 'Chiều sâu', description: '', weight: 50, maxScore: 5, levels: LEVELS, scoringScope: 'WhenTargeted' },
];
const questions: CampaignQuestion[] = [
  { id: QA, prompt: 'Câu A — thiết kế API', skill: '', difficulty: 'middle', source: 'manual', isRequired: true, targetCriterionIds: ['c-depth'], sampleAnswer: 'Bài mẫu A' },
  { id: QB, prompt: 'Câu B — xử lý lỗi', skill: '', difficulty: 'middle', source: 'ai', isRequired: false, targetCriterionIds: null },
];
function campaign(overrides: Partial<EmployerCampaign> = {}): EmployerCampaign {
  return { ...MOCK_EMPLOYER_CAMPAIGNS[0], id: 'camp-1', status: 'draft', rubric, questions, passScorePct: 60, rubricVersion: 2, questionBank: null, ...overrides };
}
const RUN = 'employer.campaigns.rubricPreview.run';
const RUN_SAVE = 'employer.campaigns.rubricPreview.runSave';
const EDIT = 'employer.campaigns.detail.questions.editQuestion';
const cardOf = (id: string) => document.getElementById(`question-card-${id}`) as HTMLElement;
const renderAt = (ui: React.ReactElement, path = '/employer/campaigns/camp-1') => render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);

describe('CampaignDetailQuestionsSection — tab Chi tiết dùng card theo câu (SC2 · T10)', () => {
  it('Draft: card read-only (textarea khoá, KHÔNG picker nhãn, KHÔNG ô câu mẫu) + panel chấm thử nhãn "Chấm thử" (không lưu, không resolver)', () => {
    renderAt(<CampaignDetailQuestionsSection campaign={campaign()} />);
    expect(screen.getAllByTestId('question-card')).toHaveLength(2);
    const cardA = cardOf(QA);
    expect(within(cardA).getByRole('textbox', { name: 'employer.campaigns.campaignQuestions.question.contentLabel' })).toBeDisabled();
    expect(within(cardA).queryByTestId('question-scope-picker')).not.toBeInTheDocument();
    expect(within(cardA).queryByLabelText('employer.campaigns.questionCard.sampleAnswer.label')).not.toBeInTheDocument();
    // Hàng đầu: nút lên/xuống/xoá KHOÁ (card `disabled`) — trang chi tiết không sắp xếp/xoá câu, việc đó thuộc wizard.
    for (const name of ['moveUp', 'moveDown', 'delete']) {
      expect(within(cardA).getByRole('button', { name: `employer.campaigns.campaignQuestions.question.${name}` })).toBeDisabled();
    }
    expect(within(cardA).getByTestId('question-preview-panel')).toBeInTheDocument();
    expect(within(cardA).getByRole('button', { name: RUN })).toBeEnabled();
    expect(within(cardA).queryByRole('button', { name: RUN_SAVE })).not.toBeInTheDocument();
    // Hợp đồng T9: một hook / card, đúng campaignId + questionId; trang chi tiết KHÔNG có beforeRun/resolveQuestionId.
    expect(hook.args.map((arg) => arg.questionId)).toEqual([QA, QB]);
    expect(hook.args[0]).toEqual({ campaignId: 'camp-1', questionId: QA, currentRubricVersion: 2, beforeRun: undefined, resolveQuestionId: undefined });
    // Không còn card chấm thử campaign-level (RubricPreviewCard: mô tả chung / trạng thái compact / <select> chọn câu).
    expect(screen.queryByTestId('preview-description')).not.toBeInTheDocument();
    expect(screen.queryByTestId('preview-compact-status')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('employer.campaigns.rubricPreview.question.label')).not.toBeInTheDocument();
  });

  it('Draft: "Sửa câu này" điều hướng …/edit?step=4&question=<id>; Active: không có nút, mô tả khoá, chấm thử VẪN bật', () => {
    const { unmount } = renderAt(<CampaignDetailQuestionsSection campaign={campaign()} />);
    const edits = screen.getAllByRole('button', { name: EDIT });
    expect(edits).toHaveLength(2);
    fireEvent.click(edits[1]);
    expect(nav.navigate).toHaveBeenCalledWith(`/employer/campaigns/camp-1/edit?step=4&question=${QB}`);
    expect(editQuestionPath('camp-1', QB)).toBe(`/employer/campaigns/camp-1/edit?step=4&question=${QB}`);
    expect(screen.getByText('employer.campaigns.detail.questions.description')).toBeInTheDocument();
    unmount();

    renderAt(<CampaignDetailQuestionsSection campaign={campaign({ status: 'active' })} />);
    expect(screen.queryByRole('button', { name: EDIT })).not.toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.detail.questions.descriptionLocked')).toBeInTheDocument();
    expect(within(cardOf(QA)).getByRole('button', { name: RUN })).toBeEnabled();
    expect(within(cardOf(QA)).queryByTestId('question-preview-blocked')).not.toBeInTheDocument();
  });

  it('closed/archived: card vẫn hiện để đọc nhưng blocker `closed` — nút chấm thử KHOÁ, run KHÔNG được gọi (I7)', () => {
    for (const status of ['closed', 'archived'] as const) {
      const run = vi.fn(async () => null);
      hook.api = { [QA]: { run } };
      renderAt(<CampaignDetailQuestionsSection campaign={campaign({ status })} />);
      const cardA = cardOf(QA);
      expect(within(cardA).getByTestId('question-preview-blocked')).toHaveTextContent('employer.campaigns.rubricPreview.blocked.closed');
      const button = within(cardA).getByRole('button', { name: RUN });
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(run).not.toHaveBeenCalled();
      cleanup();
    }
  });

  it('state "câu đang chạy" giữ ở section: bấm chấm thử card A ⇒ card B bị chặn "đang chấm câu #1"; xong ⇒ mở lại', async () => {
    let finish: (value: null) => void = () => undefined;
    const run = vi.fn(() => new Promise<null>((resolve) => { finish = resolve; }));
    hook.api = { [QA]: { run } };
    renderAt(<CampaignDetailQuestionsSection campaign={campaign()} />);
    // Mở card B (mặc định chỉ card đầu mở) để nút của nó nằm trong cây a11y.
    fireEvent.click(within(cardOf(QB)).getByRole('button', { name: /Câu B/ }));
    fireEvent.click(within(cardOf(QA)).getByRole('button', { name: RUN }));
    expect(run).toHaveBeenCalledWith('Bài mẫu A');
    expect(within(cardOf(QB)).getByTestId('question-preview-blocked')).toHaveTextContent('employer.campaigns.questionCard.preview.blocked.runningOther');
    // Đang có lượt bay ⇒ nút mọi card đổi nhãn "đang chấm" + khoá (không POST chồng — BE 409).
    expect(within(cardOf(QB)).getByRole('button', { name: 'employer.campaigns.rubricPreview.running' })).toBeDisabled();
    finish(null);
    await waitFor(() => expect(within(cardOf(QB)).queryByTestId('question-preview-blocked')).not.toBeInTheDocument());
  });

  it('bao phủ lấy số SERVER (`questionBank.coverageWarnings` + K-rule trong `questionBank.warnings`), không tính cục bộ', () => {
    // Cục bộ sẽ nói "c-depth đã có câu A nhắm" ⇒ 0 cảnh báo; server nói khác ⇒ phải hiện theo server.
    renderAt(<CampaignDetailQuestionsSection campaign={campaign({ questionBank: { questionsPerSession: 1, coverageWarnings: [{ criterionId: 'c-x', name: 'Bảo mật (server)' }], warnings: ['K_BELOW_CRITERIA_GROUPS: K nhỏ hơn số tiêu chí chính'] } })} />);
    expect(screen.getByTestId('question-coverage')).toHaveTextContent('Bảo mật (server)');
    expect(screen.getByTestId('question-k-rule')).toBeInTheDocument();
  });

  it('thiếu mốc + Draft ⇒ nút "Về sửa mốc" gọi onEditCriteria; Active không có đường ⇒ chỉ nêu lý do', () => {
    const missing = rubric.map((item) => ({ ...item, levels: [] }));
    const onEditCriteria = vi.fn();
    const { unmount } = renderAt(<CampaignDetailQuestionsSection campaign={campaign({ rubric: missing })} onEditCriteria={onEditCriteria} />);
    fireEvent.click(within(cardOf(QA)).getByRole('button', { name: 'employer.campaigns.rubricPreview.goToCriteria' }));
    expect(onEditCriteria).toHaveBeenCalledOnce();
    unmount();

    renderAt(<CampaignDetailQuestionsSection campaign={campaign({ status: 'active', rubric: missing })} />);
    expect(within(cardOf(QA)).getByTestId('question-preview-blocked')).toHaveTextContent('employer.campaigns.rubricPreview.blocked.missingLevels');
    expect(screen.queryByRole('button', { name: 'employer.campaigns.rubricPreview.goToCriteria' })).not.toBeInTheDocument();
  });

  it('deep-link ?question=<id> mở đúng card đó (card đầu đóng); không có câu hỏi ⇒ dòng trống', () => {
    const { unmount } = renderAt(<CampaignDetailQuestionsSection campaign={campaign()} />, `/employer/campaigns/camp-1?question=${QB}`);
    expect(within(cardOf(QB)).getByTestId('question-card-panel')).not.toHaveAttribute('hidden');
    expect(within(cardOf(QA)).getByTestId('question-card-panel')).toHaveAttribute('hidden');
    unmount();

    renderAt(<CampaignDetailQuestionsSection campaign={campaign({ questions: [] })} />);
    expect(screen.getByTestId('campaign-detail-questions-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('question-card')).not.toBeInTheDocument();
  });
});
