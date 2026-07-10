import { test, expect } from '@playwright/test';

test.describe('landing smoke', () => {
  test('home page loads with PIpraint branding', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('banner').getByRole('img', { name: 'PIpraint Logo' })).toBeVisible();
  });

  test('login route is reachable', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('main').getByRole('heading', { level: 1, name: /sign in|đăng nhập/i })).toBeVisible();
  });
});
