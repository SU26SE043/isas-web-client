import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

/** Payload đúng hợp đồng `GET /api/v1/campaign/analytics` (cùng số với fixture unit test). */
function analyticsResponse() {
  return {
    from: '2026-08-14T00:00:00Z',
    to: '2026-09-13T00:00:00Z',
    granularity: 'day',
    campaigns: { total: 23, byStatus: [{ status: 'Active', count: 5 }, { status: 'Draft', count: 12 }, { status: 'Closed', count: 6 }] },
    screening: {
      submissions: 40,
      analyzed: 30,
      byStatus: [{ status: 'Analyzed', count: 30 }, { status: 'Filtered', count: 10 }],
      medianFitScore: 62.5,
      fitDistribution: [
        { band: '0-19', count: 1 }, { band: '20-39', count: 0 }, { band: '40-59', count: 3 },
        { band: '60-79', count: 5 }, { band: '80-100', count: 2 },
      ],
      riskBySeverity: [{ risk: 'Low', count: 10 }, { risk: 'Medium', count: 4 }, { risk: 'High', count: 1 }],
      topSkills: [{ skill: 'SQL', count: 12 }, { skill: 'React', count: 9 }],
    },
    invitations: { total: 50, queued: 1, sent: 40, joined: 30, expired: 5, revoked: 4 },
    interviews: {
      joined: 30, started: 25, inProgress: 3, completed: 22, scored: 20, pendingScore: 2,
      passed: 12, failed: 6, undetermined: 2, medianScore: 55.5,
      scoreDistribution: [
        { band: '0-19', count: 0 }, { band: '20-39', count: 2 }, { band: '40-59', count: 8 },
        { band: '60-79', count: 7 }, { band: '80-100', count: 3 },
      ],
      flagsBySignal: [{ signalType: 'tab_switch', count: 7 }, { signalType: 'face_mismatch', count: 2 }],
    },
    buckets: [
      { periodStart: '2026-08-14T00:00:00Z', campaignsCreated: 1, invitationsSent: 3, joins: 2, interviewsStarted: 2, scored: 1 },
      { periodStart: '2026-09-01T00:00:00Z', campaignsCreated: 0, invitationsSent: 5, joins: 4, interviewsStarted: 3, scored: 2 },
    ],
    perCampaign: [
      { campaignId: 'c-1', title: 'Backend Engineer', status: 'Active', createdAt: '2026-09-01T08:00:00Z', invited: 5, joined: 4, started: 3, scored: 2, passed: 1, medianScore: 60 },
      { campaignId: 'c-2', title: 'Data Analyst', status: 'Draft', createdAt: '2026-08-20T08:00:00Z', invited: 0, joined: 0, started: 0, scored: 0, passed: 0, medianScore: null },
    ],
  };
}

function emptyResponse() {
  const base = analyticsResponse();
  return {
    ...base,
    campaigns: { total: 0, byStatus: [] },
    screening: { ...base.screening, submissions: 0, analyzed: 0, byStatus: [], medianFitScore: null, topSkills: [] },
    invitations: { total: 0, queued: 0, sent: 0, joined: 0, expired: 0, revoked: 0 },
    interviews: { ...base.interviews, joined: 0, started: 0, inProgress: 0, completed: 0, scored: 0, pendingScore: 0, passed: 0, failed: 0, undetermined: 0, medianScore: null, flagsBySignal: [] },
    buckets: [],
    perCampaign: [],
  };
}

test.describe('employer recruitment analytics (real endpoint contract, route-mocked)', () => {
  test('OrgAdmin sees org totals, funnel, per-campaign links; filters re-query with UTC period + groupBy', async ({ page }) => {
    // Dashboard (trang đích sau login) gọi campaign list / ví / thành viên — không mock thì gateway thật trả 401
    // cho token giả ⇒ refresh hụt ⇒ app đăng xuất giữa chừng. Đăng ký catch-all TRƯỚC để các route sau thắng.
    await page.route('**/api/v1/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    const requests: URL[] = [];
    await page.route('**/api/v1/campaign/analytics*', async (route) => {
      requests.push(new URL(route.request().url()));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(analyticsResponse()) });
    });

    await loginAs(page, 'OrgAdmin');
    await page.getByRole('link', { name: 'Analytics' }).click();
    await expect(page).toHaveURL(/\/employer\/analytics$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Recruitment analytics' })).toBeVisible();

    const stats = page.getByTestId('employer-analytics-stats');
    await expect(stats.getByText('Active campaigns')).toBeVisible();
    await expect(stats.getByText('5', { exact: true })).toBeVisible();
    await expect(stats.getByText('66.7%')).toBeVisible();
    await expect(stats.getByText('55.5')).toBeVisible();
    await expect(page.getByText('Invitations: 40 sent · 1 queued · 5 expired · 4 revoked')).toBeVisible();
    await expect(page.getByText('Left the interview tab')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Backend Engineer' })).toHaveAttribute('href', '/employer/campaigns/c-1/overview');
    await expect(page.getByText('Chart period:')).toBeVisible();

    // Kỳ mặc định 30 ngày: from/to là ISO UTC cách nhau đúng 30 ngày, groupBy=day.
    expect(requests).toHaveLength(1);
    const first = requests[0]!.searchParams;
    expect(first.get('groupBy')).toBe('day');
    expect(Date.parse(first.get('to')!) - Date.parse(first.get('from')!)).toBe(30 * 24 * 60 * 60 * 1000);

    await page.getByLabel('Group by').selectOption('month');
    await expect.poll(() => requests.at(-1)?.searchParams.get('groupBy')).toBe('month');
    await page.getByLabel('Period', { exact: true }).selectOption('ytd');
    await expect.poll(() => requests.at(-1)?.searchParams.get('from')).toMatch(/-01-01T00:00:00\.000Z$/);

    await page.screenshot({ path: 'test-results/employer-analytics/orgadmin-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole('heading', { level: 1, name: 'Recruitment analytics' })).toBeVisible();
    // Bảng cuộn TRONG khung, trang không tràn ngang.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.screenshot({ path: 'test-results/employer-analytics/orgadmin-mobile.png', fullPage: true });
  });

  test('HrMember can open the page too (read-only endpoint for every employer role)', async ({ page }) => {
    await page.route('**/api/v1/campaign/analytics*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(analyticsResponse()) }),
    );
    await loginAs(page, 'HrMember');
    await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible();
    await page.goto('/employer/analytics');
    await expect(page.getByRole('heading', { level: 1, name: 'Recruitment analytics' })).toBeVisible();
    await expect(page.getByTestId('employer-analytics-stats').getByText('Scored', { exact: true })).toBeVisible();
  });

  test('403 (session without org) shows the org message and a retry button', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/v1/campaign/analytics*', async (route) => {
      calls += 1;
      await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ error: 'Missing org_id' }) });
    });
    await loginAs(page, 'OrgAdmin');
    await page.goto('/employer/analytics');
    await expect(page.getByRole('alert')).toContainText('Your session does not belong to an organization.');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect.poll(() => calls).toBe(2);
  });

  test('organization without campaigns shows the empty state with a create link', async ({ page }) => {
    await page.route('**/api/v1/campaign/analytics*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyResponse()) }),
    );
    await loginAs(page, 'OrgAdmin');
    await page.goto('/employer/analytics');
    await expect(page.getByText('No campaign in this organization yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create campaign' })).toHaveAttribute('href', '/employer/campaigns/new');
    await expect(page.getByTestId('employer-analytics-stats')).toHaveCount(0);
  });
});
