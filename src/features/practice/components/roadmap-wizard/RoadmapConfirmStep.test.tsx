import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoadmapConfirmStep } from './RoadmapConfirmStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => key,
  }),
}));

const baseProps = {
  targetLevel: 'junior' as const,
  selectedReports: [],
  focus: '',
  onFocusChange: vi.fn(),
  isSubmitting: false,
  onBack: vi.fn(),
  onConfirm: vi.fn(),
};

function renderStep(overrides: Partial<ComponentProps<typeof RoadmapConfirmStep>> = {}) {
  return render(
    <MemoryRouter>
      <RoadmapConfirmStep
        {...baseProps}
        domain={{ id: 'frontend', name: 'Frontend', nameVi: 'Frontend' } as never}
        cvFiles={[]}
        onCvChange={vi.fn()}
        cvAnalyses={[]}
        onCvAnalysisChange={vi.fn()}
        completedRoadmaps={[]}
        onPriorRoadmapChange={vi.fn()}
        {...overrides}
      />
    </MemoryRouter>,
  );
}

describe('RoadmapConfirmStep source selectors', () => {
  afterEach(() => cleanup());
  it('renders analysis and completed roadmap options and forwards selected ids', async () => {
    const user = userEvent.setup();
    const onCvAnalysisChange = vi.fn();
    const onPriorRoadmapChange = vi.fn();

    renderStep({
      cvAnalyses: [{ id: 'analysis-1', jobCategory: 'FE', createdAt: '2026-01-02T00:00:00Z' } as never],
      onCvAnalysisChange,
      completedRoadmaps: [{ id: 'roadmap-1', name: 'Earlier path', nameVi: 'Lộ trình cũ' } as never],
      onPriorRoadmapChange,
    });

    expect(screen.getByRole('option', { name: /FE/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Earlier path' })).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'practice.roadmapWizard.confirm.cvAnalysis' }), 'analysis-1');
    await user.selectOptions(screen.getByRole('combobox', { name: 'practice.roadmapWizard.confirm.priorRoadmap' }), 'roadmap-1');

    expect(onCvAnalysisChange).toHaveBeenCalledWith('analysis-1');
    expect(onPriorRoadmapChange).toHaveBeenCalledWith('roadmap-1');

    await user.selectOptions(screen.getByRole('combobox', { name: 'practice.roadmapWizard.confirm.cvAnalysis' }), '');
    await user.selectOptions(screen.getByRole('combobox', { name: 'practice.roadmapWizard.confirm.priorRoadmap' }), '');
    expect(onCvAnalysisChange).toHaveBeenLastCalledWith(undefined);
    expect(onPriorRoadmapChange).toHaveBeenLastCalledWith(undefined);
  });

  it('shows empty states without rendering empty selects', () => {
    const onCvAnalysisChange = vi.fn();
    const onPriorRoadmapChange = vi.fn();

    renderStep({
      cvAnalyses: [],
      onCvAnalysisChange,
      completedRoadmaps: [],
      onPriorRoadmapChange,
    });

    expect(screen.queryByText('practice.roadmapWizard.confirm.cvAnalysisNone')).toBeInTheDocument();
    expect(screen.queryByText('practice.roadmapWizard.confirm.priorRoadmapNone')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'practice.roadmapWizard.confirm.cvAnalysis' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'practice.roadmapWizard.confirm.priorRoadmap' })).not.toBeInTheDocument();
    expect(onCvAnalysisChange).not.toHaveBeenCalled();
    expect(onPriorRoadmapChange).not.toHaveBeenCalled();
  });
});
