import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';
import { installMockMedia } from '../../fixtures/media';

test.describe('B2B campaign anti-cheat API v10', () => {
  test.describe.configure({ timeout: 60_000 });
  test('paste opens a non-blocking warning and keeps the interview running', async ({ page }) => {
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
    const warning = page.getByRole('status');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText(/Paste action detected|thao tác dán nội dung/i);
    await expect(warning.getByRole('button')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const finishButton = page.locator('button', { hasText: /^Finish$/ });
    await expect(finishButton).toBeEnabled();
    const timerBefore = await timer.textContent();
    await page.waitForTimeout(2_000);
    await expect.poll(() => timer.textContent()).not.toBe(timerBefore ?? '');
    await page.screenshot({ path: 'test-results/fs129-anti-cheat/paste-warning-desktop.png', fullPage: true });
    await expect(warning).toBeHidden({ timeout: 4_000 });
    await expect.poll(() => flags).toEqual([{
      signalType: 'paste',
      note: 'Candidate attempted to paste content during the interview.',
    }]);
    await page.screenshot({ path: 'test-results/fs129-anti-cheat/resumed-room-desktop.png', fullPage: true });
  });

  test('tab switching and focus loss stay non-blocking while fullscreen recovery stays actionable', async ({ page }) => {
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
    const timerBefore = await timer.textContent();
    await page.waitForTimeout(1_200);
    await expect.poll(() => timer.textContent()).not.toBe(timerBefore ?? '');
    const warning = page.getByRole('status');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText(/Tab switch|chuyển tab/i);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Enable fullscreen|Bật toàn màn hình/i })).toBeVisible();
    await expect.poll(() => flags).toEqual([{
      signalType: 'tab_switch',
      note: 'Candidate left the interview window using Alt+Tab or window switching.',
    }]);

    await page.screenshot({ path: 'test-results/fs129-anti-cheat/alt-tab-warning-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: 'test-results/fs129-anti-cheat/alt-tab-warning-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.getByRole('button', { name: /Enable fullscreen|Bật toàn màn hình/i }).click();
    await expect(page.getByRole('button', { name: /Enable fullscreen|Bật toàn màn hình/i })).toBeHidden();

    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.waitForTimeout(350);
    const focusWarning = page.getByRole('status');
    await expect(focusWarning).toBeVisible();
    await expect(focusWarning).toContainText(/focus|tập trung/i);
    await expect.poll(() => flags).toHaveLength(2);
    await page.screenshot({ path: 'test-results/fs129-anti-cheat/focus-lost-warning-desktop.png', fullPage: true });
  });
});
