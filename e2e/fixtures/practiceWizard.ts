import { expect, type Page } from '@playwright/test';

/**
 * Drive the 6-step B2C practice setup wizard through to /prepare.
 * CV/JD are optional; question count is set to 3 to match happy-path submit loops.
 */
export async function completePracticeSetupWizard(page: Page): Promise<string> {
  await page.goto('/practice');
  await expect(page.getByRole('heading', { name: /Choose a job category/i })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole('button', { name: /^Frontend Developer$/i }).click();
  await page.getByRole('button', { name: /^Next$/i }).click();

  // CV optional
  await expect(page.getByRole('button', { name: /^Next$/i })).toBeEnabled({ timeout: 10_000 });
  await page.getByRole('button', { name: /^Next$/i }).click();

  // JD optional
  await page.getByRole('button', { name: /^Next$/i }).click();

  // Time per question (default 120s is fine)
  await page.getByRole('button', { name: /^Next$/i }).click();

  // Question count → 3 (matches interview-happy-path submit loop)
  await page.getByRole('spinbutton', { name: /Question count/i }).fill('3');
  await page.getByRole('button', { name: /^Next$/i }).click();

  await page.getByRole('button', { name: /Start interview/i }).click();

  await expect(page).toHaveURL(/\/interview\/session-[a-f0-9]+\/prepare/, { timeout: 15_000 });
  const match = page.url().match(/\/interview\/(session-[a-f0-9]+)\/prepare/);
  if (!match?.[1]) {
    throw new Error('Practice session id not found in URL');
  }

  return match[1];
}

/**
 * Complete preparation step 1 (consent) and step 2 (device check) on /prepare.
 */
export async function completeInterviewPreparation(page: Page): Promise<void> {
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /^Continue$/i }).click();

  await expect(page.getByText(/Camera is working|Camera hoạt động/i)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/Microphone is working|Microphone hoạt động/i)).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole('button', { name: /^Continue$/i }).click();

  await expect(page).toHaveURL(/\/prepare\?step=waiting/, { timeout: 15_000 });
}
