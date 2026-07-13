import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('B2C results and learning', () => {
  test.setTimeout(90_000);

  test('candidate views scored result, history, roadmap, and learning module', async ({ page }) => {
    await loginAs(page, 'candidate');

    await page.goto('/candidate/practice/history/interview-result-001');
    await expect(page.getByRole('tab', { name: /^Overview$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Overall score/i)).toBeVisible();

    await page.getByRole('tab', { name: /^Roadmap$/i }).click();
    await expect(page.getByRole('heading', { name: /^Skill roadmap$/i })).toBeVisible();

    await page.goto('/candidate/practice/history');
    await expect(page.getByRole('heading', { name: /^Interview History$/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    await page.goto('/candidate/roadmap');
    await expect(page.getByRole('heading', { name: /^Skill roadmap$/i })).toBeVisible();

    await page.goto('/candidate/learning');
    await expect(page.getByRole('heading', { name: /^Learning hub$/i })).toBeVisible();
    await page.getByRole('link', { name: /^Start$/i }).first().click();
    await expect(page).toHaveURL(/\/candidate\/learning\/module-/);
    await expect(page.getByRole('heading', { name: /React Architecture|System Design|Spoken English/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
