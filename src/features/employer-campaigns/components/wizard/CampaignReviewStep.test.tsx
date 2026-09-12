/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignReviewStep } from './CampaignReviewStep';
import { createEmptyJdState } from '../../types/campaignWizard.types';
import type { CampaignQuestion, RubricCriterion } from '../../types/campaignManagement.types';

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
      return key;
    },
  }),
}));

vi.mock('../../hooks/useCampaignSlots', () => ({
  useCampaignSlots: () => ({ data: [] }),
}));

// Hook thật (W1) dùng react-query — mock để test bước 8 không cần QueryClientProvider; card chỉ nhận api qua props.
const rubricPreviewApi = vi.hoisted(() => ({
  runs: [] as unknown[],
  latest: null as unknown,
  isLoadingHistory: false,
  isRunning: false,
  freeRunsRemaining: 3 as number | null,
  error: null,
  run: vi.fn(async () => null),
  clearError: vi.fn(),
}));
vi.mock('../../hooks/useRubricPreview', () => ({
  useRubricPreview: () => rubricPreviewApi,
}));

afterEach(() => {
  cleanup();
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

describe('CampaignReviewStep — chấm thử thước đo (compact, CAMP-19)', () => {
  const rubricWithLevels: RubricCriterion[] = [
    { id: 'c1', name: 'Depth', description: '', weight: 100, maxScore: 5, levels: [{ score: 0, descriptor: 'none' }, { score: 5, descriptor: 'top' }] },
  ];

  it('không có campaignId ⇒ card ở trạng thái chặn, KHÔNG có cảnh báo mềm, Phát hành vẫn bấm được', () => {
    render(<CampaignReviewStep {...baseProps} rubric={rubricWithLevels} questions={twentyQuestions} questionsPerSession={5} />);
    expect(screen.getByTestId('preview-compact-status')).toHaveTextContent('employer.campaigns.rubricPreview.blocked.noCampaign');
    expect(screen.queryByTestId('preview-soft-warning')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });

  it('có campaign + thước đo có mốc + 0 lượt ⇒ cảnh báo MỀM, Phát hành KHÔNG bị chặn, nút là "Lưu & chấm thử" khi có bước lưu', () => {
    render(
      <CampaignReviewStep
        {...baseProps}
        campaignId="cmp-1"
        campaignStatus="draft"
        rubric={rubricWithLevels}
        questions={twentyQuestions}
        questionsPerSession={5}
        onBeforeRun={async () => 'cmp-1'}
      />,
    );
    expect(screen.getByTestId('preview-soft-warning')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' })).toBeEnabled();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });

  it('thiếu mốc ⇒ dòng trạng thái là LÝ DO, nút chấm thử disabled, Phát hành vẫn bấm được (cảnh báo mềm, không chặn)', () => {
    const missing: RubricCriterion[] = [{ ...rubricWithLevels[0], levels: [] }];
    render(<CampaignReviewStep {...baseProps} campaignId="cmp-1" rubric={missing} questions={twentyQuestions} questionsPerSession={5} />);
    expect(screen.getByTestId('preview-compact-status')).toHaveTextContent('missingLevels');
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'publish' })[0]).toBeEnabled();
  });
});
