/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignSettingsStep } from './CampaignSettingsStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      if (key === 'employer.campaigns.form.adaptiveBudgetWarning') {
        return `${key} {max}`;
      }
      if (key === 'employer.campaigns.form.maxQuestionsDerivedValue') return '{{count}} câu';
      if (key === 'employer.campaigns.form.maxQuestionsDerivedFormula') return '= {{base}} câu chính × (1 + {{depth}} câu đào sâu)';
      if (key === 'employer.campaigns.form.maxQuestionsDerivedBaseFormula') return '= {{base}} câu chính';
      return key;
    },
  }),
}));

afterEach(() => cleanup());

const settings = {
  antiCheatEnabled: true,
  faceVerifyEnabled: false,
  adaptiveEnabled: true,
  maxFollowUps: 5,
  maxDeepPerQuestion: 1,
};

const baseProps = {
  settings,
  timeLimitMinutes: 60,
  maxAttempts: 1,
  onRulesChange: vi.fn(),
  onChange: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
};

describe('CampaignSettingsStep adaptive budget for fixed and draw modes', () => {
  it('shows the derived total and formula', () => {
    render(<CampaignSettingsStep {...baseProps} questionCount={7} />);

    expect(screen.getByText('14 câu')).toBeInTheDocument();
    expect(screen.getByText('= 7 câu chính × (1 + 1 câu đào sâu)')).toBeInTheDocument();
    expect(document.querySelector('#settings-max-questions')).not.toBeInTheDocument();
  });

  it('updates when the question count or depth changes and warns over the system cap', () => {
    render(
      <CampaignSettingsStep
        {...baseProps}
        settings={{ ...settings, maxDeepPerQuestion: 1 }}
        questionCount={5}
      />,
    );

    expect(screen.getByText('10 câu')).toBeInTheDocument();
    cleanup();
    render(<CampaignSettingsStep {...baseProps} questionCount={20} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows an empty-state message when step 4 has no questions', () => {
    render(<CampaignSettingsStep {...baseProps} questionCount={0} />);

    expect(screen.getByText('employer.campaigns.form.maxQuestionsDerivedEmpty')).toBeInTheDocument();
    expect(screen.queryByText(/0 câu/)).not.toBeInTheDocument();
  });

  it('shows only the base count when adaptive mode is off', () => {
    render(<CampaignSettingsStep {...baseProps} settings={{ ...settings, adaptiveEnabled: false }} questionCount={7} />);

    expect(screen.getByText('7 câu')).toBeInTheDocument();
    expect(screen.getByText('= 7 câu chính')).toBeInTheDocument();
  });
});
