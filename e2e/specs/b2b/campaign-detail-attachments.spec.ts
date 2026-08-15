import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

const campaignId = '11111111-2222-4333-8444-555555555555';
const detailUrl = `/employer/campaigns/${campaignId}/overview?tab=details`;

test.describe('Employer campaign detail attachments', () => {
  test('shows uploaded documents and downloads the selected PDF', async ({ page }) => {
    await page.addInitScript((id) => {
      window.localStorage.setItem(
        `isas:campaign-attachments:${id}`,
        JSON.stringify([
          { type: 'jd', name: 'senior-product-designer-jd.pdf', size: 1_572_864 },
          { type: 'criteria', name: 'evaluation-criteria.pdf', size: 438_272 },
        ]),
      );
    }, campaignId);
    await page.route(`**/api/v1/campaign/${campaignId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: campaignId,
          orgId: 'e2e-org',
          title: 'Senior Product Designer',
          domain: 'Product Design',
          status: 'Draft',
          language: 'en',
          seniority: 'Senior',
          maxCandidates: 50,
          timeLimitMinutes: 45,
          passScorePct: 70,
          startsAt: '2026-08-10T08:00:00.000Z',
          expiresAt: '2026-09-10T08:00:00.000Z',
          antiCheatEnabled: true,
          faceVerifyEnabled: true,
          questions: [{ id: 'q1', questionText: 'Describe your design process.' }],
          criteria: [{ id: 'c1', name: 'Product thinking', weight: 1, description: 'Structured decision making.' }],
          jdText: 'Lead product discovery and deliver accessible user experiences.',
          createdAt: '2026-08-01T08:00:00.000Z',
          updatedAt: '2026-08-10T08:00:00.000Z',
        }),
      });
    });
    await page.route(`**/api/v1/campaign/${campaignId}/files/download*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: { 'Content-Disposition': 'attachment; filename="senior-product-designer-jd.pdf"' },
        body: '%PDF-1.4 attachment',
      });
    });
    await page.route(`**/api/v1/campaign/${campaignId}/results*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 }),
      });
    });

    await loginAs(page, 'OrgAdmin');
    await page.goto(detailUrl);

    const attachments = page.getByText(/^Attachments/).first();
    await expect(attachments).toBeVisible();
    await expect(page.getByText('senior-product-designer-jd.pdf')).toBeVisible();
    await expect(page.getByText('evaluation-criteria.pdf')).toBeVisible();
    await page.screenshot({ path: 'test-results/campaign-attachments-desktop.png', fullPage: true });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download senior-product-designer-jd.pdf' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('senior-product-designer-jd.pdf');

    await page.setViewportSize({ width: 375, height: 812 });
    await attachments.scrollIntoViewIfNeeded();
    await expect(page.getByText('senior-product-designer-jd.pdf')).toBeVisible();
    await page.screenshot({ path: 'test-results/campaign-attachments-mobile.png', fullPage: true });
  });
});
