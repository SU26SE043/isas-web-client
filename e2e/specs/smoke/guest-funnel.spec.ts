import { expect, test } from '@playwright/test';

test.describe('Guest acquisition funnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('language', 'en');
    });
  });

  test('guest can browse marketing pages and open registration', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /Choose the plan that fits you/i })).toBeVisible();

    await page.goto('/enterprise');
    await expect(page.getByRole('heading', { name: /Hire smarter with AI/i })).toBeVisible();

    await page.goto('/register');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /Create account/i })).toBeVisible();
    await expect(dialog.getByLabel(/e-mail/i)).toBeVisible();
  });

  test('guest can reach login from marketing home', async ({ page }) => {
    await page.goto('/login');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^Sign up$/i })).toBeVisible();
  });
});
