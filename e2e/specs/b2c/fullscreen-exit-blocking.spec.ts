import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';
import { installMockMedia } from '../../fixtures/media';

test.describe('B2C fullscreen recovery gate', () => {
  test.setTimeout(90_000);

  test('pauses the interview until fullscreen is successfully restored', async ({ page }) => {
    await page.addInitScript(() => {
      let fullscreenExited = false;
      let shouldFail = false;

      Object.defineProperty(Document.prototype, 'fullscreenElement', {
        configurable: true,
        get: () => fullscreenExited ? null : document.documentElement,
      });
      Object.defineProperty(Element.prototype, 'requestFullscreen', {
        configurable: true,
        value: async () => {
          if (shouldFail) return;
          fullscreenExited = false;
          document.dispatchEvent(new Event('fullscreenchange'));
        },
      });
      Object.defineProperty(Document.prototype, 'exitFullscreen', {
        configurable: true,
        value: async () => {
          fullscreenExited = true;
          document.dispatchEvent(new Event('fullscreenchange'));
        },
      });

      Object.assign(window, {
        __setFullscreenRecoveryFailure: (value: boolean) => {
          shouldFail = value;
        },
        __exitFullscreenForTest: () => {
          fullscreenExited = true;
          document.dispatchEvent(new Event('fullscreenchange'));
        },
      });
    });
    await installMockMedia(page);
    await loginAs(page, 'Candidate');
    await page.goto('/interview/session-a11ce/room');
    await expect(page).toHaveURL(/\/interview\/session-a11ce\/room/);
    const submit = page.locator('button').filter({ hasText: /Submit answer/i }).first();
    const timer = page.locator('p.tabular-nums').first();
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await expect(timer).toHaveText(/0[12]:\d{2}/, { timeout: 10_000 });

    await page.evaluate(() => {
      (window as typeof window & { __exitFullscreenForTest: () => void }).__exitFullscreenForTest();
    });

    const dialog = page.getByRole('dialog', { name: /You exited fullscreen mode/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/interview is paused/i)).toBeVisible();
    await expect(submit).toBeDisabled();

    await page.waitForTimeout(100);
    const pausedAt = await timer.textContent();
    await page.waitForTimeout(1_200);
    await expect(timer).toHaveText(pausedAt ?? '');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();

    await page.evaluate(() => {
      (window as typeof window & { __setFullscreenRecoveryFailure: (value: boolean) => void })
        .__setFullscreenRecoveryFailure(true);
    });
    await dialog.getByRole('button', { name: /Return to fullscreen/i }).click();
    await expect(dialog.getByRole('alert')).toContainText(/could not be restored/i);
    await expect(dialog).toBeVisible();

    await page.evaluate(() => {
      (window as typeof window & { __setFullscreenRecoveryFailure: (value: boolean) => void })
        .__setFullscreenRecoveryFailure(false);
    });
    await dialog.getByRole('button', { name: /Return to fullscreen/i }).click();

    await expect(dialog).toBeHidden();
    await expect(submit).toBeEnabled();
  });
});
