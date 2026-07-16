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
        role: 'Candidate',
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
    window.localStorage.setItem('accessToken', 'e2e-access-candidate');
    window.localStorage.setItem('refreshToken', 'e2e-refresh-candidate');
    window.localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          user: {
            id: 'e2e-candidate',
            fullName: 'E2E Candidate',
            email: 'candidate@isas.dev',
            title: 'Frontend Candidate',
            role: 'Candidate',
            location: 'Ho Chi Minh City',
            createdAt: '2026-07-12T00:00:00.000Z',
          },
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
  });
  await page.goto('/candidate/dashboard');
  await page.waitForURL(/\/candidate\/dashboard/);
}

test.describe('cv upload smoke', () => {
  test('candidate can upload CV and reach match report', async ({ page }) => {
    await loginAsCandidate(page);

    await page.route('**/api/v1/interview/files/upload**', async (route) => {
      const url = route.request().url();
      const fileType = url.includes('fileType=jd') ? 'jd' : 'cv';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fileId: fileType === 'jd' ? 'e2e-jd-id' : 'e2e-cv-id',
          fileType,
          originalName: fileType === 'jd' ? 'e2e-jd.pdf' : 'e2e-cv.pdf',
          mimeType: 'application/pdf',
          fileSize: 128,
          parsedStatus: 'completed',
          createdAt: '2026-07-15T00:00:00.000Z',
        }),
      });
    });

    await page.route('**/api/v1/interview/practice/cv-analysis**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'e2e-analysis-001',
            cvId: 'e2e-cv-id',
            jdId: 'e2e-jd-id',
            jobCategory: 'Frontend',
            summary: 'Strong frontend alignment with solid React fundamentals.',
            strengths: ['React', 'TypeScript'],
            weaknesses: ['System design depth'],
            suggestions: ['Add quantified impact to project bullets.'],
            jdMatch: {
              score: 85,
              matchedSkills: ['React'],
              missingSkills: ['GraphQL'],
            },
            createdAt: '2026-07-15T00:00:00.000Z',
          }),
        });
        return;
      }

      if (method === 'GET' && url.includes('e2e-analysis-001')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'e2e-analysis-001',
            cvId: 'e2e-cv-id',
            jdId: 'e2e-jd-id',
            jobCategory: 'Frontend',
            summary: 'Strong frontend alignment with solid React fundamentals.',
            strengths: ['React', 'TypeScript'],
            weaknesses: ['System design depth'],
            suggestions: ['Add quantified impact to project bullets.'],
            jdMatch: {
              score: 85,
              matchedSkills: ['React'],
              missingSkills: ['GraphQL'],
            },
            createdAt: '2026-07-15T00:00:00.000Z',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/candidate/cv/analysis');

    await expect(page.getByRole('heading', { level: 1, name: /cv analysis/i })).toBeVisible();

    await page.getByRole('button', { name: /frontend/i }).click();
    await page.getByRole('button', { name: /^next$/i }).click();

    const cvInput = page.locator('input[type="file"]').first();
    await cvInput.setInputFiles({
      name: 'e2e-cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 e2e test cv'),
    });
    await expect(page.getByText(/e2e-cv\.pdf/i)).toBeVisible();
    await page.getByRole('button', { name: /^next$/i }).click();
    await expect(page.getByRole('heading', { name: /upload jd|tải jd/i })).toBeVisible();

    const jdInput = page.locator('input[type="file"]').first();
    await jdInput.setInputFiles({
      name: 'e2e-jd.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 e2e test jd'),
    });
    await expect(page.getByText(/e2e-jd\.pdf/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /^next$/i }).click();

    await expect(page.getByRole('button', { name: /^analyze cv$/i })).toBeVisible();
    await page.getByRole('button', { name: /^analyze cv$/i }).click();
    await page.waitForURL(/\/candidate\/cv\/analysis\/report/, { timeout: 15000 });

    await expect(page.getByRole('heading', { level: 1, name: /frontend/i }).first()).toBeVisible();
    await expect(page.getByText(/strong frontend alignment/i)).toBeVisible();
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
