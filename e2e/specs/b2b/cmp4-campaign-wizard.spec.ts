import { expect, test, type Page } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

const campaignId = '11111111-2222-4333-8444-555555555555';

type WizardHarness = {
  events: string[];
  invitationCalls: number;
  setInvitationFailure: (enabled: boolean) => void;
};

function campaignResponse(status: 'Draft' | 'Active' = 'Draft') {
  return {
    id: campaignId,
    orgId: 'e2e-org',
    title: 'CMP4 Frontend Campaign',
    domain: 'Frontend',
    location: 'Ho Chi Minh City',
    status,
    language: 'en',
    maxCandidates: 10,
    capacity: 10,
    timeLimitMinutes: 60,
    durationMinutes: 60,
    startsAt: '2099-01-01T02:00:00.000Z',
    deadline: '2099-02-01T02:00:00.000Z',
    expiresAt: '2099-02-01T02:00:00.000Z',
    jdText: 'Build a frontend product with accessible React components.',
    jobDescription: 'Build a frontend product with accessible React components.',
    maxQuestions: 5,
    maxDeepPerQuestion: 0,
    maxFollowUps: 0,
    adaptiveEnabled: false,
    questions: [
      { id: 'q-existing', questionText: 'Explain component composition.', isRequired: true },
    ],
    criteria: [
      { id: 'criterion-1', name: 'Frontend engineering', description: 'Engineering quality', weight: 1, maxScore: 10 },
    ],
    questionBank: { total: 1, alwaysAsked: 1, questionsPerSession: null, warnings: [] },
    jobNeeds: [],
    invitedEmails: ['existing@example.com'],
    cvCount: 0,
    invitedCount: 0,
    completedCount: 0,
    createdAt: '2098-12-01T00:00:00.000Z',
    updatedAt: '2098-12-01T00:00:00.000Z',
  };
}

async function installCampaignApi(page: Page, initialStatus: 'Draft' | 'Active' = 'Draft'): Promise<WizardHarness> {
  const events: string[] = [];
  let invitationCalls = 0;
  let invitationFailure = false;
  let draft = campaignResponse(initialStatus);

  await page.route('**/api/v1/campaign/criteria/system-default/preview*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        jobCategory: 'FE',
        language: 'en',
        criteria: [{ id: 'criterion-default', name: 'Frontend engineering', description: 'Engineering quality', weight: 1, maxScore: 10, levels: [] }],
      }),
    });
  });

  await page.route('**/api/v1/campaign**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const campaignPath = `/api/v1/campaign/${campaignId}`;

    if (path === '/api/v1/campaign/criteria/system-default/preview' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {
          jobCategory: 'FE',
          language: 'en',
          criteria: [{ id: 'criterion-default', name: 'Frontend engineering', description: 'Engineering quality', weight: 1, maxScore: 10, levels: [] }],
        } }),
      });
      return;
    }
    if (path === '/api/v1/campaign' && method === 'POST') {
      draft = { ...draft, status: 'Draft' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(draft) });
      return;
    }
    if (path === campaignPath && method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(draft) });
      return;
    }
    if (path === campaignPath && method === 'PUT') {
      const body = request.postDataJSON() as Record<string, unknown>;
      draft = { ...draft, ...body, updatedAt: new Date().toISOString() };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(draft) });
      return;
    }
    if (path === `${campaignPath}/files` && method === 'POST') {
      draft = { ...draft, jdText: 'Build a frontend product with accessible React components.', jobDescription: 'Build a frontend product with accessible React components.' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(draft) });
      return;
    }
    if (path === `${campaignPath}/questions/import` && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {
        // ⚠ HÌNH DẠNG THẬT của backend: ImportQuestionsResult.Questions → khoá `questions`.
        // Bản trước mock trả `items` — đúng khoá mà code HỎNG đọc — nên spec xanh trên cả
        // bản hỏng lẫn bản đã sửa: nó đo chính cái mock, không đo hợp đồng với server.
          totalRows: 2,
          questions: [
            { rowNumber: 2, questionText: 'How do you test React components?', isRequired: true, questionGroup: 'Testing' },
            { rowNumber: 3, questionText: 'How do you handle loading states?', isRequired: true, questionGroup: 'UX' },
          ],
          errors: [],
        } }),
      });
      return;
    }
    if (path === `${campaignPath}/questions` && method === 'PUT') {
      const body = request.postDataJSON() as Array<{ questionText: string; isRequired?: boolean }>;
      draft = { ...draft, questions: body.map((item, index) => ({ id: `q-${index + 1}`, ...item })) };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(draft) });
      return;
    }
    if (path === `${campaignPath}/slots` && method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      return;
    }
    if (path === `${campaignPath}/publish` && method === 'POST') {
      events.push('publish');
      draft = { ...draft, status: 'Active' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(draft) });
      return;
    }
    if (path === `${campaignPath}/invitations` && method === 'POST') {
      events.push('invitations');
      invitationCalls += 1;
      if (invitationFailure) {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Invitation service is temporarily unavailable.' }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ created: [{ id: 'invite-1', email: 'candidate@example.com', expiresAt: '2099-02-02T00:00:00Z' }], failed: [] }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });

  return {
    get events() { return events; },
    get invitationCalls() { return invitationCalls; },
    setInvitationFailure: (enabled: boolean) => { invitationFailure = enabled; },
  };
}

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
    await expect(page.getByRole('heading', { name: /Interview slots/i })).toBeVisible();
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
});
