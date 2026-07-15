import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('B2C results and learning', () => {
  test.setTimeout(90_000);

  test('candidate views scored result, history, roadmap wizard, and learning dashboard', async ({ page }) => {
    await loginAs(page, 'Candidate');

    await page.goto('/candidate/practice/history/interview-result-001');
    await expect(page.getByRole('tab', { name: /^Overview$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Overall score/i)).toBeVisible();

    await page.getByRole('tab', { name: /^Roadmap$/i }).click();
    await expect(page.getByRole('heading', { name: /^Skill roadmap$/i })).toBeVisible();

    await page.goto('/candidate/practice/history');
    await expect(page.getByRole('heading', { name: /^Interview History$/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    await page.goto('/candidate/roadmap');
    await expect(page.getByRole('button', { name: /^Frontend$/i })).toBeVisible();
    await page.getByRole('button', { name: /^Frontend$/i }).click();
    await page.getByRole('button', { name: /^Next$/i }).click();
    await expect(page.getByRole('checkbox').first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /Select all/i }).click();
    await page.getByRole('button', { name: /^Next$/i }).click();
    await page.getByRole('button', { name: /^Junior$/i }).click();
    await page.getByRole('button', { name: /^Next$/i }).click();
    await page.getByRole('button', { name: /Create Roadmap/i }).click();
    await expect(page).toHaveURL(/\/candidate\/learning/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /^Learning$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /View Details/i }).first()).toBeVisible();
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await expect(page).toHaveURL(/\/candidate\/learning\/roadmaps\//);
    await expect(page.getByText(/Milestone/i).first()).toBeVisible();
  });
});
