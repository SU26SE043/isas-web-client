/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it.each([
    ['settings-anti-cheat', { antiCheatEnabled: false }],
    ['settings-face-verify', { faceVerifyEnabled: true }],
    ['settings-adaptive', { adaptiveEnabled: false }],
  ] as const)('chỉ cập nhật toggle %s mà không chạm các setting khác', (id, patch) => {
    const onChange = vi.fn();
    render(<CampaignSettingsStep {...baseProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: id === 'settings-anti-cheat'
      ? 'employer.campaigns.form.antiCheat'
      : id === 'settings-face-verify'
        ? 'employer.campaigns.form.faceVerify'
        : 'employer.campaigns.form.adaptive' }));

    expect(onChange).toHaveBeenCalledWith(patch);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('uses the system adaptive limit instead of a manual question limit', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/features/employer-campaigns/components/wizard/CampaignSettingsStep.tsx'), 'utf8');
    const call = source.match(/const adaptiveBudget = calculateAdaptiveQuestionBudget\(([\s\S]*?)\n  \);/)?.[1] ?? '';
    expect(call).not.toContain('settings.maxQuestions');
    expect(call).not.toMatch(/adaptiveEnabled,\s*\d+/);
  });
});
