import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('organization member Auth APIs', () => {
  test('lists, invites, and changes roles with the exact Auth contracts', async ({ page }) => {
    const members = [
      {
        userId: 'member-1',
        email: 'owner@isas.dev',
        fullName: 'Organization Owner',
        orgRole: 'OrgAdmin',
        joinedAt: '2026-07-20T00:00:00.000Z',
      },
    ];
    let inviteBody: unknown;
    let patchBody: unknown;

    await page.route('**/api/v1/auth/org/members**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (request.method() === 'GET' && url.pathname.endsWith('/org/members')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(members) });
        return;
      }

      if (request.method() === 'POST' && url.pathname.endsWith('/org/members')) {
        inviteBody = request.postDataJSON();
        const created = {
          userId: 'member-2',
          email: 'new.hr@isas.dev',
          fullName: 'New HR',
          orgRole: 'HrMember',
          joinedAt: '2026-07-28T00:00:00.000Z',
        };
        members.unshift(created);
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(created) });
        return;
      }

      if (request.method() === 'PATCH' && url.pathname.endsWith('/org/members/member-2')) {
        patchBody = request.postDataJSON();
        const updated = { ...members[0], orgRole: 'OrgAdmin' };
        members[0] = updated;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(updated) });
        return;
      }

      if (request.method() === 'PATCH' && url.pathname.endsWith('/org/members/member-1')) {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Cannot demote the last OrgAdmin' }),
        });
        return;
      }

      await route.abort();
    });

    await loginAs(page, 'OrgAdmin');
    await page.goto('/employer/team');

    const desktopTable = page.getByRole('table');
    await expect(desktopTable.getByText('Organization Owner')).toBeVisible();
    await page.getByLabel('Member full name').fill('New HR');
    await page.getByLabel('Member email').fill('new.hr@isas.dev');
    await page.getByRole('button', { name: 'Invite member' }).click();

    await expect(desktopTable.getByText('New HR')).toBeVisible();
    expect(inviteBody).toEqual({ email: 'new.hr@isas.dev', fullName: 'New HR' });

    await desktopTable
      .getByRole('row')
      .filter({ hasText: 'New HR' })
      .getByLabel('Change organization role')
      .selectOption('OrgAdmin');
    await expect.poll(() => patchBody).toEqual({ orgRole: 'OrgAdmin' });

    await desktopTable
      .getByRole('row')
      .filter({ hasText: 'Organization Owner' })
      .getByLabel('Change organization role')
      .selectOption('HrMember');
    await expect(page.getByRole('alert')).toContainText(
      'The last organization administrator cannot be demoted.',
    );

    await page.screenshot({
      path: 'test-results/auth-org-members/team-desktop.png',
      fullPage: true,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole('heading', { name: 'Team management' })).toBeVisible();
    await page.screenshot({
      path: 'test-results/auth-org-members/team-mobile.png',
      fullPage: true,
    });
  });

  test('does not expose tenant team management to platform Admin', async ({ page }) => {
    await loginAs(page, 'Admin');
    await page.goto('/employer/team');

    await page.waitForURL(/\/access-denied/);
  });
});
