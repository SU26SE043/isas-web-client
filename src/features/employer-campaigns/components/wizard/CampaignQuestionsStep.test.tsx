/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion } from '../../types/campaignManagement.types';
import { CampaignQuestionsStep } from './CampaignQuestionsStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => key === 'employer.campaigns.campaignQuestions.draw.total'
      ? '{{fixed}} fixed + {{draw}} from pool = {{total}} questions per candidate.'
      : key,
  }),
}));

afterEach(() => cleanup());

const question = (id: string, isRequired: boolean): CampaignQuestion => ({
  id,
  prompt: `Question ${id}`,
  skill: 'frontend',
  difficulty: 'middle',
  source: 'manual',
  isRequired,
});

const baseProps = {
  campaignTitle: 'Campaign',
  domainLabel: 'Frontend',
  isDraft: true,
  hasJd: true,
  questionCount: 5,
  maxQuestions: 5,
  onQuestionCount: vi.fn(),
  onQuestionsPerSession: vi.fn(),
  onGenerateAi: vi.fn(),
  onAddManual: vi.fn(),
  onChangePrompt: vi.fn(),
  onToggleRequired: vi.fn(),
  onChangeGroup: vi.fn(),
  onMoveQuestion: vi.fn(),
  onRemoveQuestion: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
} as const;

describe('CampaignQuestionsStep', () => {
  it('shows three start options when the bank is empty', () => {
    render(<CampaignQuestionsStep {...baseProps} questions={[]} />);

    expect(screen.getByText('employer.campaigns.campaignQuestions.start.ai')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.campaignQuestions.start.csv')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.campaignQuestions.start.manual')).toBeInTheDocument();
  });

  it('uses one fixed list in all mode and sends a null draw count', () => {
    render(
      <CampaignQuestionsStep
        {...baseProps}
        questions={[question('fixed-1', true), question('fixed-2', true)]}
        questionsPerSession={null}
      />,
    );

    expect(screen.getByText('employer.campaigns.campaignQuestions.fixed.title')).toBeInTheDocument();
    expect(screen.queryByText('employer.campaigns.campaignQuestions.pool.title')).not.toBeInTheDocument();
    expect(baseProps.onQuestionsPerSession).not.toHaveBeenCalled();
  });

  it('shows fixed plus pool totals in draw mode and has no total input', () => {
    render(
      <CampaignQuestionsStep
        {...baseProps}
        questions={[question('fixed-1', true), question('pool-1', false), question('pool-2', false), question('pool-3', false)]}
        questionsPerSession={3}
      />,
    );

    expect(screen.getByText('employer.campaigns.campaignQuestions.fixed.title')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.campaignQuestions.pool.title')).toBeInTheDocument();
    expect(screen.getByText('1 fixed + 3 from pool = 4 questions per candidate.')).toBeInTheDocument();
    expect(screen.queryByLabelText('employer.campaigns.campaignQuestions.bank.perCandidate')).not.toBeInTheDocument();
  });

  it('clamps draw N when a pool question moves to fixed', () => {
    const { rerender } = render(
      <CampaignQuestionsStep
        {...baseProps}
        questions={[question('fixed-1', true), question('pool-1', false), question('pool-2', false), question('pool-3', false)]}
        questionsPerSession={3}
      />,
    );

    rerender(
      <CampaignQuestionsStep
        {...baseProps}
        questions={[question('fixed-1', true), question('fixed-2', true), question('pool-2', false), question('pool-3', false)]}
        questionsPerSession={3}
      />,
    );

    expect(baseProps.onQuestionsPerSession).toHaveBeenCalledWith(2);
  });
});
