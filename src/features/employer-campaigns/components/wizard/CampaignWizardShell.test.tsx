/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignWizardShell, autosaveLabel } from './CampaignWizardShell';
import { canNavigateToWizardStep } from './campaignWizard.steps';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(() => {
  cleanup();
});

const titleKeys = {
  info: 'employer.campaigns.wizard.steps.info',
  jd: 'employer.campaigns.wizard.steps.jd',
  criteria: 'employer.campaigns.wizard.steps.criteria',
};

function renderShell(onStepChange = vi.fn()) {
  render(
    <MemoryRouter>
      <CampaignWizardShell
        currentStep={1}
        completedSteps={[0]}
        onStepChange={onStepChange}
        autosaveStatus="saved"
        lastSavedAt="2026-09-07T12:34:00.000Z"
      >
        <div>content</div>
      </CampaignWizardShell>
    </MemoryRouter>,
  );
  return onStepChange;
}

function renderShellMarkup() {
  return render(
    <MemoryRouter>
      <CampaignWizardShell
        currentStep={1}
        completedSteps={[0]}
        onStepChange={vi.fn()}
        autosaveStatus="saved"
        lastSavedAt="2026-09-07T12:34:00.000Z"
      >
        <div>content</div>
      </CampaignWizardShell>
    </MemoryRouter>,
  );
}

function buttonsFor(titleKey: string) {
  return screen.getAllByRole('button').filter((button) => button.textContent?.includes(titleKey));
}

describe('CampaignWizardShell navigation and save vocabulary', () => {
  it('makes completed steps navigable buttons', () => {
    const onStepChange = renderShell();

    const buttons = buttonsFor(titleKeys.info);
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toBeEnabled();
    fireEvent.click(buttons[0]);
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it('disables pending steps visibly and natively', () => {
    renderShell();

    const buttons = buttonsFor(titleKeys.criteria);
    expect(buttons).toHaveLength(2);
    expect(buttons.every((button) => button.hasAttribute('disabled'))).toBe(true);
    expect(buttons.every((button) => button.className.includes('disabled:opacity-55'))).toBe(true);
  });

  it('marks the current step with aria-current', () => {
    renderShell();

    const buttons = buttonsFor(titleKeys.jd);
    expect(buttons).toHaveLength(2);
    expect(buttons.every((button) => button.getAttribute('aria-current') === 'step')).toBe(true);
  });

  it('uses native button type for every step control', () => {
    renderShell();

    const stepButtons = screen.getAllByRole('button').filter((button) =>
      Object.values(titleKeys).some((key) => button.textContent?.includes(key)),
    );
    expect(stepButtons).toHaveLength(6);
    stepButtons.forEach((button) => expect(button).toHaveAttribute('type', 'button'));
  });

  it('uses the saving label while a request is active', () => {
    expect(autosaveLabel((key) => key, 'saving')).toBe(
      'employer.campaigns.wizard.autosave.saving',
    );
  });

  it('uses the unsaved-changes label for dirty state', () => {
    expect(autosaveLabel((key) => key, 'dirty')).toBe(
      'employer.campaigns.wizard.autosave.dirty',
    );
  });

  it('labels a server-loaded untouched wizard as saved', () => {
    expect(autosaveLabel((key) => key, 'saved')).toBe(
      'employer.campaigns.wizard.autosave.saved',
    );
  });

  it('formats a saved timestamp with the single saved vocabulary', () => {
    expect(autosaveLabel((key) => key, 'saved', '2026-09-07T12:34:00.000Z')).toContain(
      'employer.campaigns.wizard.autosave.savedAt',
    );
  });

  it('allows only current or completed wizard steps', () => {
    expect(canNavigateToWizardStep(1, 1, [0])).toBe(true);
    expect(canNavigateToWizardStep(0, 1, [0])).toBe(true);
    expect(canNavigateToWizardStep(2, 1, [0])).toBe(false);
  });

  it('rejects wizard step indexes outside the step list', () => {
    expect(canNavigateToWizardStep(-1, 1, [0])).toBe(false);
    expect(canNavigateToWizardStep(7, 1, [0])).toBe(false);
  });
});

describe('CampaignWizardShell header does not repeat the stepper', () => {
  it('drops the progress percent entirely', () => {
    const { container } = renderShellMarkup();

    expect(container.textContent).not.toContain('employer.campaigns.wizard.progress');
  });

  it('keeps the step counter only below the sm breakpoint', () => {
    const { container } = renderShellMarkup();

    const counter = [...container.querySelectorAll('span')].find((element) =>
      element.textContent?.includes('employer.campaigns.wizard.stepCounter'),
    );
    expect(counter).toBeDefined();
    expect(counter?.className).toContain('sm:hidden');
  });

  it('still shows the autosave status at every breakpoint', () => {
    const { container } = renderShellMarkup();

    const autosave = [...container.querySelectorAll('p')].find((element) =>
      element.textContent?.includes('employer.campaigns.wizard.autosave.savedAt'),
    );
    expect(autosave).toBeDefined();
    expect(autosave?.className).not.toContain('hidden');
  });
});

describe('CampaignWizardShell stepper labels fit one line', () => {
  it('uses the short settings label in both steppers', () => {
    renderShellMarkup();

    expect(screen.getAllByText('employer.campaigns.wizard.steps.settingsShort')).toHaveLength(2);
    expect(screen.queryAllByText('employer.campaigns.wizard.steps.settings')).toHaveLength(0);
  });

  it('leaves steps without a short label on their original key', () => {
    renderShellMarkup();

    expect(screen.getAllByText('employer.campaigns.wizard.steps.review')).toHaveLength(2);
  });
});
