import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LearningRoadmapCreditSummary } from './LearningRoadmapCreditSummary';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('LearningRoadmapCreditSummary', () => {
  it('shows remaining credits and current balance', () => {
    render(<LearningRoadmapCreditSummary remainingLessons={14} balance={3} />);

    expect(screen.getByText(/14/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText('practice.learningPath.roadmapCreditsNeeded')).toBeInTheDocument();
    expect(screen.getByText('practice.learningPath.currentBalance')).toBeInTheDocument();
  });
});
