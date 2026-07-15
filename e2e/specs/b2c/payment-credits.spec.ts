import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';
import { completePracticeSetupWizard } from '../../fixtures/practiceWizard';

test.describe('B2C token wallet and checkout', () => {
  test.setTimeout(90_000);

  test('candidate tops up wallet, reserves tokens on practice, and sees usage history', async ({ page }) => {
    await loginAs(page, 'Candidate');

    await page.goto('/candidate/credits');
    await expect(page.getByRole('heading', { name: /^Token wallet$/i })).toBeVisible();
    await expect(page.locator('.heading-primary.text-5xl')).toHaveText('2,500');

    await page.goto('/candidate/subscription');
    await expect(page.getByRole('heading', { name: /Token packages/i })).toBeVisible();
    await page.getByRole('button', { name: /^Continue to checkout$/i }).click();
    await expect(page).toHaveURL(/\/candidate\/payment\?packageId=/);
    await page.getByRole('button', { name: /Pay with PayOS/i }).click();
    await expect(page.getByText(/Payment successful/i)).toBeVisible({ timeout: 15_000 });

    await page.getByRole('link', { name: /View token wallet/i }).click();
    await expect(page.locator('.heading-primary.text-5xl')).toHaveText('17,500', { timeout: 10_000 });

    await completePracticeSetupWizard(page);

    await page.goto('/candidate/credits');
    await expect(page.getByText('Reserved', { exact: true })).toBeVisible();
    await expect(page.locator('dd').filter({ hasText: /^800$/ })).toBeVisible();

    await page.goto('/candidate/usage');
    await expect(page.getByRole('heading', { name: /^Token usage history$/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });
});
