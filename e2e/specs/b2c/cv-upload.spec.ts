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

const JD_BODY = [
  'We are hiring a Frontend Developer to build and ship customer-facing product surfaces.',
  'Must have: 3+ years of React and TypeScript, strong CSS fundamentals, and experience',
  'shipping accessible interfaces. Nice to have: GraphQL, design-system ownership, and',
  'end-to-end testing with Playwright. You will work closely with design and backend.',
].join(' ');

test.describe('cv upload smoke', () => {
  test('candidate can upload CV and reach match report', async ({ page }) => {
    await loginAsCandidate(page);

    const analysisResponse = {
      id: 'e2e-analysis-001',
      cvId: 'e2e-cv-id',
      jdId: 'e2e-jd-id',
      jobCategory: 'FE',
      summary: 'Strong frontend alignment with solid React fundamentals.',
      strengths: ['React', 'TypeScript'],
      weaknesses: ['System design depth'],
      suggestions: ['Add quantified impact to project bullets.'],
      jdMatch: null,
      requirementSummary: {
        mustHave: { total: 1, strong: 1, partial: 0, weak: 0 },
        niceToHave: { total: 1, strong: 0, partial: 0, weak: 1 },
      },
      mustHaveMatches: [{
        requirementId: 'requirement-react', priority: 'MustHave', text: 'React delivery',
        level: 'Strong', evidence: 'Built React applications used by 10,000 customers',
        page: 1, sectionTitle: 'Experience',
      }],
      niceToHaveMatches: [{
        requirementId: 'requirement-graphql', priority: 'NiceToHave', text: 'GraphQL',
        level: 'Weak', evidence: 'Không thấy bằng chứng', page: null, sectionTitle: null,
      }],
      cvSections: [],
      citations: [],
      createdAt: '2026-07-15T00:00:00.000Z',
    };

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
          body: JSON.stringify(analysisResponse),
        });
        return;
      }

      if (method === 'GET' && url.includes('e2e-analysis-001')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(analysisResponse),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/v1/interview/files/e2e-*-id/download', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('%PDF-1.4 evidence preview'),
      });
    });

    // Uploading a JD hydrates the one JD body from the file, so the wizard can
    // show and edit what it is about to send.
    await page.route('**/api/v1/interview/files/*/parsed-text', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ parsedText: JD_BODY, parsedStatus: 'completed' }),
      });
    });

    await page.route('**/api/v1/interview/practice/jd-requirements', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mustHave: [{ text: 'React delivery', citations: [], jdQuote: null }],
          niceToHave: [{ text: 'GraphQL', citations: [], jdQuote: null }],
        }),
      });
    });

    await page.goto('/candidate/cv/analysis');

    await expect(page.getByRole('heading', { level: 1, name: /cv analysis/i })).toBeVisible();

    // Step 1 — the field, on its own screen: `jobCategory` is a required input
    // of both /jd-requirements and /cv-analysis, so it has to be settled before
    // the JD step.
    await expect(page.getByRole('heading', { name: /^step 1 of 6$/i })).toBeAttached();
    await page.getByRole('button', { name: /^frontend developer$/i }).click();
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 2 — the CV.
    await expect(page.getByRole('heading', { name: /^step 2 of 6$/i })).toBeAttached();
    const cvInput = page.locator('input[type="file"]').first();
    await cvInput.setInputFiles({
      name: 'e2e-cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 e2e test cv'),
    });
    await expect(page.getByText(/e2e-cv\.pdf/i)).toBeVisible();
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 3 — the job. Asserted through the stepper rather than the panel
    // heading, so the assertion survives the job-step rewrite.
    await expect(page.getByRole('heading', { name: /^step 3 of 6$/i })).toBeAttached();

    // A JD file is a way to fill the one JD, so the body appears in the editor.
    await page.getByLabel(/^upload jd$/i).setInputFiles({
      name: 'e2e-jd.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 e2e test jd'),
    });
    await expect(page.getByText(/e2e-jd\.pdf/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('textbox', { name: /jd content/i })).toHaveValue(
      /hiring a Frontend Developer/,
      { timeout: 10000 },
    );
    // Extraction is an explicit, named action now — it no longer hides inside
    // the Continue button.
    await page.getByRole('button', { name: /find requirements in the jd/i }).click();
    await expect(page.getByText(/^React delivery$/)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /^continue$/i }).click();

    // Step 4 — read-only confirmation. Reviewing moved off the screen that
    // spends the credit, so this step only restates what will be sent.
    await expect(page.getByRole('heading', { name: /^step 4 of 6$/i })).toBeAttached();
    await expect(page.getByText(/2 requirements will be used for matching/i)).toBeVisible();

    await page.getByRole('button', { name: /^analyze cv$/i }).click();

    // The credit dialog is no longer bypassed under Playwright — the only way
    // to spend a credit is the same one a real user takes.
    const creditDialog = page.getByRole('dialog');
    await expect(creditDialog.getByRole('heading', { name: /confirm cv analysis/i })).toBeVisible();
    await creditDialog.getByRole('button', { name: /confirm and analyze/i }).click();

    await page.waitForURL(/\/candidate\/cv\/analysis\/report/, { timeout: 15000 });

    await expect(page.getByRole('heading', { level: 1, name: /frontend/i }).first()).toBeVisible();
    await expect(page.getByText(/strong frontend alignment/i)).toBeVisible();
    await page.getByRole('button', { name: /React delivery/i }).click();
    await expect(page.getByText('“Built React applications used by 10,000 customers”')).toBeVisible();
    await page.getByRole('button', { name: /view in cv/i }).click();
    const cvDialog = page.getByRole('dialog');
    await expect(cvDialog.getByRole('heading', { name: /view cv/i })).toBeVisible();
    await expect(cvDialog.locator('iframe')).toBeVisible();
    await cvDialog.getByRole('button', { name: /^close$/i }).last().click();

    await page.getByRole('button', { name: /e2e-jd\.pdf/i }).click();
    const jdDialog = page.getByRole('dialog');
    await expect(jdDialog.getByRole('heading', { name: /view jd/i })).toBeVisible();
    await expect(jdDialog.locator('iframe')).toBeVisible();
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
