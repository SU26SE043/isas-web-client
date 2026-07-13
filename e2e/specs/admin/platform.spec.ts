import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('Admin platform', () => {
  test.setTimeout(60_000);

  test('admin can access dashboard, users, audit logs, and AI config', async ({ page }) => {
    await loginAs(page, 'admin');

    await page.goto('/admin/dashboard');
    await expect(page.getByRole('heading', { name: /Admin Platform/i })).toBeVisible();

    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /User management/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    await page.goto('/admin/audit-logs');
    await expect(page.getByRole('heading', { name: /System audit logs/i })).toBeVisible();
    await expect(page.getByText(/immutable/i)).toBeVisible();

    await page.goto('/admin/ai-config');
    await expect(page.getByRole('heading', { name: /AI configuration/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Save config/i })).toBeVisible();
  });

  test('candidate is denied admin workspace', async ({ page }) => {
    await loginAs(page, 'candidate');
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/access-denied/);
  });
});
