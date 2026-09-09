/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RubricCriterion } from '../../../types/campaignManagement.types';
import { CampaignCriteriaManualList } from '../CampaignCriteriaManualList';
import { shouldShowRubricSummary } from '../CampaignCriteriaStepV2';
import { CampaignRubricTotalWeight } from './CampaignRubricTotalWeight';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(() => {
  cleanup();
});

const criterion = (id: string, weight: number): RubricCriterion => ({
  id,
  name: `Criterion ${id}`,
  description: '',
  weight,
  maxScore: 10,
});

function renderTotal(rubric: RubricCriterion[]) {
  const totalWeight = rubric.reduce((sum, item) => sum + item.weight, 0);
  render(
    <CampaignRubricTotalWeight
      totalWeight={totalWeight}
      totalMaxScore={rubric.reduce((sum, item) => sum + item.maxScore, 0)}
      weightValid={Math.round(totalWeight * 10) / 10 === 100}
      maxScoreValid={rubric.every((item) => item.maxScore >= 1 && item.maxScore <= 10)}
      hasCriteria={rubric.length > 0}
      onReset={() => undefined}
    />,
  );
}

describe('CampaignRubricTotalWeight — empty and invalid states', () => {
  it('keeps the empty rubric neutral instead of showing an error', () => {
    renderTotal([]);

    expect(screen.getByText('0%')).not.toHaveClass('text-error');
    expect(screen.getByText('employer.campaigns.wizard.rubric.mustEqual100')).not.toHaveClass(
      'text-error',
    );
  });

  it('shows the weight error after a criterion is entered with a 50% total', () => {
    renderTotal([criterion('one', 50)]);

    expect(screen.getByText('50%')).toHaveClass('text-error');
  });

  it('clears the weight error when entered criteria total 100%', () => {
    renderTotal([criterion('one', 50), criterion('two', 50)]);

    expect(screen.getByText('100%')).not.toHaveClass('text-error');
  });

  it('replaces the empty list header with the two starting paths', () => {
    render(
      <CampaignCriteriaManualList
        rubric={[]}
        onChangeRubric={() => undefined}
      />,
    );

    expect(screen.queryByText('employer.campaigns.wizard.rubric.colCriterion')).not.toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.wizard.rubric.emptyTitle')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.wizard.rubric.emptyStandardTitle')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.wizard.rubric.emptyManualTitle')).toBeInTheDocument();
  });

  it('hides the criteria summary strip until the first criterion exists', () => {
    expect(shouldShowRubricSummary([])).toBe(false);
    expect(shouldShowRubricSummary([criterion('one', 100)])).toBe(true);
  });
});
