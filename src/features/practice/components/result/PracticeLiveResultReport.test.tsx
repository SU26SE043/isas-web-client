// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_SESSION_TOPICS_EIGHT } from '../../mocks/sessionTopics.fixtures';
import type { PracticeSessionResponse } from '../../types/b2cPracticeSession.types';
import { mapPracticeSessionResponse } from '../../utils/mapB2cPracticeSession';
import weightedSessionFixture from '../../utils/fixtures/weighted-session-e327d25c.json';
import legacySessionFixture from '../../utils/fixtures/legacy-practice-session.json';
import { PracticeLiveResultReport } from './PracticeLiveResultReport';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => key === 'practice.result.weightedFormulaPenalty'
      ? 'Score {before}; penalty answered {answered}/{total}; final {after}'
      : key === 'practice.result.weightedFormula'
        ? 'Score {before}; final {after}'
        : key,
    language: 'en',
  }),
}));

vi.mock('./CriteriaRadarChart', () => ({
  CriteriaRadarChart: () => <div>radar-chart</div>,
}));

const session: PracticeSessionResponse = {
  id: 'session-1',
  status: 'Scored',
  createdAt: '2026-07-01T00:00:00Z',
  completedAt: '2026-07-01T00:20:00Z',
  questions: [
    { id: 'q1', orderNo: 1, content: 'Tell me about yourself.', timeLimitSec: 120, kind: 'Seed' },
    { id: 'q2', orderNo: 2, content: 'Describe a conflict.', timeLimitSec: 120, kind: 'Seed' },
  ],
  answers: [
    {
      questionId: 'q1',
      answerId: 'a1',
      status: 'Scored',
      transcript: 'I am a developer.',
      criteriaScores: [{ name: 'Communication', score: 4, maxScore: 5 }],
    },
    {
      questionId: 'q2',
      answerId: 'a2',
      status: 'Scored',
      transcript: 'I mediated calmly.',
      criteriaScores: [{ name: 'Communication', score: 3, maxScore: 5 }],
    },
  ],
  result: {
    overallScore: 70,
    maxScore: 100,
    passThreshold: 50,
    overallComment: 'Solid session overall.',
    strengths: ['Clear structure'],
    needsImprovement: ['Add more metrics'],
    nextSteps: ['Practice STAR'],
    criteriaScores: [{ name: 'Communication', score: 7, maxScore: 10 }],
    cvVsAnswer: null,
  },
};

function renderReport(
  reportSession: PracticeSessionResponse = session,
  url = '/practice/result?sessionId=session-1',
) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[url]}>
        <PracticeLiveResultReport session={reportSession} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe('PracticeLiveResultReport tabs', () => {
  it('defaults to overview and hides other sections', () => {
    renderReport();

    expect(screen.getByRole('tab', { name: 'practice.result.quickOverview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('practice.result.summary')).toBeInTheDocument();
    expect(screen.queryByText('practice.result.criteriaScores')).not.toBeInTheDocument();
    expect(screen.queryByText('practice.result.questionReview')).not.toBeInTheDocument();
    expect(screen.queryByText('practice.result.jumpToQuestion')).not.toBeInTheDocument();
  });

  it('switches to criteria without rendering questions', async () => {
    const user = userEvent.setup();
    renderReport();

    await user.click(screen.getByRole('tab', { name: 'practice.result.quickCriteria' }));

    expect(screen.getByText('practice.result.criteriaScores')).toBeInTheDocument();
    expect(screen.getByText('radar-chart')).toBeInTheDocument();
    expect(screen.getByText('practice.result.unassessed.generic')).toBeInTheDocument();
    expect(screen.queryByText('practice.result.summary')).not.toBeInTheDocument();
    expect(screen.queryByText('practice.result.jumpToQuestion')).not.toBeInTheDocument();
  });

  it('places the full topic catalog beside criteria scores when GET detail includes topics', async () => {
    const user = userEvent.setup();
    renderReport({ ...session, seniority: 'Middle', topics: MOCK_SESSION_TOPICS_EIGHT });

    await user.click(screen.getByRole('tab', { name: 'practice.result.quickCriteria' }));

    expect(screen.getByRole('heading', { name: 'practice.result.criteriaScores' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'practice.topics.title' })).toBeInTheDocument();
    const topicsSection = screen.getByRole('heading', { name: 'practice.topics.title' }).closest('section');
    expect(topicsSection).not.toBeNull();
    expect(within(topicsSection as HTMLElement).getAllByRole('listitem')).toHaveLength(8);
    expect(screen.getByText('practice.topics.level')).toBeInTheDocument();
    expect(screen.queryByText(/cvEvidence|private evidence/i)).not.toBeInTheDocument();
  });

  it('keeps the result layout unchanged when the detail has no topics', async () => {
    const user = userEvent.setup();
    renderReport({ ...session, topics: null });

    await user.click(screen.getByRole('tab', { name: 'practice.result.quickCriteria' }));

    expect(screen.getByText('practice.result.criteriaScores')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'practice.topics.title' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('practice-session-topics-compact')).not.toBeInTheDocument();
  });

  it('shows returned weighted formula, normalized weights and contributions only for Weighted sessions', async () => {
    const user = userEvent.setup();
    renderReport({
      ...session,
      result: {
        ...session.result!, overallScore: 72.5, scoreBeforePenalty: 90.625, scoreFormula: 'Weighted',
        skipPenalty: true, seedAnswered: 3, seedTotal: 4,
        criteriaScores: [
          { name: 'Communication', score: 4, maxScore: 5, effectiveWeight: 0.6, contribution: 54.38 },
          { name: 'Technical depth', score: 3, maxScore: 5, effectiveWeight: 0.4, contribution: 36.25 },
        ],
        unassessedCriteria: [{ criterionId: 'c3', name: 'System design', weight: 0.2 }],
      },
    });

    await user.click(screen.getByRole('tab', { name: 'practice.result.quickCriteria' }));

    expect(screen.getByTestId('weighted-score-formula')).toHaveTextContent('90.625');
    expect(screen.getByTestId('weighted-score-formula')).toHaveTextContent('3/4');
    expect(screen.getByRole('columnheader', { name: 'practice.result.effectiveWeight' })).toBeInTheDocument();
    expect(screen.getByText('60.00%')).toBeInTheDocument();
    expect(screen.getByText('54.38%')).toBeInTheDocument();
    expect(screen.getByText('90.63%')).toBeInTheDocument();
    // Dòng tổng = tổng TRƯỚC phạt (khớp các dòng và {before}), không phải điểm cuối 72.5 sau phạt 3/4.
    expect(screen.getByTestId('weighted-total')).toHaveTextContent('90.6/100');
    expect(screen.getByTestId('weighted-total')).not.toHaveTextContent('72.5');
    expect(screen.getByText('System design')).toBeInTheDocument();
    expect(screen.getByText('practice.result.unassessed.notAsked')).toBeInTheDocument();
    expect(screen.getByText('practice.result.unassessed.reweighted')).toBeInTheDocument();
  });

  it('renders the raw weighted session fixture through the API mapper', async () => {
    const user = userEvent.setup();
    renderReport(mapPracticeSessionResponse(weightedSessionFixture));
    await user.click(screen.getByRole('tab', { name: 'practice.result.quickCriteria' }));

    expect(screen.getByTestId('weighted-score-formula')).toHaveTextContent('Score 81.405; penalty answered 2/3; final 54.27');
    expect(screen.getByRole('columnheader', { name: 'practice.result.effectiveWeight' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'practice.result.contribution' })).toBeInTheDocument();
    expect(screen.getByText('60.00%')).toBeInTheDocument();
    expect(screen.getByText('48.84%')).toBeInTheDocument();
    expect(screen.getByText('Thiết kế hệ thống')).toBeInTheDocument();
    expect(screen.getByText('practice.result.unassessed.notAsked')).toBeInTheDocument();

    cleanup();
    const oldSession = mapPracticeSessionResponse(legacySessionFixture);
    renderReport(oldSession, '/practice/result?sessionId=legacy');
    await user.click(screen.getByRole('tab', { name: 'practice.result.quickCriteria' }));
    expect(screen.queryByTestId('weighted-score-formula')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'practice.result.effectiveWeight' })).not.toBeInTheDocument();
  });

  it.each(['Average', null] as const)('%s formula keeps the existing unweighted layout', async (scoreFormula) => {
    const user = userEvent.setup();
    renderReport({ ...session, result: { ...session.result!, scoreFormula } });
    await user.click(screen.getByRole('tab', { name: 'practice.result.quickCriteria' }));
    expect(screen.queryByTestId('weighted-score-formula')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'practice.result.weight' })).not.toBeInTheDocument();
  });

  it('shows question picker only on questions tab and switches detail', async () => {
    const user = userEvent.setup();
    renderReport();

    await user.click(screen.getByRole('tab', { name: 'practice.result.quickQuestions' }));

    expect(screen.getByText('practice.result.jumpToQuestion')).toBeInTheDocument();
    expect(screen.getByText('Tell me about yourself.')).toBeInTheDocument();
    expect(screen.queryByText('Describe a conflict.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'practice.result.question 2' }));

    expect(screen.getByText('Describe a conflict.')).toBeInTheDocument();
    expect(screen.queryByText('Tell me about yourself.')).not.toBeInTheDocument();
  });

  it('does not show the overall feedback tab', () => {
    renderReport();

    expect(screen.queryByRole('tab', { name: 'practice.result.quickFeedback' })).not.toBeInTheDocument();
  });
});
