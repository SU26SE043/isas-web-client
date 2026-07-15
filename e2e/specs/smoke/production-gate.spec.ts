import { expect, test } from '@playwright/test';

test.describe('Production gate surfaces', () => {
  test('unknown routes render 404 page', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('language', 'en');
    });
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
  });

  test('maintenance page renders scheduled downtime copy', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('language', 'en');
    });
    await page.goto('/maintenance');
    await expect(page.getByRole('heading', { name: /System maintenance/i })).toBeVisible();
  });
});
