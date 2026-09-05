import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignSettingsStep } from './CampaignSettingsStep';
import { employerCampaignTranslations } from '../../languages/translations';
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t }) }));
const t = (key: string) => employerCampaignTranslations.vi[key] ?? key;
const settings = { antiCheatEnabled: true, faceVerifyEnabled: true, adaptiveEnabled: true, maxFollowUps: 2, maxQuestions: 12, maxDeepPerQuestion: 0 };
function show(depth = 0) {
  const onChange = vi.fn();
  render(<CampaignSettingsStep settings={{ ...settings, maxDeepPerQuestion: depth }} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />);
  return onChange;
}
afterEach(cleanup);
describe('F6 adaptive depth controls', () => {
  it.each([1, 3])('hides the follow-up input for depth %s and keeps question limit', (depth) => {
    show(depth);
    expect(screen.queryByLabelText(t('employer.campaigns.form.maxFollowUps'))).not.toBeInTheDocument();
    expect(screen.getByLabelText(t('employer.campaigns.form.maxQuestionsSetting'))).toHaveValue(12);
  });
  it('shows the follow-up input for legacy zero-depth setting', () => {
    show(); expect(screen.getByLabelText(t('employer.campaigns.form.maxFollowUps'))).toHaveValue(2);
  });
  it('shows localized presets without internal d=1/d=3 jargon', () => {
    const { container } = render(<CampaignSettingsStep settings={settings} onChange={vi.fn()} onBack={vi.fn()} onNext={vi.fn()} />);
    ['off', 'light', 'deep'].forEach((key) => expect(screen.getByText(t(`employer.campaigns.form.adaptivePreset.${key}`))).toBeVisible());
    expect(container).not.toHaveTextContent(/d\s*=\s*[13]/);
  });
  it('selects deep preset using depth 3 and clears legacy follow-up budget', () => {
    const onChange = show(); fireEvent.click(screen.getByText(t('employer.campaigns.form.adaptivePreset.deep')));
    expect(onChange).toHaveBeenCalledWith({ maxDeepPerQuestion: 3, maxFollowUps: 0 });
  });
});
