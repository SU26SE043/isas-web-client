// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PracticeSessionResponse } from '../../types/b2cPracticeSession.types';
import { PracticeLiveResultReport } from './PracticeLiveResultReport';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
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
    { id: 'q1', orderNo: 1, content: 'Tell me about yourself.', timeLimitSec: 120 },
    { id: 'q2', orderNo: 2, content: 'Describe a conflict.', timeLimitSec: 120 },
  ],
  answers: [
    {
      questionId: 'q1',
      answerId: 'a1',
      status: 'Scored',
      transcript: 'I am a developer.',
      score: 4,
      maxScore: 5,
      criteriaScores: [{ name: 'Communication', score: 4, maxScore: 5, pct: 80 }],
    },
    {
      questionId: 'q2',
      answerId: 'a2',
      status: 'Scored',
      transcript: 'I mediated calmly.',
      score: 3,
      maxScore: 5,
      criteriaScores: [{ name: 'Communication', score: 3, maxScore: 5, pct: 60 }],
    },
  ],
  result: {
    overallScore: 70,
    maxScore: 100,
    passThresholdPct: 50,
    overallComment: 'Solid session overall.',
    strengths: ['Clear structure'],
    needsImprovement: ['Add more metrics'],
    nextSteps: ['Practice STAR'],
    criteriaScores: [{ name: 'Communication', score: 7, maxScore: 10, pct: 70 }],
  },
};

function renderReport(url = '/practice/result?sessionId=session-1') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <PracticeLiveResultReport session={session} />
    </MemoryRouter>,
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
    expect(screen.queryByText('practice.result.summary')).not.toBeInTheDocument();
    expect(screen.queryByText('practice.result.jumpToQuestion')).not.toBeInTheDocument();
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

  it('shows summary tab content alone', async () => {
    const user = userEvent.setup();
    renderReport();

    await user.click(screen.getByRole('tab', { name: 'practice.result.quickFeedback' }));

    expect(screen.getByText('Solid session overall.')).toBeInTheDocument();
    expect(screen.getByText('Clear structure')).toBeInTheDocument();
    expect(screen.queryByText('practice.result.criteriaScores')).not.toBeInTheDocument();
    expect(screen.queryByText('practice.result.jumpToQuestion')).not.toBeInTheDocument();
  });
});
