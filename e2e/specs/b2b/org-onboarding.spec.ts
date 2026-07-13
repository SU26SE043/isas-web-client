import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('B2B organization onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.removeItem('isas-mock-employer-workspace');
      window.localStorage.setItem('language', 'en');
    });
  });

  test('organize completes dashboard, profile, and verification flow', async ({ page }) => {
    await loginAs(page, 'organize');

    await expect(page.getByRole('heading', { name: /^Employer workspace$/i })).toBeVisible();
    await expect(page.getByText(/Profile completeness/i)).toBeVisible();

    await page.goto('/employer/company');
    await expect(page.getByRole('heading', { name: /^Company profile$/i })).toBeVisible();
    await page.getByLabel(/^Display name$/i).fill('NovaWorks E2E');
    await page.getByRole('button', { name: /^Save profile$/i }).click();
    await expect(page.getByText(/Company profile saved/i)).toBeVisible();

    await page.goto('/employer/company/verify');
    await expect(page.getByRole('heading', { name: /^Company verification$/i })).toBeVisible();
    await page.getByLabel(/^Registration number$/i).fill('E2E-0319988776');
    await page.getByLabel(/I confirm that I am authorized/i).check();
    await page.locator('#document').setInputFiles({
      name: 'business-registration.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 e2e'),
    });
    await page.getByRole('button', { name: /^Submit verification$/i }).click();
    await expect(page.getByRole('alert').getByText(/waiting for operations review/i)).toBeVisible();

    await page.goto('/enterprise/company');
    await expect(page).toHaveURL(/\/employer\/company$/);
  });

  test('hr can access dashboard but not company profile routes', async ({ page }) => {
    await loginAs(page, 'hr');

    await expect(page.getByRole('heading', { name: /^Employer workspace$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Company profile$/i })).toHaveCount(0);

    await page.goto('/employer/company');
    await expect(page).toHaveURL(/\/access-denied/);
  });

  test('candidate is denied employer workspace', async ({ page }) => {
    await loginAs(page, 'candidate');
    await page.goto('/employer/dashboard');
    await expect(page).toHaveURL(/\/access-denied/);
  });
});
