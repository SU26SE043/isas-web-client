import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

const organization = {
  id: 'org-1',
  name: 'ISAS Labs',
  taxCode: 'TAX-001',
  createdAt: '2026-07-20T00:00:00.000Z',
  memberCount: 3,
};

const user = {
  id: 'user-1',
  email: 'owner@isas.dev',
  fullName: 'Organization Owner',
  role: 'Employer',
  orgId: 'org-1',
  orgName: 'ISAS Labs',
  orgRole: 'OrgAdmin',
  createdAt: '2026-07-20T00:00:00.000Z',
};

test.describe('Admin Auth directory APIs', () => {
  test('lists organizations and users with search, role, cursor, and limit', async ({ page }) => {
    const organizationQueries: URLSearchParams[] = [];
    const userQueries: URLSearchParams[] = [];

    await page.route('**/api/v1/auth/admin/organizations**', async (route) => {
      const url = new URL(route.request().url());
      organizationQueries.push(new URLSearchParams(url.search));
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': 'application/json',
          'access-control-expose-headers': 'x-next-cursor',
          ...(url.searchParams.has('cursor') ? {} : { 'x-next-cursor': 'org-next' }),
        },
        body: JSON.stringify([{
          ...organization,
          id: url.searchParams.has('cursor') ? 'org-2' : organization.id,
          name: url.searchParams.has('cursor') ? 'Second Organization' : organization.name,
        }]),
      });
    });

    await page.route('**/api/v1/auth/admin/users**', async (route) => {
      const url = new URL(route.request().url());
      userQueries.push(new URLSearchParams(url.search));
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': 'application/json',
          'access-control-expose-headers': 'x-next-cursor',
          ...(url.searchParams.has('cursor') ? {} : { 'x-next-cursor': 'user-next' }),
        },
        body: JSON.stringify([{
          ...user,
          id: url.searchParams.has('cursor') ? 'user-2' : user.id,
          email: url.searchParams.has('cursor') ? 'second@isas.dev' : user.email,
        }]),
      });
    });

    await loginAs(page, 'Admin');
    await page.goto('/admin/users');
    await expect(page.getByRole('table').getByText('Organization Owner')).toBeVisible();
    await expect.poll(() => userQueries.at(-1)?.get('limit')).toBe('20');

    await page.getByLabel('Filter by role').selectOption('Employer');
    await expect.poll(() => userQueries.at(-1)?.get('role')).toBe('Employer');
    await page.getByLabel('Search Admin directory').fill(' owner ');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => userQueries.at(-1)?.get('search')).toBe('owner');
    const nextPage = page.getByRole('button', { name: 'Next page' });
    await expect(nextPage).toBeEnabled();
    await nextPage.click();
    await expect.poll(() => userQueries.at(-1)?.get('cursor')).toBe('user-next');
    await expect(page.getByRole('table').getByText('second@isas.dev')).toBeVisible();

    await page.goto('/admin/organizations');
    await expect(page.getByRole('table').getByText('ISAS Labs')).toBeVisible();
    await page.getByLabel('Search Admin directory').fill(' ISAS ');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => organizationQueries.at(-1)?.get('search')).toBe('ISAS');
    await expect(page.getByRole('button', { name: 'Next page' })).toBeEnabled();
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect.poll(() => organizationQueries.at(-1)?.get('cursor')).toBe('org-next');
    await expect(page.getByRole('table').getByText('Second Organization')).toBeVisible();

    await page.screenshot({
      path: 'test-results/admin-auth-directory/organizations-desktop.png',
      fullPage: true,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('article').getByText('Second Organization')).toBeVisible();
    await page.screenshot({
      path: 'test-results/admin-auth-directory/organizations-mobile.png',
      fullPage: true,
    });
  });

  test('does not call Admin directory APIs for other roles or anonymous users', async ({ page }) => {
    let directoryCalls = 0;
    await page.route('**/api/v1/auth/admin/**', async (route) => {
      directoryCalls += 1;
      await route.fulfill({ status: 403, body: '{}' });
    });

    await loginAs(page, 'Candidate');
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/access-denied/);
    expect(directoryCalls).toBe(0);

    await page.evaluate(() => {
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
    await page.goto('/admin/organizations');
    await expect(page).toHaveURL(/\?auth=login/);
    expect(directoryCalls).toBe(0);
  });

  test('shows the backend 403 boundary to an Admin session', async ({ page }) => {
    await page.route('**/api/v1/auth/admin/users**', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Admin role required' }),
      });
    });

    await loginAs(page, 'Admin');
    await page.goto('/admin/users');
    await expect(
      page.getByRole('alert').filter({ hasText: 'Only platform Admin can view this directory.' }),
    ).toBeVisible();
  });
});
