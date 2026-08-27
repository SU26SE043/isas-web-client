// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PracticeSetupSummaryStepProps } from './PracticeSetupSummaryStep';
import { PracticeSetupSummaryStep } from './PracticeSetupSummaryStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => ({
      'practice.setup.jobCategory.BE': 'Backend Developer',
      'practice.wizard.level.junior': 'Junior',
      'practice.setup.summary.gradingCriteria': 'Grading criteria',
      'practice.setup.summary.criteriaCount': '{count} criteria',
      'practice.setup.summary.editCriteria': 'Edit criteria',
      'practice.topics.compact':
        'This session will focus on the professional areas of {category} at {seniority} level.',
    }[key] ?? key),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseProps: PracticeSetupSummaryStepProps = {
  jobCategory: 'BE',
  cvFile: null,
  jdFile: null,
  jdText: '',
  jdTab: 'file',
  timeLimitSec: 120,
  seniority: 'Junior',
  questionCount: 5,
  adaptiveEnabled: false,
  maxDeepPerQuestion: null,
  criteria: [{ id: 'communication', name: 'Communication', description: '', weight: 100, maxScore: 10 }],
  canStart: true,
  isCreating: false,
  errorCode: null,
  errorMessage: null,
  onBack: vi.fn(),
  onEditCriteria: vi.fn(),
  onStart: vi.fn(),
  onClearError: vi.fn(),
};

describe('PracticeSetupSummaryStep F3 topic preview', () => {
  it('keeps the compact topic sentence inside the existing criteria block', () => {
    render(
      <MemoryRouter>
        <PracticeSetupSummaryStep {...baseProps} />
      </MemoryRouter>,
    );

    const criteriaBlock = document.querySelector('[aria-labelledby="practice-summary-criteria"]');
    expect(criteriaBlock).not.toBeNull();
    expect(criteriaBlock).toContainElement(screen.getByTestId('practice-session-topics-compact'));
    expect(screen.getByText(/Backend Developer at Junior level/)).toBeInTheDocument();
    expect(criteriaBlock?.querySelector('ol')).toBeNull();
  });

  it('does not show the compact preview when no job category is selected', () => {
    render(
      <MemoryRouter>
        <PracticeSetupSummaryStep {...baseProps} jobCategory={null} />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('practice-session-topics-compact')).not.toBeInTheDocument();
  });
});
