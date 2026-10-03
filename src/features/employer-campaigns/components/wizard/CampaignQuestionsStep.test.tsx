/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion } from '../../types/campaignManagement.types';
import { CampaignQuestionsStep } from './CampaignQuestionsStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      if (key === 'employer.campaigns.campaignQuestions.draw.total')
        return '{{fixed}} fixed + {{draw}} from pool = {{total}} questions per candidate.';
      if (key === 'employer.campaigns.campaignQuestions.pool.title')
        return 'RANDOM POOL · each candidate gets {{draw}} of {{pool}}';
      return key;
    },
  }),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

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
    expect(screen.getByText('RANDOM POOL · each candidate gets 2 of 3')).toBeInTheDocument();
    // K includes fixed questions; the former assertion incorrectly added fixed to K again.
    expect(screen.getByText('1 fixed + 2 from pool = 3 questions per candidate.')).toBeInTheDocument();
    expect(screen.getByLabelText('employer.campaigns.campaignQuestions.draw.countLabel')).toHaveValue(2);
    expect(baseProps.onQuestionsPerSession).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('employer.campaigns.campaignQuestions.bank.perCandidate')).not.toBeInTheDocument();
  });

  it('keeps K when a pool question moves to fixed and reduces the displayed draw', () => {
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

    // Moving a question changes its source, not the candidate's total budget K.
    expect(baseProps.onQuestionsPerSession).not.toHaveBeenCalled();
    expect(screen.getByText('2 fixed + 1 from pool = 3 questions per candidate.')).toBeInTheDocument();
    expect(screen.getByLabelText('employer.campaigns.campaignQuestions.draw.countLabel')).toHaveValue(1);
  });

  it('converts entered pool draws to total K and clamps at the pool size', () => {
    render(<CampaignQuestionsStep {...baseProps}
      questions={[question('fixed-1', true), question('pool-1', false), question('pool-2', false), question('pool-3', false)]}
      questionsPerSession={3} />);
    const input = screen.getByLabelText('employer.campaigns.campaignQuestions.draw.countLabel');
    fireEvent.change(input, { target: { value: '3' } });
    expect(baseProps.onQuestionsPerSession).toHaveBeenLastCalledWith(4);
    fireEvent.change(input, { target: { value: '9' } });
    expect(baseProps.onQuestionsPerSession).toHaveBeenLastCalledWith(4);
  });

  it('never writes K=0 when the entire bank is optional', () => {
    render(<CampaignQuestionsStep {...baseProps}
      questions={[question('pool-1', false), question('pool-2', false), question('pool-3', false)]}
      questionsPerSession={2} />);
    fireEvent.change(screen.getByLabelText('employer.campaigns.campaignQuestions.draw.countLabel'), { target: { value: '0' } });
    expect(baseProps.onQuestionsPerSession).toHaveBeenLastCalledWith(1);
  });

  it('caps a large pool at the backend K maximum', () => {
    render(<CampaignQuestionsStep {...baseProps}
      questions={Array.from({ length: 25 }, (_, n) => question(`pool-${n}`, false))}
      questionsPerSession={20} />);
    fireEvent.change(screen.getByLabelText('employer.campaigns.campaignQuestions.draw.countLabel'), { target: { value: '25' } });
    expect(baseProps.onQuestionsPerSession).toHaveBeenLastCalledWith(20);
  }, 20_000);

  it('normalizes saved draft K below the fixed count or above the bank size', () => {
    const { rerender } = render(<CampaignQuestionsStep {...baseProps}
      questions={Array.from({ length: 5 }, (_, n) => question(`fixed-${n}`, true))}
      questionsPerSession={1} />);
    expect(baseProps.onQuestionsPerSession).toHaveBeenLastCalledWith(5);
    vi.clearAllMocks();
    rerender(<CampaignQuestionsStep {...baseProps}
      questions={[question('fixed-1', true), question('pool-1', false), question('pool-2', false), question('pool-3', false)]}
      questionsPerSession={6} />);
    expect(baseProps.onQuestionsPerSession).toHaveBeenLastCalledWith(4);
  });
});
