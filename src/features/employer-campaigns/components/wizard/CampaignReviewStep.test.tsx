/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CampaignReviewStep } from './CampaignReviewStep';
import { createEmptyJdState } from '../../types/campaignWizard.types';
import { useCampaignDeployOptionsStore } from '../../stores/campaignDeployOptionsStore';
import type { CampaignQuestion, RubricCriterion } from '../../types/campaignManagement.types';
import type { CampaignSlotResponse } from '../../types/campaign.api.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      if (key === 'employer.campaigns.wizard.review.adaptiveBudgetFormula') {
        return `${key} {{base}} {{depth}} {{total}}`;
      }
      if (key === 'employer.campaigns.wizard.review.adaptiveBudgetExceeded') {
        return `${key} {{requested}} {{limit}}`;
      }
      if (key === 'employer.campaigns.wizard.review.adaptiveBudgetSummary') {
        return `${key} {{base}} {{depth}} {{requested}} {{limit}} {{status}}`;
      }
      if (key === 'employer.campaigns.wizard.review.adaptiveBudgetStatus.ok') return 'within limit';
      if (key === 'employer.campaigns.wizard.review.adaptiveBudgetStatus.exceeded') return 'OVER LIMIT';
      if (key === 'employer.campaigns.wizard.deploy.retryInvitations') return 'retryInvitations';
      // T12 R2 — giữ placeholder thô để test đọc được số đã `.replace()`, mẫu theo 3 key adaptive ở trên.
      if (key === 'employer.campaigns.wizard.deploy.blockSlotShortfall') return `${key} {{inviting}} {{available}}`;
      if (key === 'employer.campaigns.wizard.deploy.blockSlotOutsideWindow') return `${key} {{n}}`;
      if (key === 'employer.campaigns.wizard.deploy.scheduleSlots') return `${key} {{n}} {{assigned}} {{capacity}}`;
      // T13 R2 — giữ placeholder để test đọc được số ca / giờ mở đã `.replace()`.
      if (key === 'employer.campaigns.wizard.deploy.startNowBlockedHasSlots') return `${key} {{n}}`;
      if (key === 'employer.campaigns.wizard.deploy.startNowBlockedNotFuture') return `${key} {{start}}`;
      return key;
    },
  }),
}));

// Hook thật dùng react-query — mock để test bước 8 không cần QueryClientProvider. Trạng thái
// mutable để từng test tự đặt `data`/`isLoading`/`isError` (T12 R2: phân biệt "0 ca thật" với
// "chưa tải xong/lỗi" là chính điều task này phải làm đúng).
const slotsQueryState = vi.hoisted(() => ({
  data: [] as CampaignSlotResponse[] | undefined,
  isLoading: false,
  isError: false,
}));
// SC2 · T15 — `QuestionPreviewSummaryLine` (mount ở bước 8) đọc lịch sử chấm thử qua `useRubricPreview`
// (react-query). Mock để test không cần QueryClientProvider; `runs` mutable cho test khoá chỗ ĐẤU DÂY.
const previewHook = vi.hoisted(() => ({ runs: [] as unknown[], args: [] as unknown[] }));
vi.mock('../../hooks/useRubricPreview', () => ({
  useRubricPreview: (options: unknown) => {
    previewHook.args.push(options);
    return { runs: previewHook.runs, latest: null, isLoadingHistory: false, isRunning: false, freeRunsRemaining: null, error: null, run: vi.fn(), clearError: vi.fn(), billingConfirm: null, clearBillingConfirm: vi.fn() };
  },
}));
vi.mock('../../hooks/useCampaignSlots', () => ({
  useCampaignSlots: () => ({
    data: slotsQueryState.data,
    isLoading: slotsQueryState.isLoading,
    isError: slotsQueryState.isError,
  }),
}));

afterEach(() => {
  cleanup();
  slotsQueryState.data = [];
  slotsQueryState.isLoading = false;
  slotsQueryState.isError = false;
  // T13 R2 — store zustand là module-singleton: lựa chọn "Mở ngay" của test trước không được rò sang test sau.
  useCampaignDeployOptionsStore.getState().reset();
});

const baseProps = {
  info: {
    title: 'Frontend campaign',
    domain: 'frontend',
    maxCandidates: 10,
    timeLimitMinutes: 60,
    passScorePct: 70,
    startsAt: '2026-09-07T09:00',
    expiresAt: '2026-10-07T09:00',
    timezone: 'Asia/Ho_Chi_Minh',
  },
  jd: { ...createEmptyJdState(), inputMethod: 'text', jdText: 'Build a frontend product.' },
  rubric: [] as RubricCriterion[],
  questions: [] as CampaignQuestion[],
  settings: {
    antiCheatEnabled: true,
    faceVerifyEnabled: true,
    adaptiveEnabled: true,
    maxFollowUps: 3,
    maxQuestions: 20,
    maxDeepPerQuestion: 2,
  },
  campaignId: undefined,
  domainLabel: 'Frontend',
  onGoToStep: vi.fn(),
  onBack: vi.fn(),
  onSubmit: vi.fn(),
  submitLabel: 'publish',
  submittingLabel: 'publishing',
} as const;

const twentyQuestions = Array.from({ length: 20 }, (_, index) => ({
  id: `question-${index + 1}`,
  prompt: `Question ${index + 1}`,
  skill: 'frontend',
  difficulty: 'middle' as const,
  source: 'manual' as const,
  isRequired: true,
}));

describe('CampaignReviewStep adaptive budget for fixed and draw modes', () => {
  it('shows max depth beside a draw count of five and the five-by-depth-two result', () => {
    render(<CampaignReviewStep {...baseProps} questionsPerSession={5} />);

    expect(screen.getByText(/maxDeepPerQuestion/)).toBeInTheDocument();
    expect(screen.getByText(/adaptiveBudgetFormula/)).toHaveTextContent('5');
    expect(screen.getByText(/adaptiveBudgetFormula/)).toHaveTextContent('2');
    expect(screen.getByText(/adaptiveBudgetFormula/)).toHaveTextContent('15');
  });

  it('shows an actionable warning and disables publish for draw count six at depth three', () => {
    render(
      <CampaignReviewStep
        {...baseProps}
        questionsPerSession={6}
        settings={{ ...baseProps.settings, maxDeepPerQuestion: 3 }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('adaptiveBudgetExceeded');
    expect(screen.getByRole('alert')).toHaveTextContent('24');
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeDisabled();
  });

  it('uses the full fixed set in all mode and blocks publish at depth three', () => {
    render(
      <CampaignReviewStep
        {...baseProps}
        questions={twentyQuestions}
        questionsPerSession={null}
        settings={{ ...baseProps.settings, maxDeepPerQuestion: 3 }}
      />,
    );

    expect(screen.getByText(/adaptiveBudgetSummary/)).toHaveTextContent('20');
    expect(screen.getByText(/adaptiveBudgetSummary/)).toHaveTextContent('80');
    expect(screen.getByRole('alert')).toHaveTextContent('80');
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeDisabled();
  });

  it('allows publish for draw count five at depth three', () => {
    render(
      <CampaignReviewStep
        {...baseProps}
        questions={twentyQuestions}
        questionsPerSession={5}
        settings={{ ...baseProps.settings, maxDeepPerQuestion: 3 }}
      />,
    );

    expect(screen.getByText(/adaptiveBudgetSummary/)).toHaveTextContent('20');
    expect(screen.getByText(/adaptiveBudgetSummary/)).toHaveTextContent('within limit');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });

  it('shows only the budget number when depth is zero', () => {
    render(
      <CampaignReviewStep
        {...baseProps}
        questionsPerSession={5}
        settings={{ ...baseProps.settings, maxDeepPerQuestion: 0 }}
      />,
    );

    expect(screen.getByText(/adaptiveBudget:/)).toHaveTextContent('5');
    expect(screen.queryByText(/adaptiveBudgetFormula/)).not.toBeInTheDocument();
  });

  it('shows the partial deployment recovery banner without an action error', () => {
    render(
      <CampaignReviewStep
        {...baseProps}
        hasPartialDeploy
        onRetryInvitations={vi.fn()}
        error={null}
        submitLabel="retryInvitations"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('invitationFailed');
    expect(screen.getAllByRole('button', { name: 'retryInvitations' })).toHaveLength(3);
  });

  it('routes the recovery banner button to invitation retry', () => {
    const onRetryInvitations = vi.fn();
    render(
      <CampaignReviewStep
        {...baseProps}
        hasPartialDeploy
        onRetryInvitations={onRetryInvitations}
        submitLabel="retryInvitations"
      />,
    );

    fireEvent.click(within(screen.getByRole('alert')).getByRole('button', { name: 'retryInvitations' }));

    expect(onRetryInvitations).toHaveBeenCalledTimes(1);
  });

  it('routes the main review action to invitation retry', () => {
    const onRetryInvitations = vi.fn();
    render(
      <CampaignReviewStep
        {...baseProps}
        hasPartialDeploy
        onRetryInvitations={onRetryInvitations}
        onSubmit={onRetryInvitations}
        submitLabel="retryInvitations"
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'retryInvitations' })[1]);

    expect(onRetryInvitations).toHaveBeenCalledTimes(1);
  });

  it('keeps the recovery action enabled when the old action error is cleared', () => {
    render(
      <CampaignReviewStep
        {...baseProps}
        hasPartialDeploy
        onRetryInvitations={vi.fn()}
        error={null}
        submitLabel="retryInvitations"
      />,
    );

    expect(screen.getAllByRole('button', { name: 'retryInvitations' })[1]).toBeEnabled();
  });

  it('does not render the recovery banner without a partial deployment', () => {
    render(<CampaignReviewStep {...baseProps} error={null} />);

    expect(screen.queryByText('invitationFailed')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });

  it('lists every server-reported failed invitation and keeps retry available', () => {
    const onRetryInvitations = vi.fn();
    render(
      <CampaignReviewStep
        {...baseProps}
        hasPartialDeploy
        onRetryInvitations={onRetryInvitations}
        invitationFailures={[
          { email: 'bad-one@example.com', reason: 'Mailbox rejected' },
          { email: 'bad-two@example.com', reason: 'Already invited' },
        ]}
      />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('bad-one@example.com');
    expect(alert).toHaveTextContent('Mailbox rejected');
    expect(alert).toHaveTextContent('bad-two@example.com');
    expect(alert).toHaveTextContent('Already invited');
    expect(within(alert).getByRole('button', { name: 'retryInvitations' })).toBeEnabled();
  });

  it('hides retry when the invitation error is permanently actionable by fixing input', () => {
    render(
      <CampaignReviewStep
        {...baseProps}
        hasPartialDeploy
        canRetryInvitations={false}
        invitationFailureReason="The campaign has no available invitation quota."
        onRetryInvitations={vi.fn()}
        submitLabel="invitationFixRequired"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('The campaign has no available invitation quota.');
    expect(screen.getByRole('alert')).toHaveTextContent('invitationFixRequired');
    expect(screen.queryByRole('button', { name: 'retryInvitations' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'invitationFixRequired' })[0]).toBeDisabled();
  });
});

// T12 R2 — ĐỔI TIỀN ĐỀ có chủ đích: `CampaignReviewStep` KHÔNG còn render
// `RubricPreviewMount variant="compact"` ở bước Review. Ba test cũ ở đây kiểm chính card đó
// (`data-testid="preview-compact-status"`/`"preview-soft-warning"`); T10 sẽ mount
// `QuestionPreviewSummaryLine` vào chỗ đã chừa placeholder trong `CampaignReviewStep.tsx`. Bản
// thân `RubricPreviewMount`/`RubricPreviewCard` KHÔNG bị đổi (FE-A sở hữu, gỡ compact ở đó) —
// đây chỉ là chỗ GỌI nó bị bỏ, nên test chuyển hướng sang khẳng định "không còn ở đây nữa".
describe('CampaignReviewStep — K-rule ở bước 8: chữ người đọc, tính từ state, chặn triển khai (SC2 · D-5)', () => {
  const rubricWT: RubricCriterion[] = [
    { id: 'c-a', name: 'A', description: '', weight: 50, maxScore: 5, scoringScope: 'WhenTargeted' },
    { id: 'c-b', name: 'B', description: '', weight: 50, maxScore: 5, scoringScope: 'WhenTargeted' },
  ];
  const q = (id: string, targets: string[] | null): CampaignQuestion => ({ id, prompt: 'Q ' + id, skill: 'x', difficulty: 'middle', source: 'manual', isRequired: false, targetCriterionIds: targets });

  it('K=1 < 2 tiêu chí được nhắm ⇒ mục chặn dùng copy kRule (không mã máy), link về bước 4, nút Triển khai KHÓA', () => {
    render(<CampaignReviewStep {...baseProps} rubric={rubricWT} questions={[q('q1', ['c-a']), q('q2', ['c-b'])]} questionsPerSession={1} questionBankWarnings={['K_BELOW_CRITERIA_GROUPS: questions_per_session (1) …']} disableForBlockingIssues />);
    expect(screen.getByText(/employer\.campaigns\.questionCard\.coverage\.kRule/)).toBeInTheDocument();
    // Câu dài là chữ thường; chỉ vế "Sang bước 4" là link (bấm ⇒ về bước Câu hỏi).
    // (cùng nhãn với link của dòng tóm tắt chấm thử ⇒ có 2 nút; nút trong khối chặn là nút đầu)
    const links = screen.getAllByRole('button', { name: 'employer.campaigns.review.previewSummary.goToQuestions' });
    expect(links.length).toBe(2);
    const onGoToStep = baseProps.onGoToStep as ReturnType<typeof vi.fn>;
    fireEvent.click(links[0]);
    expect(onGoToStep).toHaveBeenCalledWith(3);
    expect(screen.queryByText(/K_BELOW_CRITERIA_GROUPS/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeDisabled();
  });

  it('server chặn nhưng state đã sửa (K=2 ≥ 2) ⇒ KHÔNG chặn; cảnh báo mềm của server vẫn hiện, không kèm dòng K-rule', () => {
    render(<CampaignReviewStep {...baseProps} rubric={rubricWT} questions={[q('q1', ['c-a']), q('q2', ['c-b'])]} questionsPerSession={2} questionBankWarnings={['K_BELOW_CRITERIA_GROUPS: cũ', 'Số câu bắt buộc (3) nhiều hơn số câu mỗi buổi (2).']} disableForBlockingIssues />);
    expect(screen.queryByText(/coverage\.kRule/)).not.toBeInTheDocument();
    expect(screen.getByText('Số câu bắt buộc (3) nhiều hơn số câu mỗi buổi (2).')).toBeInTheDocument();
    expect(screen.queryByText(/K_BELOW_CRITERIA_GROUPS/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });
});

describe('CampaignReviewStep — chấm thử theo câu: bước 8 chỉ TÓM TẮT (SC2 · D-1 · T15 mount)', () => {
  const rubricWithLevels: RubricCriterion[] = [
    { id: 'c1', name: 'Depth', description: '', weight: 100, maxScore: 5, scoringScope: 'WhenTargeted', levels: [{ score: 0, descriptor: 'none' }, { score: 5, descriptor: 'top' }] },
  ];

  beforeEach(() => { previewHook.runs = []; previewHook.args = []; });

  it('card compact cũ KHÔNG còn; dòng tóm tắt hiện n/K đọc từ useRubricPreview đúng campaignId, link về bước 4', () => {
    // 2 lượt Succeeded cùng câu q-1 ⇒ n = 1 câu (đếm CÂU, không đếm LƯỢT); q-2 chưa gắn nhãn ⇒ m = 1.
    previewHook.runs = [
      { id: 'r1', status: 'Succeeded', questionId: '11111111-1111-4111-8111-111111111111' },
      { id: 'r2', status: 'Succeeded', questionId: '11111111-1111-4111-8111-111111111111' },
    ];
    const questions: CampaignQuestion[] = [
      { id: '11111111-1111-4111-8111-111111111111', prompt: 'Q1', skill: 'x', difficulty: 'middle', source: 'manual', isRequired: false, targetCriterionIds: ['c1'] },
      { id: '22222222-2222-4222-8222-222222222222', prompt: 'Q2', skill: 'x', difficulty: 'middle', source: 'manual', isRequired: false, targetCriterionIds: null },
    ];
    const onGoToStep = vi.fn();
    render(<CampaignReviewStep {...baseProps} campaignId="cmp-1" rubric={rubricWithLevels} questions={questions} questionsPerSession={2} onGoToStep={onGoToStep} />);
    expect(screen.queryByTestId('preview-compact-status')).not.toBeInTheDocument();
    expect(screen.queryByTestId('preview-soft-warning')).not.toBeInTheDocument();
    const summary = screen.getByTestId('question-preview-summary');
    expect(summary).toHaveAttribute('role', 'status');
    expect(previewHook.args[0]).toEqual({ campaignId: 'cmp-1' });
    expect(summary).toHaveTextContent('employer.campaigns.review.previewSummary.count');
    expect(summary).toHaveTextContent('employer.campaigns.review.previewSummary.unlabeled');
    fireEvent.click(within(summary).getByRole('button', { name: 'employer.campaigns.review.previewSummary.goToQuestions' }));
    expect(onGoToStep).toHaveBeenCalledWith(3);
    // Thuần thông tin — không chặn Phát hành.
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });

  it('chưa lưu nháp (campaignId null) ⇒ dòng tóm tắt vẫn hiện, hook nhận campaignId null (không gọi mạng)', () => {
    render(<CampaignReviewStep {...baseProps} campaignId={undefined} rubric={rubricWithLevels} questions={twentyQuestions} questionsPerSession={5} />);
    expect(screen.getByTestId('question-preview-summary')).toBeInTheDocument();
    expect(previewHook.args[0]).toEqual({ campaignId: null });
  });
});

describe('CampaignReviewStep — Sức chứa & ca thi (T12 R2)', () => {
  const readyRubric: RubricCriterion[] = [
    { id: 'r1', name: 'Depth', description: '', weight: 100, maxScore: 5 },
  ];
  const readyQuestions: CampaignQuestion[] = [
    { id: 'q1', prompt: 'Q1', skill: 'frontend', difficulty: 'middle', source: 'manual', isRequired: true },
  ];
  // adaptiveEnabled: false ⇒ loại hẳn ngân sách adaptive khỏi phép so sánh, để `deployDisabled`
  // trong các test dưới đây chỉ còn phản ánh đúng MỘT biến số: khối chặn liên quan tới ca thi.
  const readyProps = { ...baseProps, rubric: readyRubric, questions: readyQuestions, settings: { ...baseProps.settings, adaptiveEnabled: false } };

  function slot(capacity: number, assignedCount: number, id = `cap${capacity}-assigned${assignedCount}`): CampaignSlotResponse {
    return { id, startsAt: '2026-09-10T09:00:00.000Z', endsAt: '2026-09-10T11:00:00.000Z', capacity, assignedCount, startedCount: 0 };
  }
  function slotAt(startsAt: string, endsAt: string, capacity: number, assignedCount: number, id = 'outside-1'): CampaignSlotResponse {
    return { id, startsAt, endsAt, capacity, assignedCount, startedCount: 0 };
  }

  it('mời vượt chỗ ca thi ⇒ chặn triển khai, bấm mục chặn đưa về bước 6 (index 5)', () => {
    // capacity=5, assignedCount=3 ⇒ available=2 ≠ total=5 (cố ý LỆCH hai số này — nếu code
    // dùng nhầm `.total` thay `.available` thì test dưới đây phải bắt được sự khác biệt).
    slotsQueryState.data = [slot(5, 3)];
    const onGoToStep = vi.fn();
    render(
      <CampaignReviewStep
        {...readyProps}
        campaignId="cmp-1"
        inviteEmails={['a@x.com', 'b@x.com', 'c@x.com']}
        disableForBlockingIssues
        onGoToStep={onGoToStep}
      />,
    );
    const blocker = screen.getByRole('button', { name: /blockSlotShortfall/ });
    expect(blocker).toHaveTextContent('3'); // đang mời 3
    expect(blocker).toHaveTextContent('2'); // chỉ còn 2 chỗ trống (available, KHÔNG PHẢI total=5)
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeDisabled();
    fireEvent.click(blocker);
    expect(onGoToStep).toHaveBeenCalledWith(5);
  });

  it('có ca NẰM NGOÀI cửa sổ chiến dịch ⇒ chặn triển khai và bảng ca thi gắn nhãn đúng ca đó', () => {
    slotsQueryState.data = [slotAt('2020-01-01T09:00:00.000Z', '2020-01-01T11:00:00.000Z', 5, 0)];
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" disableForBlockingIssues />);
    expect(screen.getByText(/blockSlotOutsideWindow/)).toHaveTextContent('1');
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeDisabled();
    expect(screen.getByText(/slotOutsideBadge/)).toBeInTheDocument();
  });

  it('KHÔNG khai ca nào ⇒ không chặn, tóm tắt lịch nói "không ca"', () => {
    slotsQueryState.data = [];
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" inviteEmails={['a@x.com', 'b@x.com']} disableForBlockingIssues />);
    expect(screen.queryByText(/blockSlotShortfall/)).not.toBeInTheDocument();
    expect(screen.queryByText(/blockSlotOutsideWindow/)).not.toBeInTheDocument();
    expect(screen.getByText(/scheduleNoSlots/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });

  it('có ca ⇒ tóm tắt lịch hiện đúng N ca và đã đặt assigned/capacity, ĐÚNG THỨ TỰ', () => {
    slotsQueryState.data = [slot(5, 2, 's1'), slot(3, 1, 's2')]; // total=8, assigned=3
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" />);
    const summary = screen.getByText(/scheduleSlots/);
    // Khớp CHUỖI theo đúng thứ tự "n assigned capacity" — chỉ kiểm từng số riêng lẻ (toán tử
    // 'chứa') sẽ KHÔNG bắt được lỗi hoán đổi assigned↔capacity vì cả hai vẫn là 3 và 8, chỉ
    // đổi chỗ cho nhau.
    expect(summary).toHaveTextContent('employer.campaigns.wizard.deploy.scheduleSlots 2 3 8');
  });

  it('slots đang tải hoặc lỗi (data undefined) ⇒ KHÔNG chặn dù có nhiều lời mời — chưa có dữ liệu không phải "hết chỗ"', () => {
    slotsQueryState.data = undefined;
    slotsQueryState.isLoading = true;
    render(
      <CampaignReviewStep
        {...readyProps}
        campaignId="cmp-1"
        inviteEmails={['a@x.com', 'b@x.com', 'c@x.com']}
        disableForBlockingIssues
      />,
    );
    expect(screen.queryByText(/blockSlotShortfall/)).not.toBeInTheDocument();
    expect(screen.queryByText(/blockSlotOutsideWindow/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });

  // ── Tester T12 — 3 lỗ test (code đúng, mutation XANH trên suite cũ) ────────────────────────
  it('hai mục chặn CÙNG step=5 render với key KHÁC nhau — không có cảnh báo duplicate key', () => {
    // Một ca vừa ngoài cửa sổ vừa thiếu chỗ ⇒ cả `slotShortfall` lẫn `slotOutsideWindow` cùng xuất hiện.
    slotsQueryState.data = [slotAt('2020-01-01T09:00:00.000Z', '2020-01-01T11:00:00.000Z', 5, 3)];
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" inviteEmails={['a@x.com', 'b@x.com', 'c@x.com']} disableForBlockingIssues />);
    expect(screen.getByRole('button', { name: /blockSlotShortfall/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /blockSlotOutsideWindow/ })).toBeInTheDocument();
    // Phép phân biệt: `key` trùng thì React vẫn render đủ 2 <li> nhưng in "same key" — chỉ vế này bắt được.
    expect(errorSpy.mock.calls.flat().join(' ')).not.toMatch(/same key/i);
    errorSpy.mockRestore();
  });

  it('slots đang tải (data undefined) ⇒ KHÔNG có bảng ca "ma", tóm tắt lịch nói "không ca"', () => {
    slotsQueryState.data = undefined;
    slotsQueryState.isLoading = true;
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" />);
    // Mutation `slots.length > 0 ?` → `true ?` sẽ render <table> rỗng — vế này bắt.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/scheduleNoSlots/)).toBeInTheDocument();
  });

  it('0 lời mời + ca ĐÃ ĐẦY ⇒ KHÔNG chặn (không mời ai thì không thiếu chỗ)', () => {
    slotsQueryState.data = [slot(1, 1)]; // available = 0
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" inviteEmails={[]} disableForBlockingIssues />);
    // Mutation `inviteEmails.length || 1` ⇒ shortfall = 1 ⇒ chặn — vế này bắt.
    expect(screen.queryByText(/blockSlotShortfall/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });
});

// ── T13 R2 — "Mở ngay khi triển khai" ở bước Review (D-3 quick-deploy · D-6 mặc định ≤24h) ────
describe('CampaignReviewStep — Mở ngay khi triển khai (T13 R2)', () => {
  const readyProps = {
    ...baseProps,
    rubric: [{ id: 'r1', name: 'Depth', description: '', weight: 100, maxScore: 5 }] as RubricCriterion[],
    questions: [{ id: 'q1', prompt: 'Q1', skill: 'frontend', difficulty: 'middle', source: 'manual', isRequired: true }] as CampaignQuestion[],
    settings: { ...baseProps.settings, adaptiveEnabled: false },
  };
  const inHours = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();
  const checkbox = () => screen.getByRole('checkbox', { name: /startNowLabel/ });
  const slot = (id: string): CampaignSlotResponse => ({ id, startsAt: inHours(30), endsAt: inHours(32), capacity: 5, assignedCount: 0, startedCount: 0 });

  it('giờ mở ≤ 24h ⇒ checkbox BẬT SẴN (D-6) kèm chú thích mặc định; tóm tắt lịch nói "mở ngay lúc triển khai"', () => {
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" info={{ ...baseProps.info, startsAt: inHours(2), expiresAt: inHours(48) }} />);
    expect(checkbox()).toBeChecked();
    expect(checkbox()).toBeEnabled();
    expect(screen.getByText(/startNowDefaultHint/)).toBeInTheDocument();
    expect(screen.getByText(/scheduleStartNow/)).toBeInTheDocument();
    expect(screen.getByText(/whenPressedStartNow/)).toBeInTheDocument();
  });

  it('giờ mở xa hơn 24h ⇒ checkbox TẮT mặc định; tick lên thì tóm tắt đổi và store ghi choice=true', () => {
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" info={{ ...baseProps.info, startsAt: inHours(48), expiresAt: inHours(96) }} />);
    expect(checkbox()).not.toBeChecked();
    expect(screen.getByText(/scheduleNoSlots/)).toBeInTheDocument();
    fireEvent.click(checkbox());
    expect(checkbox()).toBeChecked();
    expect(screen.getByText(/scheduleStartNow/)).toBeInTheDocument();
    expect(useCampaignDeployOptionsStore.getState().choice).toBe(true);
    expect(useCampaignDeployOptionsStore.getState().blocked).toBe(false);
  });

  it('có ca thi ⇒ checkbox DISABLED + lý do nêu số ca, và store ghi blocked=true dù giờ mở ≤ 24h', () => {
    slotsQueryState.data = [slot('s1'), slot('s2')];
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" info={{ ...baseProps.info, startsAt: inHours(2), expiresAt: inHours(48) }} />);
    expect(checkbox()).toBeDisabled();
    expect(checkbox()).not.toBeChecked();
    expect(screen.getByTestId('start-now-blocked')).toHaveTextContent('startNowBlockedHasSlots');
    expect(screen.getByTestId('start-now-blocked')).toHaveTextContent('2');
    expect(useCampaignDeployOptionsStore.getState().blocked).toBe(true);
    expect(screen.queryByText(/whenPressedStartNow/)).not.toBeInTheDocument();
  });

  it('giờ mở đã qua ⇒ checkbox DISABLED, lý do "đã tới giờ" — không ai bị mời gọi start-now vô nghĩa', () => {
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" />); // baseProps.info.startsAt = 2026-09-07 (quá khứ)
    expect(checkbox()).toBeDisabled();
    expect(screen.getByTestId('start-now-blocked')).toHaveTextContent('startNowBlockedNotFuture');
    expect(useCampaignDeployOptionsStore.getState().blocked).toBe(true);
  });

  it('đã deploy dở (hasPartialDeploy) ⇒ KHÔNG còn checkbox — campaign đã Active, start-now đã chạy/không chạy rồi', () => {
    render(<CampaignReviewStep {...readyProps} campaignId="cmp-1" hasPartialDeploy onRetryInvitations={vi.fn()} info={{ ...baseProps.info, startsAt: inHours(2), expiresAt: inHours(48) }} />);
    expect(screen.queryByRole('checkbox', { name: /startNowLabel/ })).not.toBeInTheDocument();
  });
});
