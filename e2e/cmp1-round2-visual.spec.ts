import { expect, test } from '@playwright/test';
import { loginAs } from './fixtures/auth';

const campaignId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const campaign = {
  id: campaignId, title: 'Frontend Engineer', status: 'Draft', domain: 'frontend', company: 'Công ty Sao', location: 'HCM', mode: 'Remote',
  summary: 'Tuyển kỹ sư frontend', jobDescription: 'React and TypeScript', capacity: 25, cvCount: 3, invitedCount: 2, completedCount: 1,
  deadline: '2026-10-01T00:00:00Z', startsAt: '2026-09-10T00:00:00Z', durationMinutes: 30, questions: [], criteria: [], candidates: [],
  jobNeeds: [{ needId: 'n1', category: 'Technical', text: 'React', isMustHave: true }], invitedEmails: [], updatedAt: '2026-09-01T00:00:00Z', createdAt: '2026-09-01T00:00:00Z',
};
const candidate = { id: 'cv-1', fullName: 'Nguyễn An', email: 'an@example.com', status: 'Filtered', eligible: false, mustHaveMet: 1, mustHaveTotal: 2, missingMustHave: ['TypeScript'], verificationRisk: 'High', skills: ['React'] };

async function employerSetup(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    const user = { id: 'e2e-org-admin', fullName: 'E2E Org Admin', email: 'orgadmin@isas.dev', role: 'OrgAdmin' };
    window.sessionStorage.setItem('isas-auth-user', JSON.stringify(user));
    window.localStorage.setItem('auth-storage', JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 }));
    window.localStorage.setItem('accessToken', 'e2e-access-OrgAdmin');
  });
  await page.route(`**/api/v1/campaign/${campaignId}`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(campaign) }));
  await page.route('**/api/v1/campaign?*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([campaign]) }));
  await page.route(`**/api/v1/campaign/${campaignId}/candidates**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([candidate]) }));
  await page.route(`**/api/v1/campaign/${campaignId}/slots**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
}

test('F3/F4/F5 employer screenshots at mobile and desktop', async ({ page }) => {
  await employerSetup(page);
  await page.goto('/employer/campaigns/new');
  await expect(page.getByRole('heading', { name: /Thông tin chiến dịch|Campaign information/i }).first()).toBeVisible();
  await page.screenshot({ path: 'artifacts/cmp1-f3-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'artifacts/cmp1-f3-375.png', fullPage: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/employer/campaigns/${campaignId}/overview?tab=details`);
  await expect(page.getByText('React', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/cmp1-f4-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'artifacts/cmp1-f4-375.png', fullPage: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/employer/campaigns/${campaignId}/invitations?tab=cv-screening`);
  await expect(page.getByText(/Nguyễn An|1\/2/).first()).toBeVisible();
  await page.screenshot({ path: 'artifacts/cmp1-f5-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'artifacts/cmp1-f5-375.png', fullPage: true });
});

test('F7 invitation screenshots at mobile and desktop', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  await page.route('**/api/v1/campaign/invitations/token-round2', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ campaignId, title: 'Frontend Engineer', jobTitle: 'React developer', orgName: 'Công ty Sao', startsAt: '2099-09-05T04:00:00Z', durationMinutes: 35, questionCount: 8, faceVerifyEnabled: true, criteria: [] }) }));
  await page.goto('/invitations/token-round2');
  await expect(page.getByText('Công ty Sao')).toBeVisible();
  await page.screenshot({ path: 'artifacts/cmp1-f7-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'artifacts/cmp1-f7-375.png', fullPage: true });
});
