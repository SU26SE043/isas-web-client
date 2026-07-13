import type { Page } from '@playwright/test';

type E2ERole = 'candidate' | 'organize';

const roleProfiles: Record<E2ERole, { id: string; fullName: string; email: string; title: string }> = {
  candidate: {
    id: 'e2e-candidate',
    fullName: 'E2E Candidate',
    email: 'candidate@isas.dev',
    title: 'Frontend Candidate',
  },
  organize: {
    id: 'e2e-organize',
    fullName: 'E2E Organize',
    email: 'organize@isas.dev',
    title: 'Organization Owner',
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
        expiresAt: '2026-07-12T12:00:00.000Z',
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
  await page.getByLabel(/e-mail/i).fill(roleProfiles[role].email);
  await page.getByLabel(/password/i).fill('Password123!');
  await page.getByRole('button', { name: /^Sign in$/i }).click();
  await page.waitForURL(role === 'candidate' ? /\/candidate\/dashboard/ : /\/employer\/dashboard/);
}

export async function logoutForRoleSwitch(page: Page) {
  await page.evaluate(() => {
    window.localStorage.removeItem('auth-storage');
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
  });
}
