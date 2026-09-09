/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
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
      return key;
    },
  }),
}));

vi.mock('../../hooks/useCampaignSlots', () => ({
  useCampaignSlots: () => ({ data: [] }),
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
    maxQuestions: 5,
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

describe('CampaignReviewStep adaptive budget', () => {
  it('shows max depth beside max questions and the five-by-depth-two result', () => {
    render(<CampaignReviewStep {...baseProps} questionsPerSession={5} />);

    expect(screen.getByText(/maxDeepPerQuestion/)).toBeInTheDocument();
    expect(screen.getByText(/adaptiveBudgetFormula/)).toHaveTextContent('5');
    expect(screen.getByText(/adaptiveBudgetFormula/)).toHaveTextContent('2');
    expect(screen.getByText(/adaptiveBudgetFormula/)).toHaveTextContent('15');
  });

  it('shows an actionable warning and disables publish for six-by-depth-three', () => {
    render(
      <CampaignReviewStep
        {...baseProps}
        questionsPerSession={6}
        settings={{ ...baseProps.settings, maxDeepPerQuestion: 3 }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('adaptiveBudgetExceeded');
    expect(screen.getByRole('alert')).toHaveTextContent('24');
    expect(screen.getByRole('button', { name: 'publish' })).toBeDisabled();
  });

  it('uses the full question bank when K is empty and blocks publish at depth three', () => {
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
    expect(screen.getByRole('button', { name: 'publish' })).toBeDisabled();
  });

  it('allows publish for K five at depth three', () => {
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
    expect(screen.getByRole('button', { name: 'publish' })).toBeEnabled();
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
});
