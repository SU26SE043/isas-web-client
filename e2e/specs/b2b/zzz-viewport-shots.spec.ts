import { expect, test, type Page } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';
import { installCampaignApi } from '../../fixtures/campaignApi';

const SHOT = 'test-results/viewport-shots';

/** Cỡ máy thật, kèm cỡ vừa đúng chỗ lưới từng vỡ (1024 và 768). */
const SIZES = [
  { name: '0768x1024-tablet', width: 768, height: 1024 },
  { name: '1024x0768', width: 1024, height: 768 },
  { name: '1280x0800', width: 1280, height: 800 },
  { name: '1440x0900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1440', width: 2560, height: 1440 },
];

const LABELS = ['Campaign title', 'Domain', 'Interview language', 'Start time', 'End time'];

async function fillStep1(page: Page) {
  await page.getByLabel('Campaign title').fill('Tuyển Backend Developer .NET — Q4/2026');
  await page.getByLabel('Domain').selectOption('backend');
  await page.getByLabel('Interview language').selectOption('en');
  await page.getByLabel('Start time').fill('2099-01-02T10:00');
  await page.getByLabel('End time').fill('2099-02-02T10:00');
}

for (const size of SIZES) {
  test(`bước 1 giữ nhịp ở ${size.name}`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await installCampaignApi(page);
    await loginAs(page, 'OrgAdmin');
    await page.goto('/employer/campaigns/new');
    await fillStep1(page);
    await page.screenshot({ path: `${SHOT}/step1-${size.name}.png`, fullPage: true });

    // Lưới nghe theo bề rộng THẺ (@container), không theo bề rộng màn hình. Khi nó nghe
    // nhầm — `md:grid-cols-3` ở 768px màn hình = ba cột ~120px — nhãn xuống hai dòng và ba
    // ô nhập nằm ba độ cao khác nhau. Nhãn một dòng là phép đo trực tiếp của lỗi đó.
    for (const label of LABELS) {
      const box = await page.getByText(label, { exact: true }).first().boundingBox();
      expect(box, `${label} phải render`).not.toBeNull();
      expect(box!.height, `nhãn "${label}" xuống dòng ở ${size.name}`).toBeLessThan(30);
    }

    // Không bao giờ được cuộn ngang.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `cuộn ngang ở ${size.name}`).toBeLessThanOrEqual(1);
  });
}
