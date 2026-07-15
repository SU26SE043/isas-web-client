import { expect, test } from '@playwright/test';
import { installMockMedia } from '../../fixtures/media';
import { loginAs } from '../../fixtures/auth';
import { completePracticeSetupWizard } from '../../fixtures/practiceWizard';

test.describe('B2C interview happy path', () => {
  test.setTimeout(90_000);

  test('candidate completes practice flow from prepare to complete', async ({ page }) => {
    await installMockMedia(page);
    await loginAs(page, 'Candidate');

    const sessionId = await completePracticeSetupWizard(page);

    await page.getByRole('checkbox', { name: /I consent to recording/i }).check();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/\/device-check/);
    await expect(page.getByText(/Camera and microphone are ready/i)).toBeVisible();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/\/waiting/);
    await expect(page).toHaveURL(/\/room/, { timeout: 8_000 });
    await expect(page.getByRole('heading', { name: /Mock Interview/i })).toBeVisible();

    for (let index = 0; index < 3; index += 1) {
      await page.getByRole('button', { name: /Submit answer/i }).evaluate((button) => {
        (button as HTMLButtonElement).click();
      });
      if (index < 2) {
        await expect(page.getByRole('button', { name: /Submit answer/i })).toBeEnabled({ timeout: 6_000 });
      }
    }

    await expect(page).toHaveURL(/\/complete/, { timeout: 12_000 });
    await expect(page.getByRole('heading', { name: /Interview complete/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(new RegExp(`Assessment ID: assessment-${sessionId}`, 'i'))).toBeVisible();

    await page.getByRole('link', { name: /View result/i }).click();
    await expect(page).toHaveURL(new RegExp(`assessmentId=assessment-${sessionId}`));
    await expect(page.getByRole('tab', { name: /^Overview$/i })).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(/Overall score/i)).toBeVisible();
  });
});
