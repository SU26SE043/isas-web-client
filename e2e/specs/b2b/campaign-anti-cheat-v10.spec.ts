import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';
import { installMockMedia } from '../../fixtures/media';

test.describe('B2B campaign anti-cheat API v10', () => {
  test('paste opens the blocking warning, pauses the timer, and resumes explicitly', async ({ page }) => {
    await installMockMedia(page);
    await page.addInitScript(() => {
      let fullscreenElement: Element | null = null;
      Object.defineProperty(Document.prototype, 'fullscreenElement', {
        configurable: true,
        get: () => fullscreenElement,
      });
      Object.defineProperty(Element.prototype, 'requestFullscreen', {
        configurable: true,
        value: async function requestFullscreen() {
          fullscreenElement = this;
          document.dispatchEvent(new Event('fullscreenchange'));
        },
      });
    });
    await loginAs(page, 'Candidate');

    const flags: Array<Record<string, unknown>> = [];
    await page.route('**/api/v1/campaign/campaign-v10/sessions/session-v10/flags', async (route) => {
      flags.push(route.request().postDataJSON() as Record<string, unknown>);
      await route.fulfill({ status: 204 });
    });
    await page.route('**/api/v1/campaign/campaign-v10/sessions/session-v10/face-check', async (route) => {
      await route.fulfill({ status: 204 });
    });

    await page.evaluate(() => {
      sessionStorage.setItem('isas-campaign-interview:session-v10', JSON.stringify({
        mode: 'b2b-campaign',
        campaignId: 'campaign-v10',
        sessionId: 'session-v10',
        antiCheatEnabled: true,
        faceEnrollRequired: false,
        adaptiveEnabled: false,
        deadlineAt: null,
        startedAt: new Date().toISOString(),
        questions: [{
          id: 'question-v10-1',
          orderNo: 1,
          content: 'Describe a difficult product decision you made.',
          timeLimitSec: 90,
        }],
      }));
    });
    await page.goto('/candidate/campaigns/campaign-v10/interview/session-v10');

    await page.getByRole('button', { name: /Enable fullscreen/i }).click();
    await expect(page.getByText('Describe a difficult product decision you made.')).toBeVisible();
    const timer = page.locator('.tabular-nums').first();
    await expect(timer).toBeVisible();

    await page.evaluate(() => document.dispatchEvent(new Event('paste', { bubbles: true })));
    const dialog = page.getByRole('dialog', { name: /Violation detected/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: /Continue interview/i })).toBeVisible();
    const finishButton = page.locator('button', { hasText: /^Finish$/ });
    await expect(finishButton).toBeDisabled();
    const pausedAt = await timer.textContent();
    await page.waitForTimeout(2_000);
    await expect(timer).toHaveText(pausedAt ?? '');
    await page.screenshot({ path: 'test-results/fs129-anti-cheat/paste-warning-desktop.png', fullPage: true });

    await dialog.getByRole('button', { name: /Continue interview/i }).click();
    await expect(dialog).toBeHidden();
    await expect(finishButton).toBeEnabled();
    await expect.poll(() => flags).toEqual([{
      signalType: 'paste',
      note: 'Candidate attempted to paste content during the interview.',
    }]);
    await page.screenshot({ path: 'test-results/fs129-anti-cheat/resumed-room-desktop.png', fullPage: true });
  });
});
