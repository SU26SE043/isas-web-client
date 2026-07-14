import { test, expect } from '@playwright/test';

async function mockCandidateAuth(page: import('@playwright/test').Page) {
  await page.unroute('**/api/v1/auth/login').catch(() => undefined);
  await page.unroute('**/api/v1/auth/me').catch(() => undefined);

  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-access-candidate',
        refreshToken: 'e2e-refresh-candidate',
        expiresAt: '2026-07-12T12:00:00.000Z',
      }),
    });
  });

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'e2e-candidate',
        fullName: 'E2E Candidate',
        email: 'candidate@isas.dev',
        title: 'Frontend Candidate',
        role: 'candidate',
        location: 'Ho Chi Minh City',
        createdAt: '2026-07-12T00:00:00.000Z',
      }),
    });
  });
}

async function loginAsCandidate(page: import('@playwright/test').Page) {
  await mockCandidateAuth(page);
  await page.addInitScript(() => {
    window.localStorage.setItem('language', 'en');
  });
  await page.goto('/login');
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  await dialog.getByLabel(/e-mail/i).fill('candidate@isas.dev');
  await dialog.getByLabel(/password/i).fill('Password123!Secure');
  await dialog.getByRole('button', { name: /^Sign in$/i }).click();
  await page.waitForURL(/\/candidate\/dashboard/);
}

test.describe('cv upload smoke', () => {
  test('candidate can upload CV and reach match report', async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto('/candidate/cv/analysis');

    await expect(page.getByRole('heading', { level: 1, name: /cv analysis/i })).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'e2e-cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 e2e test cv'),
    });

    await page.getByRole('button', { name: /^next$/i }).first().click();
    await expect(page.getByText(/e2e-cv\.pdf/i)).toBeVisible();

    await page.getByRole('button', { name: /^next$/i }).click();
    await page.waitForURL(/\/candidate\/cv\/analysis\/report/, { timeout: 15000 });

    await expect(page.getByRole('heading', { level: 1, name: /match report/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /apply to profile/i })).toBeVisible();
  });

  test('legacy cv upload route redirects to analysis', async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto('/candidate/cv/upload');
    await expect(page).toHaveURL(/\/candidate\/cv\/analysis$/);
  });

  test('profile completion wizard shows all sections', async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto('/candidate/profile/complete');

    await expect(page.getByRole('heading', { level: 1, name: /complete your profile/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /basic information/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /social links/i })).toBeVisible();
  });
});
