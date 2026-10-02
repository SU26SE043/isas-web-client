import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

const current = {
  jobCategory: 'BE', isCustom: true, defaultVersion: 3, basedOnDefaultVersion: 1,
  criteria: [{ id: 'c-1', name: 'My communication', description: 'My description', weight: 1, maxScore: 5,
    levels: [{ score: 0, descriptor: 'Custom level text' }, { score: 5, descriptor: 'Strong custom level' }] }],
};
const standard = {
  jobCategory: 'BE', isCustom: false, defaultVersion: 3, basedOnDefaultVersion: null,
  criteria: [{ id: 'c-1', name: 'Communication', description: 'Default description', weight: 1, maxScore: 5,
    levels: [{ score: 0, descriptor: 'Default level text' }, { score: 5, descriptor: 'Strong default level' }] }],
};

test('candidate compares an updated default rubric and applies it through confirmed reset', async ({ page }) => {
  let reset = false;
  const deletes: string[] = [];
  await page.route('**/api/v1/interview/practice/rubrics/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith('/default')) return route.fulfill({ json: standard });
    if (request.method() === 'DELETE') {
      deletes.push(url.pathname + url.search);
      reset = true;
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ json: reset ? standard : current });
  });

  await loginAs(page, 'Candidate');
  await page.goto('/candidate/rubrics?category=BE&language=en');
  await expect(page.getByText('The default rubric has been updated to version 3.')).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'View differences' }).click();
  const diff = page.getByRole('dialog');
  await expect(diff.getByRole('heading', { name: 'Compare with default rubric' })).toBeVisible();
  await expect(diff.getByText('Default level text')).toBeVisible();
  await expect(diff.getByText('Custom level text')).toBeVisible();
  await diff.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: 'Apply default rubric' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Restore default rubric?' });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Restore' }).click();
  await expect.poll(() => deletes.length).toBe(1);
  await expect(page.getByText('The default rubric has been updated to version 3.')).toHaveCount(0);
  expect(deletes).toEqual(['/api/v1/interview/practice/rubrics/BE?language=en']);
});
