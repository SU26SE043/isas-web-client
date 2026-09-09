/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion } from '../../../types/campaignManagement.types';
import { CampaignQuestionCard } from './CampaignQuestionCard';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(() => cleanup());

const baseQuestion: CampaignQuestion = {
  id: 'question-1',
  prompt: 'Tell us about a recent project.',
  skill: 'frontend',
  difficulty: 'middle',
  source: 'ai',
  isRequired: false,
};

describe('CampaignQuestionCard placement', () => {
  it('uses a placement menu instead of a required checkbox', () => {
    render(
      <CampaignQuestionCard
        question={baseQuestion}
        index={0}
        total={1}
        onChangePrompt={vi.fn()}
        onToggleRequired={vi.fn()}
        onChangeGroup={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'employer.campaigns.campaignQuestions.question.placement' })).toHaveValue('pool');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
