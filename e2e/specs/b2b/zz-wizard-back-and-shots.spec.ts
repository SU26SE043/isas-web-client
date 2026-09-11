import { expect, test, type Page } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';
import { installCampaignApi } from '../../fixtures/campaignApi';

const SHOT = 'test-results/wizard-shots';
const FUTURE_START = '2099-01-02T10:00';
const FUTURE_END = '2099-02-02T10:00';

async function shot(page: Page, name: string) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOT}/${name}.png`, fullPage: true });
}

test('lùi bước: dữ liệu đã nhập phải còn nguyên, và chụp từng màn', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await installCampaignApi(page);
  await loginAs(page, 'OrgAdmin');
  await page.goto('/employer/campaigns/new');

  // ── Bước 1 ──────────────────────────────────────────────────────────────
  await page.getByLabel('Campaign title').fill('Tuyển Backend Developer .NET — Q4/2026');
  await page.getByLabel('Domain').selectOption('backend');
  await page.getByLabel('Interview language').selectOption('en');
  await page.getByLabel('Start time').fill(FUTURE_START);
  await page.getByLabel('End time').fill(FUTURE_END);
  await shot(page, '01-thong-tin');
  await page.getByRole('button', { name: /^Next$/i }).click();

  // ── Bước 2 ──────────────────────────────────────────────────────────────
  await expect(page.getByRole('heading', { name: 'Job description', exact: true })).toBeVisible();
  await shot(page, '02-jd-truoc-khi-tai');
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'jd.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 jd'),
  });
  await expect(page.getByText('Uploaded', { exact: true })).toBeVisible();
  await shot(page, '02-jd-sau-khi-tai');

  // ── LÙI VỀ BƯỚC 1: mọi ô phải còn nguyên ────────────────────────────────
  await page.getByRole('button', { name: /^Back$/i }).click();
  await expect(page.getByLabel('Campaign title')).toHaveValue('Tuyển Backend Developer .NET — Q4/2026');
  await expect(page.getByLabel('Domain')).toHaveValue('backend');
  await expect(page.getByLabel('Interview language')).toHaveValue('en');
  await expect(page.getByLabel('Start time')).toHaveValue(FUTURE_START);
  await expect(page.getByLabel('End time')).toHaveValue(FUTURE_END);
  await shot(page, '03-lui-ve-buoc-1');

  // ── TIẾN LẠI BƯỚC 2: file đã tải phải còn ───────────────────────────────
  await page.getByRole('button', { name: /^Next$/i }).click();
  await expect(page.getByText('Uploaded', { exact: true })).toBeVisible();
  await shot(page, '04-tien-lai-buoc-2-file-con');

  // ── Bước 3 ──────────────────────────────────────────────────────────────
  await page.getByRole('button', { name: /^Next$/i }).click();
  await expect(page.getByRole('button', { name: /Customize/i })).toBeVisible();
  await shot(page, '05-tieu-chi-khoa');
  await page.getByRole('button', { name: /Customize/i }).click();
  await shot(page, '06-tieu-chi-mo-khoa');

  // ── Bước 4 ──────────────────────────────────────────────────────────────
  await page.getByRole('button', { name: /^Next$/i }).click();
  await expect(page.getByRole('button', { name: /Import CSV/i }).first()).toBeVisible();
  await shot(page, '07-cau-hoi-rong');
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Import CSV/i }).first().click();
  (await chooserPromise).setFiles({
    name: 'q.csv', mimeType: 'text/csv',
    buffer: Buffer.from('question_text,sample_answer,is_required,nhom\n"Giới thiệu một hệ thống bạn đã làm",,true,Mở đầu\n"Index B-tree ảnh hưởng truy vấn thế nào",,false,CSDL\n"Khi nào dùng message queue",,false,Kỹ thuật\n'),
  });
  await shot(page, '08-csv-xem-truoc');
  // Mock của installCampaignApi trả CỐ ĐỊNH 2 dòng, không phụ thuộc nội dung file
  // → nhãn nút là "Import 2 rows". Bản trước tôi ghi 3 theo số dòng trong buffer: đo sai.
  await page.getByRole('button', { name: /Import 2 rows/i }).click();
  await shot(page, '09-cau-hoi-sau-nhap');

  // ── LÙI VỀ BƯỚC 3 rồi TIẾN LẠI: câu hỏi phải còn ────────────────────────
  await page.getByRole('button', { name: /^Back$/i }).click();
  await expect(page.getByRole('button', { name: /Add criterion/i })).toBeEnabled();
  await page.getByRole('button', { name: /^Next$/i }).click();
  await expect(page.getByText(/How do you test React components/i)).toBeVisible();
  await shot(page, '10-lui-roi-tien-cau-hoi-con');
});
