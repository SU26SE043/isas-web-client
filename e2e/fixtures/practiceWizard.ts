import { expect, type Page } from '@playwright/test';

export async function completePracticeSetupWizard(page: Page): Promise<string> {
  await page.goto('/practice');
  await expect(page.getByRole('button', { name: /Frontend Development/i })).toBeVisible();

  await page.getByRole('button', { name: /Frontend Development/i }).click();
  await page.getByRole('button', { name: /^Next$/i }).click();

  await page.getByRole('button', { name: /^Junior$/i }).click();
  await page.getByRole('button', { name: /^Next$/i }).click();

  await expect(page.getByText('nguyen-van-a-cv.pdf')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /nguyen-van-a-cv\.pdf/i }).click();
  await page.getByRole('button', { name: /^Next$/i }).click();

  await page.getByRole('button', { name: /^Next$/i }).click();

  await expect(page.getByLabel(/^Criterion$/i).first()).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /^Next$/i }).click();

  await page.getByRole('button', { name: /Start interview/i }).click();

  await expect(page).toHaveURL(/\/interview\/session-[a-f0-9]+\/prepare/, { timeout: 15_000 });
  const match = page.url().match(/\/interview\/(session-[a-f0-9]+)\/prepare/);
  if (!match?.[1]) {
    throw new Error('Practice session id not found in URL');
  }

  return match[1];
}
