import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

const activeUser = {
  id: 'user-1',
  email: 'candidate@isas.dev',
  fullName: 'Candidate One',
  role: 'Candidate',
  createdAt: '2026-07-20T00:00:00.000Z',
};

test('Admin bans, unbans, and resets a user password through Auth', async ({ page }) => {
  let currentUser = { ...activeUser, bannedAt: undefined as string | undefined, banReason: undefined as string | undefined };
  const requests: Array<{ path: string; body: unknown }> = [];

  await page.route('**/api/v1/auth/admin/users**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([currentUser]) });
      return;
    }
    const body = request.postDataJSON();
    requests.push({ path, body });
    if (path.endsWith('/ban')) {
      currentUser = { ...currentUser, bannedAt: '2026-07-29T00:00:00.000Z', banReason: body.reason };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currentUser) });
      return;
    }
    if (path.endsWith('/unban')) {
      currentUser = { ...activeUser, bannedAt: undefined, banReason: undefined };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currentUser) });
      return;
    }
    await route.fulfill({ status: 204 });
  });

  await loginAs(page, 'Admin');
  await page.goto('/admin/users');

  await page.getByRole('button', { name: 'Ban account' }).click();
  await expect(page.getByText(/access tokens remain valid until expiry/i)).toBeVisible();
  await page.getByLabel('Reason (optional)').fill('Policy violation');
  await page.getByRole('dialog').getByRole('button', { name: 'Ban account' }).click();
  await expect(page.getByText('Account banned.')).toBeVisible();
  await expect(page.getByRole('table').getByText('Policy violation')).toBeVisible();
  expect(requests[0]).toEqual({
    path: '/api/v1/auth/admin/users/user-1/ban',
    body: { reason: 'Policy violation' },
  });

  await page.getByRole('button', { name: 'Unban' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Unban' }).click();
  await expect(page.getByText('Account unbanned.')).toBeVisible();
  expect(requests[1]?.path).toBe('/api/v1/auth/admin/users/user-1/unban');

  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page.getByText(/refresh tokens will be revoked/i)).toBeVisible();
  await page.getByLabel('New password').fill('StrongPass123!');
  await page.getByRole('dialog').getByRole('button', { name: 'Reset password' }).click();
  await expect(page.getByText(/all refresh tokens revoked/i)).toBeVisible();
  expect(requests[2]).toEqual({
    path: '/api/v1/auth/admin/users/user-1/reset-password',
    body: { newPassword: 'StrongPass123!' },
  });

  await page.screenshot({
    path: 'test-results/admin-auth-account-actions/users-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('article').getByText('Candidate One')).toBeVisible();
  await page.screenshot({
    path: 'test-results/admin-auth-account-actions/users-mobile.png',
    fullPage: true,
  });
});
