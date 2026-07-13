import { expect, test } from '@playwright/test';
import { installMockMedia } from '../../fixtures/media';
import { loginAs } from '../../fixtures/auth';

test.describe('B2C full journey', () => {
  test.setTimeout(120_000);

  test('candidate registers, analyzes CV, tops up wallet, completes practice, and reviews history', async ({ page }) => {
    await page.route('**/api/v1/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'e2e-journey-candidate', email: 'journey@isas.dev' }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('language', 'en');
    });

    await page.goto('/register');
    await page.getByLabel(/full name/i).fill('Journey Candidate');
    await page.getByLabel(/e-mail/i).fill('journey@isas.dev');
    await page.getByLabel(/^password$/i).fill('Password123!Secure');
    await page.getByRole('button', { name: /^Sign up$/i }).click();
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.getByRole('heading', { name: /^Verify email$/i })).toBeVisible();

    await loginAs(page, 'candidate');

    await page.goto('/candidate/cv/analysis');
    await expect(page.getByRole('heading', { level: 1, name: /cv analysis/i })).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'journey-cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 journey cv'),
    });
    await page.getByRole('button', { name: /^next$/i }).first().click();
    await page.getByRole('button', { name: /^next$/i }).click();
    await page.waitForURL(/\/candidate\/cv\/analysis\/report/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1, name: /match report/i })).toBeVisible();

    await page.goto('/candidate/subscription');
    await page.getByRole('button', { name: /^Continue to checkout$/i }).click();
    await expect(page).toHaveURL(/\/candidate\/payment\?packageId=/);
    await page.getByRole('button', { name: /Pay with PayOS/i }).click();
    await expect(page.getByText(/Payment successful/i)).toBeVisible({ timeout: 15_000 });

    await installMockMedia(page);
    await page.goto('/practice');
    await expect(page).toHaveURL(/\/interview\/session-123\/prepare/);
    await page.getByRole('checkbox', { name: /I consent to recording/i }).check();
    await page.getByRole('button', { name: /^Continue$/i }).click();
    await expect(page).toHaveURL(/\/device-check/);
    await page.getByRole('button', { name: /^Continue$/i }).click();
    await expect(page).toHaveURL(/\/waiting/);
    await expect(page).toHaveURL(/\/room/, { timeout: 8_000 });

    for (let index = 0; index < 3; index += 1) {
      await page.getByRole('button', { name: /Submit answer/i }).evaluate((button) => {
        (button as HTMLButtonElement).click();
      });
      if (index < 2) {
        await expect(page.getByRole('button', { name: /Submit answer/i })).toBeEnabled({ timeout: 6_000 });
      }
    }

    await expect(page).toHaveURL(/\/complete/, { timeout: 12_000 });
    await page.getByRole('link', { name: /View result/i }).click();
    await expect(page.getByRole('tab', { name: /^Overview$/i })).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(/Overall score/i)).toBeVisible();

    await page.goto('/candidate/practice/history');
    await expect(page.getByRole('heading', { name: /^Interview History$/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });
});
