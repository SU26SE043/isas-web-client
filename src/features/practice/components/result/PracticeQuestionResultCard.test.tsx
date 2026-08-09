// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PracticeQuestionResultCard } from './PracticeQuestionResultCard';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

describe('PracticeQuestionResultCard', () => {
  it('renders all AI evaluation fields returned for an answer', () => {
    render(
      <PracticeQuestionResultCard
        defaultOpen
        sessionId="session-1"
        question={{
          questionId: 'q1',
          orderNo: 1,
          content: 'Explain your API design process.',
          timeLimitSec: 120,
          transcript: 'My recorded answer.',
          status: 'Scored',
          answered: true,
          skipped: false,
          criteria: [
            {
              name: 'Communication',
              score: 4,
              maxScore: 5,
              pct: 80,
              comment: 'Clear answer.',
            },
          ],
          speakingMetrics: {
            speechRate: 220,
            longestPauseSec: 1.2,
            hesitationCount: 2,
            silenceRatio: 4,
            fillerWordCount: 1,
          },
          suggestedAnswer: 'A stronger sample answer.',
        }}
      />,
    );

    expect(screen.getByText('Explain your API design process.')).toBeInTheDocument();
    expect(screen.getByText('My recorded answer.')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Clear answer.')).toBeInTheDocument();
    expect(screen.getByText('A stronger sample answer.')).toBeInTheDocument();
  });
});
