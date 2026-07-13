import { expect, test } from '@playwright/test';
import { installMockMedia, restoreVisibleTab, triggerTabSwitchViolation } from '../../fixtures/media';
import { loginAs } from '../../fixtures/auth';

test.describe('B2B magic link interview', () => {
  test.setTimeout(90_000);

  test('candidate opens magic link, reviews briefing, and completes proctored assessment', async ({ page }) => {
    await installMockMedia(page);
    await loginAs(page, 'candidate');

    await page.goto('/invite/phase8-valid');
    await expect(page.getByRole('heading', { name: /^Campaign briefing$/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Frontend Engineer Assessment/i })).toBeVisible();
    await expect(page.getByText(/Camera required/i)).toBeVisible();

    await page.getByRole('button', { name: /Start assessment/i }).click();
    await expect(page).toHaveURL(/\/interview\/campaign-frontend-engineer-remote\/prepare/);

    await page.getByRole('checkbox', { name: /I consent to recording/i }).check();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/\/device-check/);
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/\/terms/);
    await page.getByRole('checkbox', { name: /accept the assessment terms/i }).check();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/\/identity/);
    await page.getByRole('button', { name: /Capture photo/i }).click();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/\/waiting/);
    await expect(page).toHaveURL(/\/room/, { timeout: 8_000 });
    await expect(page.getByRole('heading', { name: /Mock Interview/i })).toBeVisible();

    await triggerTabSwitchViolation(page);
    await expect(page.getByRole('alert')).toContainText(/Proctoring alert: tab switch detected 1 time/i);
    await expect(page.getByRole('heading', { name: /Return to the interview window/i })).toBeVisible();
    await restoreVisibleTab(page);
    await expect(page.getByRole('heading', { name: /Return to the interview window/i })).toBeHidden();
    await page.getByRole('button', { name: /Continue interview/i }).evaluate((button) => {
      (button as HTMLButtonElement).click();
    });

    await page.getByRole('button', { name: /Submit answer/i }).evaluate((button) => {
      (button as HTMLButtonElement).click();
    });
    await expect(page.getByRole('button', { name: /Submit answer/i })).toBeEnabled({ timeout: 6_000 });
    await page.getByRole('button', { name: /Submit answer/i }).evaluate((button) => {
      (button as HTMLButtonElement).click();
    });

    await expect(page).toHaveURL(/\/complete/, { timeout: 12_000 });
    await expect(page.getByRole('heading', { name: /Interview complete/i })).toBeVisible();
  });
});
