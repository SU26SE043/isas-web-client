// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LearningWaitingStartPanel } from './LearningWaitingStartPanel';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

function renderPanel(isReady: boolean, hasSufficientTokens = true, onCreditOpenChange = vi.fn()) {
  return render(
    <MemoryRouter>
      <LearningWaitingStartPanel
        questionCount={3}
        isStarting={false}
        startError={null}
        creditOpen={false}
        onCreditOpenChange={onCreditOpenChange}
        onStart={vi.fn()}
        canStart
        isReady={isReady}
        hasSufficientTokens={hasSufficientTokens}
        creditsRemaining={3}
      />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe('LearningWaitingStartPanel', () => {
  it('keeps Start disabled while the session is still generating questions', () => {
    renderPanel(false);

    expect(screen.getByText('practice.flow.waiting.polling')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'practice.flow.waiting.start' })).toBeDisabled();
  });

  it('enables Start only after questions are ready', () => {
    renderPanel(true);

    expect(screen.getByText('practice.flow.waiting.readyPreview'.replace('{count}', '3'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'practice.flow.waiting.start' })).toBeEnabled();
  });

  it('warns before starting when the balance is below the one-credit cost', async () => {
    const user = userEvent.setup();
    const onCreditOpenChange = vi.fn();
    renderPanel(true, false, onCreditOpenChange);

    await user.click(screen.getByRole('button', { name: 'practice.flow.waiting.start' }));

    expect(onCreditOpenChange).toHaveBeenCalledWith(true);
  });
});
