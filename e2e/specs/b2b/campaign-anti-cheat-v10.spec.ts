import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';
import { installMockMedia } from '../../fixtures/media';

test.describe('B2B campaign anti-cheat API v10', () => {
  test.describe.configure({ timeout: 60_000 });
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
    await expect(page.getByText('Describe a difficult product decision you made.')).toBeVisible({ timeout: 15_000 });
    // Violations are only counted once the start countdown has finished.
    await expect(page.locator('.countdown-ring')).toBeHidden({ timeout: 20_000 });
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

  test('Alt+Tab, tab switching, and fullscreen exit are blocking and deduplicated', async ({ page }) => {
    await installMockMedia(page);
    await page.addInitScript(() => {
      let fullscreenElement: Element | null = null;
      let failNextFullscreen = false;
      Object.defineProperty(Document.prototype, 'fullscreenElement', {
        configurable: true,
        get: () => fullscreenElement,
      });
      Object.defineProperty(Element.prototype, 'requestFullscreen', {
        configurable: true,
        value: async function requestFullscreen() {
          if (failNextFullscreen) {
            failNextFullscreen = false;
            throw new Error('Fullscreen denied');
          }
          fullscreenElement = this;
          document.dispatchEvent(new Event('fullscreenchange'));
        },
      });
      Object.defineProperty(window, '__setFullscreenTestState', {
        configurable: true,
        value: (active: boolean, failNext = false) => {
          fullscreenElement = active ? document.documentElement : null;
          failNextFullscreen = failNext;
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
    await expect(page.getByText('Describe a difficult product decision you made.')).toBeVisible({ timeout: 15_000 });
    // Violations are only counted once the start countdown has finished.
    await expect(page.locator('.countdown-ring')).toBeHidden({ timeout: 20_000 });
    expect(flags).toHaveLength(0);

    const timer = page.locator('.tabular-nums').first();
    const dialog = page.getByRole('dialog', { name: /Violation detected/i });
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
      const setFullscreen = (window as Window & {
        __setFullscreenTestState: (active: boolean) => void;
      }).__setFullscreenTestState;
      setFullscreen(false);
    });
    await page.waitForTimeout(350);
    const pausedAt = await timer.textContent();
    await page.waitForTimeout(1_200);
    await expect(timer).toHaveText(pausedAt ?? '');
    await expect(dialog).toBeHidden();
    await expect.poll(() => flags).toEqual([{
      signalType: 'tab_switch',
      note: 'Candidate left the interview window using Alt+Tab or window switching.',
    }]);

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
    });
    await expect(dialog).toBeVisible();
    await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveClass(/backdrop-blur-md/);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await page.screenshot({ path: 'test-results/fs129-anti-cheat/alt-tab-warning-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: 'test-results/fs129-anti-cheat/alt-tab-warning-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 720 });
    await dialog.getByRole('button', { name: /Continue interview/i }).click();
    await expect(dialog).toBeHidden();

    await page.waitForTimeout(1_600);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect.poll(() => flags).toHaveLength(2);
    await page.waitForTimeout(350);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(dialog).toBeVisible();
    expect(flags[1]).toEqual({
      signalType: 'tab_switch',
      note: 'Candidate switched away from the interview tab.',
    });
    await dialog.getByRole('button', { name: /Continue interview/i }).click();
    await expect(dialog).toBeHidden();

    await page.waitForTimeout(1_600);
    await page.evaluate(() => {
      const setFullscreen = (window as Window & {
        __setFullscreenTestState: (active: boolean, failNext?: boolean) => void;
      }).__setFullscreenTestState;
      setFullscreen(false, true);
    });
    await expect(dialog).toBeVisible();
    await expect.poll(() => flags).toHaveLength(3);
    expect(flags[2]).toEqual({
      signalType: 'tab_switch',
      note: 'Candidate exited fullscreen mode.',
    });
    await dialog.getByRole('button', { name: /Continue interview/i }).click();
    await expect(dialog).toContainText(/Fullscreen could not be enabled/i);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /Try again/i }).click();
    await expect(dialog).toBeHidden();
    await page.screenshot({ path: 'test-results/fs129-anti-cheat/resumed-after-window-leave-desktop.png', fullPage: true });
  });
});
