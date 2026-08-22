import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoadmapModeStep } from './RoadmapModeStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const props = {
  selectedMode: 'LevelUp' as const,
  onSelect: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
  onBackToReports: vi.fn(),
};

describe('RoadmapModeStep', () => {
  afterEach(() => cleanup());
  it('disables Reinforce and offers a reports link with fewer than two sessions', () => {
    render(<RoadmapModeStep {...props} selectedSessionCount={1} />);

    expect(screen.getByRole('button', { name: 'practice.roadmapWizard.mode.reinforce' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'practice.roadmapWizard.mode.backToReports' })).toBeInTheDocument();
  });

  it('enables Reinforce once two sessions are selected', () => {
    render(<RoadmapModeStep {...props} selectedSessionCount={2} />);

    expect(screen.getByRole('button', { name: 'practice.roadmapWizard.mode.reinforce' })).toBeEnabled();
  });
});
