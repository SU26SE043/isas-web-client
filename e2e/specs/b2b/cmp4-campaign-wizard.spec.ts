import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';
import { campaignId, installCampaignApi } from '../../fixtures/campaignApi';

test.describe('CMP4 employer campaign wizard', () => {
  test.setTimeout(120_000);

  test('walks all eight steps, imports questions, and deploys in publish-then-invite order', async ({ page }) => {
    const harness = await installCampaignApi(page);
    await loginAs(page, 'OrgAdmin');
    await page.goto('/employer/campaigns/new');

    // Step 1: all required campaign information uses a future schedule.
    await page.getByLabel('Campaign title').fill('CMP4 full wizard');
    await page.getByLabel('Domain').selectOption('frontend');
    await page.getByLabel('Interview language').selectOption('en');
    await page.getByLabel('Start time').fill('2099-01-02T10:00');
    await page.getByLabel('End time').fill('2099-02-02T10:00');
    await page.getByRole('button', { name: /^Next$/i }).click();

    // Step 2: the default JD method is file and the upload reaches the API.
    const jdInput = page.locator('input[type="file"]').first();
    await jdInput.setInputFiles({ name: 'cmp4-jd.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 cmp4 jd') });
    await expect(page.getByText('cmp4-jd.pdf')).toBeVisible();
    await expect(page.getByText('Uploaded', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /^Next$/i }).click();

    // Step 3: khoá lúc đầu, VẪN KHOÁ sau khi rời bước rồi quay lại, và tuỳ chỉnh thì dính.
    await expect(page.getByRole('button', { name: /Customize/i })).toBeVisible();
    // ⚠ Phép PHÂN BIỆT: rời bước rồi quay lại khi CHƯA bấm Customize thì phải VẪN KHOÁ.
    // Bản hỏng dựng cờ bằng useState theo độ dài rubric; bộ chuẩn đã nạp nên quay lại là cờ tự
    // bật ⇒ bảng mở khoá. Chỉ kiểm "đã mở" thì bản hỏng cũng thoả — không phân biệt được.
    await page.getByRole('button', { name: /^Next$/i }).click();
    await page.getByRole('button', { name: /^Back$/i }).click();
    await expect(page.getByRole('button', { name: /Customize/i })).toBeVisible();
    // Nút vẫn được render, chỉ bị disabled (CampaignCriteriaManualList nhận disabled=!customized)
    // ⇒ phép phân biệt là toBeDisabled, không phải toHaveCount(0). Bản hỏng thì nút BẬT.
    await expect(page.getByRole('button', { name: /Add criterion/i })).toBeDisabled();
    await page.getByRole('button', { name: /Customize/i }).click();
    await expect(page.getByRole('button', { name: /Add criterion/i })).toBeVisible();
    await page.getByRole('button', { name: /^Next$/i }).click();
    await page.getByRole('button', { name: /^Back$/i }).click();
    await expect(page.getByRole('button', { name: /Add criterion/i })).toBeVisible();
    await page.getByRole('button', { name: /^Next$/i }).click();

    // Step 4: CSV preview reports two valid rows, then draw mode raises its count.
    // ⚠ Bắt filechooser thay vì setInputFiles thẳng vào input: nút "Import CSV" PHẢI mở hộp
    // chọn tệp. Đặt file thẳng vào input ẩn là đi vòng qua đúng con bug (open() chỉ bật hộp
    // thoại rỗng, không click input) ⇒ spec xanh trên bản hỏng.
    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /Import CSV/i }).first().click();
    const chooser = await chooserPromise;
    await chooser.setFiles({ name: 'questions.csv', mimeType: 'text/csv', buffer: Buffer.from('question_text,sample_answer,is_required,nhom\n"How do you test React components?",,true,Testing\n"How do you handle loading states?",,true,UX\n') });
    await expect(page.getByRole('dialog')).toContainText(/Read 2 rows; 2 valid rows/i);
    await page.getByRole('button', { name: /Import 2 rows/i }).click();
    await expect(page.getByText(/How do you test React components/i)).toBeVisible();
    await page.getByLabel('Draw from pool').check();
    await page.getByLabel('Placement').first().selectOption('pool');
    await page.getByRole('spinbutton', { name: 'Draw' }).fill('1');
    await expect(page.getByRole('spinbutton', { name: 'Draw' })).toHaveValue('1');
    await page.getByRole('button', { name: /^Continue$/i }).click();

    // Steps 5–6: settings and slots remain in the wizard before invites.
    await expect(page.getByRole('heading', { name: /Security & adaptive interview/i })).toBeVisible();
    await page.getByRole('button', { name: /^Next$/i }).click();
    // Bước 6 nay là "Sức chứa & ca thi": trần ứng viên TUỲ CHỌN (không còn bắt buộc như bước
    // 1 cũ) — bỏ trống vẫn qua thẳng bước Mời, không có alert nào chặn lại.
    await expect(page.getByRole('heading', { name: /Capacity & slots/i })).toBeVisible();
    await page.getByRole('button', { name: /^Next$/i }).click();

    // Step 7: typing an email only updates wizard state; it does not send invitations.
    // ⚠ Phép PHÂN BIỆT: GÕ TỪNG KÝ TỰ một địa chỉ DỞ DANG. Bản hỏng đồng bộ ngược theo identity
    // mảng nên mỗi phím bị ghi đè bằng danh sách ĐÃ LỌC ⇒ chữ chưa thành email hợp lệ biến mất.
    // fill() một email hoàn chỉnh không lộ ra, vì lọc xong bằng đúng cái vừa điền.
    const emailBox = page.getByLabel('Candidate email list');
    await emailBox.click();
    await emailBox.pressSequentially('candidate@exa', { delay: 15 });
    await expect(emailBox).toHaveValue('candidate@exa');
    await emailBox.pressSequentially('mple.com', { delay: 15 });
    await expect(emailBox).toHaveValue('candidate@example.com');
    expect(harness.invitationCalls).toBe(0);
    await page.getByRole('button', { name: /^Next$/i }).click();

    // Step 8: final deploy proves publish precedes invitations.
    await expect(page.getByRole('heading', { name: 'Deploy campaign', exact: true })).toBeVisible();
    await page.getByRole('button', { name: /^Deploy campaign$/i }).last().click();
    await expect(page).toHaveURL(new RegExp(`/employer/campaigns/${campaignId}`));
    expect(harness.events).toEqual(['publish', 'invitations']);
    expect(harness.invitationCalls).toBe(1);
  });

  test('keeps the partial-deploy retry banner after leaving and returning to Review', async ({ page }) => {
    const harness = await installCampaignApi(page);
    harness.setInvitationFailure(true);
    await loginAs(page, 'OrgAdmin');
    await page.goto(`/employer/campaigns/${campaignId}/edit`);
    await expect(page.getByRole('button', { name: 'Review' })).toBeEnabled();
    await page.getByRole('button', { name: 'Invite candidates' }).click();
    await page.getByLabel('Candidate email list').fill('candidate@example.com');
    await page.getByRole('button', { name: 'Review' }).click();
    await page.getByRole('button', { name: /^Deploy campaign$/i }).last().click();
    await expect(page.getByRole('alert')).toContainText(/campaign opened|retry only the invitations/i);

    await page.getByRole('button', { name: 'Invite candidates' }).click();
    await page.getByRole('button', { name: 'Review' }).click();
    await expect(page.getByRole('alert')).toContainText(/campaign opened|retry only the invitations/i);
    await expect(page.getByRole('button', { name: /Retry invitations/i }).first()).toBeVisible();

    harness.setInvitationFailure(false);
    await page.getByRole('button', { name: /Retry invitations/i }).first().click();
    await expect(page).toHaveURL(new RegExp(`/employer/campaigns/${campaignId}`));
    await expect.poll(() => harness.invitationCalls).toBe(2);
    await expect.poll(() => harness.events).toEqual(['publish', 'invitations', 'invitations']);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CA KIỂM CỦA TESTER — bỏ trống / nhập thiếu / nhập sai.
  // Tất cả đi qua GIAO DIỆN THẬT, không gọi thẳng hàm validate: thứ hay hỏng là khe nối
  // giữa nút Next, hàm validate và chỗ hiện thông báo — gọi thẳng hàm thì không thấy.
  // ══════════════════════════════════════════════════════════════════════════

  async function openWizard(page: Page) {
    await installCampaignApi(page);
    await loginAs(page, 'OrgAdmin');
    await page.goto('/employer/campaigns/new');
  }

  const FUTURE_START = '2099-01-02T10:00';
  const FUTURE_END = '2099-02-02T10:00';

  test('bước 1: bỏ trống tên chiến dịch ⇒ chặn, nói rõ thiếu gì', async ({ page }) => {
    await openWizard(page);
    await page.getByLabel('Domain').selectOption('frontend');
    await page.getByLabel('Interview language').selectOption('en');
    await page.getByLabel('Start time').fill(FUTURE_START);
    await page.getByLabel('End time').fill(FUTURE_END);
    await page.getByRole('button', { name: /^Next$/i }).click();
    await expect(page.getByRole('alert').getByText('Please enter a campaign name.')).toBeVisible();
    await expect(page.getByLabel('Campaign title')).toBeVisible();
  });

  test('bước 1: bỏ trống lĩnh vực ⇒ chặn', async ({ page }) => {
    await openWizard(page);
    await page.getByLabel('Campaign title').fill('Thiếu lĩnh vực');
    await page.getByLabel('Interview language').selectOption('en');
    await page.getByLabel('Start time').fill(FUTURE_START);
    await page.getByLabel('End time').fill(FUTURE_END);
    await page.getByRole('button', { name: /^Next$/i }).click();
    await expect(page.getByRole('alert').getByText('Please select a domain.')).toBeVisible();
  });

  test('bước 1: ô ngôn ngữ có placeholder rỗng — chọn nó thì phải CHẶN', async ({ page }) => {
    // ⚠ Tiền đề đã đo: state khởi tạo language = 'vi' (useCampaignWizard), nên KHÔNG THỂ bỏ
    // trống ô này bằng cách không đụng tới — luôn có sẵn Tiếng Việt. Nhưng giao diện vẫn bày
    // một <option value=""> placeholder, tức nó là ĐƯỜNG DUY NHẤT tạo ra trạng thái không hợp
    // lệ. Ca này khoá đúng đường đó.
    await openWizard(page);
    await page.getByLabel('Campaign title').fill('Chọn placeholder ngôn ngữ');
    await page.getByLabel('Domain').selectOption('frontend');
    await page.getByLabel('Interview language').selectOption('');
    await page.getByLabel('Start time').fill(FUTURE_START);
    await page.getByLabel('End time').fill(FUTURE_END);
    await page.getByRole('button', { name: /^Next$/i }).click();
    await expect(page.getByRole('alert').getByText('Please select an interview language.')).toBeVisible();
  });

  test('bước 1: không đụng ô ngôn ngữ thì mặc định Tiếng Việt, đi tiếp được', async ({ page }) => {
    // Đối chứng của ca trên: mặc định là 'vi' chứ không phải "chưa chọn".
    await openWizard(page);
    await page.getByLabel('Campaign title').fill('Mặc định tiếng Việt');
    await page.getByLabel('Domain').selectOption('frontend');
    await page.getByLabel('Start time').fill(FUTURE_START);
    await page.getByLabel('End time').fill(FUTURE_END);
    await page.getByRole('button', { name: /^Next$/i }).click();
    await expect(page.getByRole('heading', { name: 'Job description', exact: true })).toBeVisible();
  });

  test('bước 1: ngày kết thúc TRƯỚC ngày bắt đầu ⇒ chặn', async ({ page }) => {
    await openWizard(page);
    await page.getByLabel('Campaign title').fill('Ngày ngược');
    await page.getByLabel('Domain').selectOption('frontend');
    await page.getByLabel('Interview language').selectOption('en');
    await page.getByLabel('Start time').fill('2099-03-01T10:00');
    await page.getByLabel('End time').fill('2099-02-01T10:00');
    await page.getByRole('button', { name: /^Next$/i }).click();
    await expect(page.getByRole('alert').getByText('End time must be after start time.')).toBeVisible();
  });

  test('bước 1: ngày bắt đầu ở QUÁ KHỨ ⇒ chặn', async ({ page }) => {
    // Quan trọng vì nút "Bắt đầu sớm" ở bước 8 chỉ có nghĩa khi mốc mở còn ở tương lai.
    await openWizard(page);
    await page.getByLabel('Campaign title').fill('Mốc quá khứ');
    await page.getByLabel('Domain').selectOption('frontend');
    await page.getByLabel('Interview language').selectOption('en');
    await page.getByLabel('Start time').fill('2020-01-01T10:00');
    await page.getByLabel('End time').fill(FUTURE_END);
    await page.getByRole('button', { name: /^Next$/i }).click();
    await expect(page.getByRole('alert').getByText('Start time must be now or in the future.')).toBeVisible();
  });

  test('bước 2: bỏ qua mô tả công việc ⇒ chặn, không lọt sang bước 3', async ({ page }) => {
    await openWizard(page);
    await page.getByLabel('Campaign title').fill('Không JD');
    await page.getByLabel('Domain').selectOption('frontend');
    await page.getByLabel('Interview language').selectOption('en');
    await page.getByLabel('Start time').fill(FUTURE_START);
    await page.getByLabel('End time').fill(FUTURE_END);
    await page.getByRole('button', { name: /^Next$/i }).click();
    await page.getByRole('button', { name: /^Next$/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Customize/i })).toHaveCount(0);
  });

  test('bước 4: không có câu hỏi nào ⇒ CHẶN, không lọt sang bước 5', async ({ page }) => {
    // Phát hiện khi ca email bị kẹt ở đây: bước 4 đòi ít nhất một câu hỏi. Hành vi ĐÚNG,
    // và đáng khoá lại — publish với ngân hàng đề rỗng là chiến dịch không ai thi được.
    await openWizard(page);
    await page.getByLabel('Campaign title').fill('Không câu hỏi');
    await page.getByLabel('Domain').selectOption('frontend');
    await page.getByLabel('Interview language').selectOption('en');
    await page.getByLabel('Start time').fill(FUTURE_START);
    await page.getByLabel('End time').fill(FUTURE_END);
    await page.getByRole('button', { name: /^Next$/i }).click();

    const jdInput = page.locator('input[type="file"]').first();
    await jdInput.setInputFiles({ name: 'jd.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 jd') });
    await expect(page.getByText('Uploaded', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /^Next$/i }).click();

    // Bước 3: CHỜ bộ tiêu chí chuẩn nạp xong — Next xám CÂM trong lúc chưa nạp (xem ghi chú trên).
    await expect(page.getByRole('button', { name: /Customize/i })).toBeVisible();
    await page.getByRole('button', { name: /^Next$/i }).click();

    // Bước 4 với ngân hàng đề RỖNG.
    await expect(page.getByRole('button', { name: /Import CSV/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    // Phải đứng lại ở bước 4, KHÔNG sang bước 5.
    await expect(page.getByRole('heading', { name: /Security & adaptive interview/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Import CSV/i }).first()).toBeVisible();
  });

});
