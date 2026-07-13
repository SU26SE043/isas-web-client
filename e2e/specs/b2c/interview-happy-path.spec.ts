import { expect, test } from '@playwright/test';
import { installMockMedia } from '../../fixtures/media';
import { loginAs } from '../../fixtures/auth';

test.describe('B2C interview happy path', () => {
  test.setTimeout(90_000);

  test('candidate completes practice flow from prepare to complete', async ({ page }) => {
    await installMockMedia(page);
    await loginAs(page, 'candidate');

    await page.goto('/practice');
    await expect(page).toHaveURL(/\/interview\/session-123\/prepare/);

    await page.getByRole('checkbox', { name: /I consent to recording/i }).check();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/\/device-check/);
    await expect(page.getByText(/Camera and microphone are ready/i)).toBeVisible();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/\/identity/);
    await page.getByRole('button', { name: /Capture photo/i }).click();
    await expect(page.getByRole('img', { name: /Identity verification photo/i })).toBeVisible();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/\/waiting/);
    await expect(page).toHaveURL(/\/room/, { timeout: 8_000 });
    await expect(page.getByRole('heading', { name: /Mock Interview/i })).toBeVisible();

    for (let index = 0; index < 3; index += 1) {
      await page.getByRole('button', { name: /Submit answer/i }).evaluate((button) => {
        (button as HTMLButtonElement).click();
      });
      if (index < 2) {
        await expect(page.getByRole('button', { name: /Submit answer/i })).toBeEnabled({ timeout: 6_000 });
      }
    }

    await expect(page).toHaveURL(/\/complete/, { timeout: 12_000 });
    await expect(page.getByRole('heading', { name: /Interview complete/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Assessment ID: assessment-session-123/i)).toBeVisible();
  });
});
