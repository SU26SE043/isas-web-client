import { expect, test } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

const organization = {
  id: 'org-1',
  name: 'ISAS Labs',
  taxCode: 'TAX-001',
  createdAt: '2026-07-20T00:00:00.000Z',
  memberCount: 3,
};

test.describe('organization profile Auth APIs', () => {
  test('lets OrgAdmin read and update organization information', async ({ page }) => {
    let putBody: unknown;
    let currentOrganization = { ...organization };

    await page.route('**/api/v1/auth/org', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(currentOrganization),
        });
        return;
      }
      if (request.method() === 'PUT') {
        putBody = request.postDataJSON();
        currentOrganization = { ...currentOrganization, ...(putBody as object) };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(currentOrganization),
        });
        return;
      }
      await route.abort();
    });

    await loginAs(page, 'OrgAdmin');
    await page.goto('/employer/settings');

    await expect(page.getByRole('heading', { name: 'Organization information' })).toBeVisible();
    await expect(page.getByLabel('Organization name')).toHaveValue('ISAS Labs');
    await expect(page.getByText('3', { exact: true })).toBeVisible();

    await page.getByLabel('Organization name').fill('ISAS Vietnam');
    await page.getByLabel('Tax code').fill('TAX-002');
    await page.getByRole('button', { name: 'Save organization' }).click();

    await expect(page.getByRole('status')).toContainText('Organization information updated.');
    expect(putBody).toEqual({ name: 'ISAS Vietnam', taxCode: 'TAX-002' });

    await page.screenshot({
      path: 'test-results/auth-org-profile/orgadmin-desktop.png',
      fullPage: true,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByLabel('Organization name')).toHaveValue('ISAS Vietnam');
    await page.screenshot({
      path: 'test-results/auth-org-profile/orgadmin-mobile.png',
      fullPage: true,
    });
  });

  test('lets HrMember view organization information without update controls', async ({ page }) => {
    let putCalls = 0;
    await page.route('**/api/v1/auth/org', async (route) => {
      if (route.request().method() === 'PUT') putCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(organization),
      });
    });

    await loginAs(page, 'HrMember');
    await page.goto('/employer/settings');

    await expect(page.getByLabel('Organization name')).toBeDisabled();
    await expect(page.getByText('Only OrgAdmin can edit it.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save organization' })).toHaveCount(0);
    expect(putCalls).toBe(0);
  });

  test('surfaces a missing organization claim without exposing an editor', async ({ page }) => {
    await page.route('**/api/v1/auth/org', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Missing org_id' }),
      });
    });

    await loginAs(page, 'OrgAdmin');
    await page.goto('/employer/settings');

    await expect(page.getByRole('alert')).toContainText(
      'Your session does not include an organization.',
    );
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('distinguishes organization not found from a missing claim', async ({ page }) => {
    await page.route('**/api/v1/auth/org', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Organization not found' }),
      });
    });

    await loginAs(page, 'HrMember');
    await page.goto('/employer/settings');

    await expect(page.getByRole('alert')).toContainText('Organization not found.');
  });

  test('keeps the OrgAdmin draft when an update is forbidden or missing', async ({ page }) => {
    let updateAttempts = 0;
    await page.route('**/api/v1/auth/org', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(organization),
        });
        return;
      }
      updateAttempts += 1;
      await route.fulfill({
        status: updateAttempts === 1 ? 403 : 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: updateAttempts === 1 ? 'Forbidden' : 'Not found' }),
      });
    });

    await loginAs(page, 'OrgAdmin');
    await page.goto('/employer/settings');
    const nameInput = page.getByLabel('Organization name');
    await nameInput.fill('Unsaved organization');
    await page.getByRole('button', { name: 'Save organization' }).click();

    await expect(page.getByRole('alert')).toContainText(
      'Only OrgAdmin can update organization information.',
    );
    await expect(nameInput).toHaveValue('Unsaved organization');

    await page.getByRole('button', { name: 'Save organization' }).click();
    await expect(page.getByRole('alert')).toContainText('Organization not found.');
    await expect(nameInput).toHaveValue('Unsaved organization');
  });
});
