import { test, expect } from '@playwright/test';

test.describe('landing smoke', () => {
  test('home page loads with PIpraint branding', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('banner').getByRole('img', { name: 'PIpraint Logo' })).toBeVisible();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('img', { name: 'PIpraint Logo' })).toBeVisible();
  });

  test('enterprise page loads', async ({ page }) => {
    await page.goto('/enterprise');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('img', { name: 'PIpraint Logo' })).toBeVisible();
  });

  test('legacy employers route redirects to enterprise', async ({ page }) => {
    await page.goto('/employers');

    await expect(page).toHaveURL(/\/enterprise$/);
  });

  test('terms and privacy pages load', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('login route is reachable', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('main').getByRole('heading', { level: 1, name: /sign in|đăng nhập/i })).toBeVisible();
  });
});
