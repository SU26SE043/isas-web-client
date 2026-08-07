import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test('candidate sees the three progress charts without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await loginAs(page, 'Candidate');
  await page.goto('/candidate/progress');

  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(3);
  await expect(page.getByText('48%', { exact: true })).toBeVisible();
  await expect(page.getByText('Skill Completion Breakdown', { exact: true })).toBeVisible();
  await expect(page.getByText('Practice Score Improvement', { exact: true })).toBeVisible();
  await expect(page.getByText('Unable to load progress', { exact: true })).toHaveCount(0);
  await page.waitForTimeout(1_200);
  expect(consoleErrors).toEqual([]);

  await page.screenshot({
    path: 'test-results/progress-dashboard/desktop.png',
    fullPage: true,
  });

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(3);
  await page.waitForTimeout(1_200);
  await page.screenshot({
    path: 'test-results/progress-dashboard/mobile.png',
    fullPage: true,
  });
});
