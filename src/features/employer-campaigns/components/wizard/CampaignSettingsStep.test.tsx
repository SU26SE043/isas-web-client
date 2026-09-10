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
  maxQuestions: 5,
  maxDeepPerQuestion: 3,
};

const baseProps = {
  settings,
  onChange: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
};

describe('CampaignSettingsStep adaptive budget for fixed and draw modes', () => {
  it('warns when all mode uses the twenty-question fixed set', () => {
    render(<CampaignSettingsStep {...baseProps} questionCount={20} />);

    expect(screen.getByRole('alert')).toHaveTextContent('1');
  });

  it('does not warn when the configured total budget fits draw mode', () => {
    render(
      <CampaignSettingsStep
        {...baseProps}
        settings={{ ...settings, maxQuestions: 20 }}
        questionCount={5}
      />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
