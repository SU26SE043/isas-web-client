import type { Page } from '@playwright/test';

type E2ERole = 'Candidate' | 'OrgAdmin' | 'HrMember' | 'Admin';

const roleProfiles: Record<E2ERole, { id: string; fullName: string; email: string; title: string }> = {
  Candidate: {
    id: 'e2e-candidate',
    fullName: 'E2E Candidate',
    email: 'candidate@isas.dev',
    title: 'Frontend Candidate',
  },
  OrgAdmin: {
    id: 'e2e-org-admin',
    fullName: 'E2E Org Admin',
    email: 'orgadmin@isas.dev',
    title: 'Organization Owner',
  },
  HrMember: {
    id: 'e2e-hr-member',
    fullName: 'E2E HR Member',
    email: 'hrmember@isas.dev',
    title: 'Recruiter',
  },
  Admin: {
    id: 'e2e-admin',
    fullName: 'E2E Admin',
    email: 'admin@isas.dev',
    title: 'Platform Administrator',
  },
};

async function mockAuthApi(page: Page, role: E2ERole) {
  const profile = roleProfiles[role];

  await page.unroute('**/api/v1/auth/login').catch(() => undefined);
  await page.unroute('**/api/v1/auth/me').catch(() => undefined);

  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: `e2e-access-${role}`,
        refreshToken: `e2e-refresh-${role}`,
        expiresAt: '2099-12-31T23:59:59.000Z',
      }),
    });
  });

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...profile,
        role,
        location: 'Ho Chi Minh City',
        createdAt: '2026-07-12T00:00:00.000Z',
      }),
    });
  });
}

export async function loginAs(page: Page, role: E2ERole) {
  await mockAuthApi(page, role);
  await page.addInitScript(() => {
    window.localStorage.setItem('language', 'en');
  });
  await page.goto('/login');
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  await dialog.getByRole('heading', { level: 1, name: /^Sign in$/i }).waitFor({ state: 'visible' });
  await dialog.getByLabel(/e-mail/i).fill(roleProfiles[role].email);
  await dialog.getByLabel(/password/i).fill('Password123!');
  await dialog.getByRole('button', { name: /^Sign in$/i }).click();
  const destination =
    role === 'Candidate'
      ? /\/candidate\/dashboard/
      : role === 'Admin'
        ? /\/admin(\/dashboard)?/
        : /\/employer\/dashboard/;
  await page.waitForURL(destination);
}

export async function logoutForRoleSwitch(page: Page) {
  await page.evaluate(() => {
    window.localStorage.removeItem('auth-storage');
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    window.sessionStorage.removeItem('isas-mock-employer-workspace');
  });
}
