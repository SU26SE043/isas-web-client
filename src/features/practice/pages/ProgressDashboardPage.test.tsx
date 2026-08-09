import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { progressService } from '../services/progress.service';
import { ProgressDashboardPage } from './ProgressDashboardPage';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('../services/progress.service', () => ({
  progressService: { getDashboard: vi.fn() },
}));

vi.mock('../components/progress/RoadmapCompletionDonut', () => ({
  RoadmapCompletionDonut: () => <div>roadmap-chart</div>,
}));
vi.mock('../components/progress/SkillCompletionStackedBar', () => ({
  SkillCompletionStackedBar: () => <div>skills-chart</div>,
}));
vi.mock('../components/progress/PracticeScoreLineChart', () => ({
  PracticeScoreLineChart: () => <div>scores-chart</div>,
}));

const dashboard = {
  roadmapCompletion: { completed: 12, inProgress: 5, locked: 8 },
  skillBreakdown: [],
  practiceScores: [],
};

describe('ProgressDashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('replaces a failed load with a recoverable error and retries successfully', async () => {
    const getDashboard = vi.mocked(progressService.getDashboard);
    getDashboard.mockRejectedValueOnce(new Error('load failed')).mockResolvedValueOnce(dashboard);

    render(<ProgressDashboardPage />);

    expect(await screen.findByText('practice.progress.errorTitle')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'practice.progress.retry' }));

    await waitFor(() => expect(screen.getByText('roadmap-chart')).toBeTruthy());
    expect(screen.getByText('skills-chart')).toBeTruthy();
    expect(screen.getByText('scores-chart')).toBeTruthy();
    expect(getDashboard).toHaveBeenCalledTimes(2);
  });
});
