import { expect, test } from '@playwright/test';
import { installMockMedia } from '../../fixtures/media';
import { loginAs } from '../../fixtures/auth';
import {
  completeInterviewPreparation,
  completePracticeSetupWizard,
} from '../../fixtures/practiceWizard';

test.describe('B2C interview happy path', () => {
  test.setTimeout(90_000);

  test('candidate completes practice flow from prepare to complete', async ({ page }) => {
    await installMockMedia(page);
    await loginAs(page, 'Candidate');

    await completePracticeSetupWizard(page, { questionCount: 5 });
    await completeInterviewPreparation(page);

    await page.getByRole('button', { name: /Start interview/i }).click();
    await expect(page).toHaveURL(/\/room/, { timeout: 8_000 });
    await expect(page.getByRole('heading', { name: /Mock Interview/i })).toBeVisible();

    for (let index = 0; index < 5; index += 1) {
      const submitAnswer = page.getByRole('button', { name: /Submit answer/i });
      await expect(page.getByText(new RegExp(`Question ${index + 1} / 5`, 'i'))).toBeVisible({
        timeout: 10_000,
      });
      await expect(page.getByText(/You can start answering/i)).toBeVisible({ timeout: 10_000 });
      await expect(submitAnswer).toBeEnabled();
      await submitAnswer.click();
    }

    await expect(page).toHaveURL(/\/complete/, { timeout: 12_000 });
    await expect(page.getByRole('heading', { name: /Interview complete/i })).toBeVisible({ timeout: 10_000 });
    const sessionId = page.url().match(/session-[a-f0-9]+/)?.[0];
    if (!sessionId) throw new Error('session id missing');
    await expect(page.getByText(new RegExp(`Assessment ID: assessment-${sessionId}`, 'i'))).toBeVisible();

    await page.getByRole('link', { name: /View result/i }).click();
    await expect(page).toHaveURL(new RegExp(`assessmentId=assessment-${sessionId}`));
    await expect(page.getByRole('tab', { name: /^Overview$/i })).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(/Overall score/i)).toBeVisible();
  });
});
