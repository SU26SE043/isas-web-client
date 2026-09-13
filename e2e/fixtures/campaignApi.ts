import type { Page } from '@playwright/test';

export const campaignId = '11111111-2222-4333-8444-555555555555';

export type WizardHarness = {
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

export async function installCampaignApi(page: Page, initialStatus: 'Draft' | 'Active' = 'Draft'): Promise<WizardHarness> {
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
    if (path === `${campaignPath}/start-now` && method === 'POST') {
      // T13 R2 — "Mở ngay khi triển khai": chỉ được gọi SAU publish và TRƯỚC invitations.
      events.push('start-now');
      draft = { ...draft, status: 'Active', startsAt: new Date().toISOString() };
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
