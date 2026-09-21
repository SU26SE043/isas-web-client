import { test, expect } from '@playwright/test';

import { BRAND_LOGO_ALT } from '../../../src/shared/brand';

test.describe('landing smoke', () => {
  test('home page loads with brand logo', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('banner').getByRole('img', { name: BRAND_LOGO_ALT })).toBeVisible();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('img', { name: BRAND_LOGO_ALT })).toBeVisible();
  });

  test('enterprise page loads', async ({ page }) => {
    await page.goto('/enterprise');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('img', { name: BRAND_LOGO_ALT })).toBeVisible();
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

  test('login route opens homepage auth modal', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/auth=login/);
    await expect(page.getByRole('dialog').getByRole('heading', { level: 1, name: /sign in|đăng nhập/i })).toBeVisible();
  });
});
