import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

const campaignId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

function campaignResponse(status: 'Draft' | 'Active') {
  return {
    id: campaignId,
    orgId: 'e2e-org',
    title: 'Backend Engineer',
    domain: 'Backend',
    location: 'Ho Chi Minh City',
    status,
    language: 'en',
    maxCandidates: 20,
    timeLimitMinutes: 45,
    startsAt: '2026-08-15T01:00:00Z',
    expiresAt: '2026-08-20T16:59:59Z',
    questions: [{ id: 'q1', questionText: 'Explain API pagination.' }],
    criteria: [{ id: 'c1', name: 'Backend skills', weight: 1, maxScore: 10 }],
    jdText: 'Build and maintain reliable backend services for the product.',
    createdAt: '2026-08-10T08:00:00Z',
    updatedAt: '2026-08-10T08:00:00Z',
  };
}

test('Employer manages live interview slots on Campaign Detail', async ({ page }) => {
  const slots = [
    {
      id: 'slot-running',
      startsAt: '2026-08-16T02:00:00Z',
      endsAt: '2026-08-16T03:00:00Z',
      capacity: 5,
      assignedCount: 3,
      startedCount: 1,
    },
  ];
  let lastCreateBody: Record<string, unknown> | null = null;
  let lastUpdateBody: Record<string, unknown> | null = null;

  await page.route(`**/api/v1/campaign/${campaignId}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(campaignResponse('Draft')) }),
  );
  await page.route(`**/api/v1/campaign/${campaignId}/results*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await page.route(`**/api/v1/campaign/${campaignId}/slots`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(slots) });
      return;
    }
    lastCreateBody = route.request().postDataJSON() as Record<string, unknown>;
    const created = { id: 'slot-created', ...lastCreateBody, assignedCount: 0, startedCount: 0 };
    slots.push(created as (typeof slots)[number]);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(created) });
  });
  await page.route(`**/api/v1/campaign/${campaignId}/slots/*`, async (route) => {
    const slotId = route.request().url().split('/').at(-1)!;
    if (route.request().method() === 'PUT') {
      lastUpdateBody = route.request().postDataJSON() as Record<string, unknown>;
      const slot = slots.find((item) => item.id === slotId)!;
      Object.assign(slot, lastUpdateBody);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(slot) });
      return;
    }
    const slot = slots.find((item) => item.id === slotId)!;
    if (slot.startedCount > 0) {
      await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'running' }) });
      return;
    }
    slots.splice(slots.indexOf(slot), 1);
    await route.fulfill({ status: 204, body: '' });
  });

  await loginAs(page, 'OrgAdmin');
  await page.goto(`/employer/campaigns/${campaignId}/overview?tab=details`);
  await expect(page.getByText('Assigned:')).toBeVisible();
  await expect(page.getByText('3/5')).toBeVisible();
  await expect(page.getByText('In progress:')).toBeVisible();

  await page.getByRole('button', { name: 'Add slot' }).click();
  await expect(page.getByLabel('Maximum candidates')).toBeVisible();
  await page.getByLabel('Maximum candidates').fill('0');
  await page.getByRole('button', { name: 'Create slot', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('positive integer');

  await page.getByLabel('Start time').fill('2026-08-16T11:00');
  await page.getByLabel('End time').fill('2026-08-16T12:00');
  await page.getByLabel('Maximum candidates').fill('5');
  await page.getByRole('button', { name: 'Create slot', exact: true }).click();
  await expect(page.getByText('0/5')).toBeVisible();
  expect(lastCreateBody).toEqual({
    startsAt: new Date('2026-08-16T11:00').toISOString(),
    endsAt: new Date('2026-08-16T12:00').toISOString(),
    capacity: 5,
  });

  const runningRow = page.getByRole('article').filter({ hasText: '3/5' });
  await runningRow.getByRole('button', { name: 'Edit slot' }).click();
  await page.getByLabel('Maximum candidates').fill('2');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('alert')).toContainText('cannot be lower');
  await page.getByLabel('Maximum candidates').fill('8');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('3/8')).toBeVisible();
  expect(lastUpdateBody).toEqual(expect.objectContaining({ capacity: 8, startsAt: expect.any(String), endsAt: expect.any(String) }));

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('article').filter({ hasText: '3/8' }).getByRole('button', { name: 'Delete slot' }).click();
  await expect(page.getByText('cannot be deleted while candidates are interviewing')).toBeVisible();

  await page.screenshot({ path: 'test-results/campaign-slots-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByText(/^Interview slots/).first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/campaign-slots-mobile.png', fullPage: true });
});

test('warns before invitations exceed available slot capacity', async ({ page }) => {
  let invitationCalls = 0;
  await page.route(`**/api/v1/campaign/${campaignId}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(campaignResponse('Active')) }),
  );
  await page.route(`**/api/v1/campaign/${campaignId}/slots`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 'slot-1', startsAt: '2026-08-16T02:00:00Z', endsAt: '2026-08-16T03:00:00Z', capacity: 5, assignedCount: 3, startedCount: 0 }]),
    }),
  );
  await page.route(`**/api/v1/campaign/${campaignId}/invitations`, async (route) => {
    invitationCalls += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ created: [], failed: [] }) });
  });

  await loginAs(page, 'OrgAdmin');
  await page.goto(`/employer/campaigns/${campaignId}/invite/email`);
  await page.getByLabel('Paste email list').fill('a@example.com\nb@example.com\nc@example.com');
  await page.getByRole('button', { name: 'Add to list' }).click();
  await expect(page.getByText(/exceed the available interview slot capacity \(2\)/)).toBeVisible();
  await page.getByRole('button', { name: 'Send invitations' }).click();
  await expect(page.getByRole('dialog')).toContainText('exceed the available interview slot capacity');
  expect(invitationCalls).toBe(0);
});

test('shows the dedicated slot step before Review in the edit wizard', async ({ page }) => {
  await page.route(`**/api/v1/campaign/${campaignId}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(campaignResponse('Draft')) }),
  );
  await page.route(`**/api/v1/campaign/${campaignId}/slots`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 'slot-1', startsAt: '2026-08-16T02:00:00Z', endsAt: '2026-08-16T03:00:00Z', capacity: 5, assignedCount: 3, startedCount: 1 }]),
    }),
  );

  await loginAs(page, 'OrgAdmin');
  await page.goto(`/employer/campaigns/${campaignId}/edit`);
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole('button', { name: /Next|Continue/ }).click();
  }
  await expect(page.getByText('Manage interview windows and capacity. The system assigns candidates to available slots.')).toBeVisible();
  await expect(page.getByText('Assigned:')).toBeVisible();
  await page.screenshot({ path: 'test-results/campaign-slots-wizard.png', fullPage: true });
});
