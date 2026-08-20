import { expect, test } from '@playwright/test';
import { installMockMedia } from '../../fixtures/media';
import { completeInterviewPreparation, completePracticeSetupWizard } from '../../fixtures/practiceWizard';

test.describe('B2C full journey', () => {
  test.setTimeout(120_000);

  test('candidate registers, analyzes CV, tops up wallet, completes practice, and reviews history', async ({ page }) => {
    await page.route('**/api/v1/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'e2e-access-journey',
          refreshToken: 'e2e-refresh-journey',
          expiresAt: '2026-07-12T12:00:00.000Z',
        }),
      });
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'e2e-journey-candidate',
          fullName: 'Journey Candidate',
          email: 'journey@isas.dev',
          title: 'Frontend Candidate',
          role: 'Candidate',
          location: 'Ho Chi Minh City',
          createdAt: '2026-07-12T00:00:00.000Z',
        }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('language', 'en');
    });

    await page.goto('/register');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/full name/i).fill('Journey Candidate');
    await dialog.getByLabel(/e-mail/i).fill('journey@isas.dev');
    await dialog.getByLabel(/^password$/i).fill('Password123!Secure');
    await dialog.getByRole('button', { name: /^Sign up$/i }).click();
    await page.waitForURL(/\/candidate\/dashboard/);
    await expect(page).toHaveURL(/\/candidate\/dashboard/);

    // The CV leg walks the real wizard now. The Playwright-only shortcuts it
    // used to ride on (an sr-only input that set the field, Next jumping 1→3,
    // and a bypass that skipped the credit dialog) were removed on purpose —
    // see P22 / X6. Same intent, real navigation.
    await page.goto('/candidate/cv/analysis');
    await expect(page.getByRole('heading', { level: 1, name: /cv analysis/i })).toBeVisible();

    // Step 1 — the field: `jobCategory` is a required input of /cv-analysis, so
    // it must be settled before the job step.
    await page.getByRole('button', { name: /^frontend developer$/i }).click();
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 2 — the CV.
    await expect(page.getByRole('heading', { name: /^step 2 of 6$/i })).toBeAttached();
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'journey-cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 journey cv'),
    });
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 3 — the job. This journey has no JD, which is a complete answer in
    // its own right: leaving it empty no longer destroys anything.
    await expect(page.getByRole('heading', { name: /^step 3 of 6$/i })).toBeAttached();
    await page.getByRole('button', { name: /^continue$/i }).click();

    // Step 4 — confirm, then spend the credit the way a real user does.
    await expect(page.getByRole('heading', { name: /^step 4 of 6$/i })).toBeAttached();
    await page.getByRole('button', { name: /^analyze cv$/i }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /confirm and analyze/i })
      .click();

    await page.waitForURL(/\/candidate\/cv\/analysis\/report/, { timeout: 15_000 });
    // The hero h1 is the job field. It never said "match report"; the % ring
    // that used to sit next to it is gone with the score (D7).
    await expect(page.getByRole('heading', { level: 1, name: /frontend/i }).first()).toBeVisible();
    // No JD on this journey ⇒ no requirements were sent ⇒ the general report.
    await expect(page.getByText(/no jd/i).first()).toBeVisible();

    await page.goto('/candidate/subscription');
    await page.getByRole('button', { name: /^Continue to checkout$/i }).click();
    await expect(page).toHaveURL(/\/candidate\/payment\?packageId=/);
    await page.getByRole('button', { name: /Pay with PayOS/i }).click();
    await expect(page.getByText(/Payment successful/i)).toBeVisible({ timeout: 15_000 });

    await installMockMedia(page);
    await completePracticeSetupWizard(page);
    await completeInterviewPreparation(page);
    await page.getByRole('button', { name: /Start interview/i }).click();
    await expect(page).toHaveURL(/\/room/, { timeout: 8_000 });

    // Same waits as `interview-happy-path.spec.ts`. The raw `.evaluate(click)`
    // this replaces fired before the question was ready, so submissions were
    // dropped and the run stalled on question 2 of 3.
    for (let index = 0; index < 3; index += 1) {
      const submitAnswer = page.getByRole('button', { name: /Submit answer/i });
      await expect(page.getByText(new RegExp(`Question ${index + 1} / 3`, 'i'))).toBeVisible({
        timeout: 10_000,
      });
      await expect(page.getByText(/You can start answering/i)).toBeVisible({ timeout: 10_000 });
      await expect(submitAnswer).toBeEnabled();
      await submitAnswer.click();
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
