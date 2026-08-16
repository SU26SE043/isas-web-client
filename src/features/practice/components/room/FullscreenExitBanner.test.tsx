/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FullscreenExitBanner } from './FullscreenExitBanner';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en' as const,
    setLanguage: vi.fn(),
  }),
}));

describe('FullscreenExitBanner', () => {
  let fullscreenElement: Element | null;
  let requestFullscreen: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fullscreenElement = null;
    requestFullscreen = vi.fn(async () => {
      fullscreenElement = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreenElement,
    });
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
  });

  afterEach(() => cleanup());

  function exitFullscreen() {
    fullscreenElement = document.documentElement;
    document.dispatchEvent(new Event('fullscreenchange'));
    fullscreenElement = null;
    document.dispatchEvent(new Event('fullscreenchange'));
  }

  it('blocks after fullscreen exit and only closes after fullscreen is restored', async () => {
    const onBlockingChange = vi.fn();
    render(<FullscreenExitBanner onBlockingChange={onBlockingChange} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    exitFullscreen();

    const dialog = await screen.findByRole('dialog', {
      name: 'practice.fullscreen.exitedTitle',
    });
    expect(dialog).toBeVisible();
    expect(onBlockingChange).toHaveBeenLastCalledWith(true);

    await userEvent.keyboard('{Escape}');
    expect(dialog).toBeVisible();

    await userEvent.click(screen.getByRole('button', {
      name: 'practice.fullscreen.reenter',
    }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(onBlockingChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps the dialog open and shows retry feedback when recovery fails', async () => {
    requestFullscreen.mockImplementationOnce(async () => undefined);
    render(<FullscreenExitBanner />);
    exitFullscreen();

    await userEvent.click(await screen.findByRole('button', {
      name: 'practice.fullscreen.reenter',
    }));

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('practice.fullscreen.reenterFailed');
  });
});
