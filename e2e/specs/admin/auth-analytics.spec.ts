import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

const analytics = {
  from: '2026-07-01T00:00:00.000Z',
  to: '2026-07-29T00:00:00.000Z',
  granularity: 'day',
  totals: {
    totalUsers: 120,
    newUsers: 18,
    bannedUsers: 3,
    totalOrganizations: 9,
    byRole: [
      { role: 'Candidate', count: 90 },
      { role: 'OrgAdmin', count: 20 },
      { role: 'Admin', count: 10 },
    ],
  },
  activeUsers: { last7Days: 42, last30Days: 88 },
  buckets: [
    { periodStart: '2026-07-27T00:00:00.000Z', newUsers: 3, logins: 30, distinctUsers: 21 },
    { periodStart: '2026-07-28T00:00:00.000Z', newUsers: 4, logins: 37, distinctUsers: 25 },
  ],
};

test.describe('Admin Auth analytics', () => {
  test('renders live metrics and changes server grouping', async ({ page }) => {
    const groupings: Array<string | null> = [];
    await page.route('**/api/v1/auth/admin/analytics**', async (route) => {
      groupings.push(new URL(route.request().url()).searchParams.get('groupBy'));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(analytics),
      });
    });

    await loginAs(page, 'Admin');
    await page.goto('/admin/dashboard');
    await expect(page.getByText('120')).toBeVisible();
    await expect(page.getByText('User and login trends')).toBeVisible();
    await expect(page.getByText('Users by role')).toBeVisible();
    expect(groupings.at(-1)).toBe('day');

    await page.getByLabel('Group data by').selectOption('month');
    await expect.poll(() => groupings.at(-1)).toBe('month');

    await page.screenshot({
      path: 'test-results/admin-auth-analytics/dashboard-desktop.png',
      fullPage: true,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByText('Total users')).toBeVisible();
    await page.screenshot({
      path: 'test-results/admin-auth-analytics/dashboard-mobile.png',
      fullPage: true,
    });
  });

  test('does not request analytics for a non-Admin role', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/v1/auth/admin/analytics**', async (route) => {
      calls += 1;
      await route.fulfill({ status: 403, body: '{}' });
    });
    await loginAs(page, 'Candidate');
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/access-denied/);
    expect(calls).toBe(0);
  });

  test('shows the backend authorization boundary to an Admin session', async ({ page }) => {
    await page.route('**/api/v1/auth/admin/analytics**', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Admin role required' }),
      });
    });
    await loginAs(page, 'Admin');
    await page.goto('/admin/dashboard');
    await expect(page.getByRole('alert').filter({
      hasText: 'Only platform Admin can view these analytics.',
    })).toBeVisible();
  });
});
