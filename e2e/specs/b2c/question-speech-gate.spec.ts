import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';
import { installMockMedia } from '../../fixtures/media';
import {
  completeInterviewPreparation,
  completePracticeSetupWizard,
} from '../../fixtures/practiceWizard';

test('question text stays visible while TTS locks and then releases recording', async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await installMockMedia(page);
  await loginAs(page, 'Candidate');
  await completePracticeSetupWizard(page);
  await completeInterviewPreparation(page);

  await page.getByRole('button', { name: /Start interview/i }).click();
  await expect(page).toHaveURL(/\/room/, { timeout: 8_000 });

  const question = page.getByRole('heading', {
    name: /Question 1 for FE: describe a relevant experience/i,
  });
  const recorder = page.getByRole('button', { name: /Open Audio Recorder/i });

  await expect(question).toBeVisible();
  await expect(page.getByText(/AI is reading the question/i)).toBeVisible({ timeout: 8_000 });
  await expect(recorder).toBeDisabled();
  await page.screenshot({ path: testInfo.outputPath('desktop-speaking.png'), fullPage: true });

  await expect(page.getByText(/You can start answering/i)).toBeVisible({ timeout: 4_000 });
  await expect(recorder).toBeEnabled();

  await page.evaluate(async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: /Return to fullscreen/i }).click();
  await expect(recorder).toBeEnabled();
  await expect(question).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('mobile-ready.png'), fullPage: true });

  await page.evaluate(async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  });
  await page.setViewportSize({ width: 768, height: 900 });
  await page.getByRole('button', { name: /Return to fullscreen/i }).click();
  await expect(recorder).toBeEnabled();
  await page.screenshot({ path: testInfo.outputPath('tablet-ready.png'), fullPage: true });
});
