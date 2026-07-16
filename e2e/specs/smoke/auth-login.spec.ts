import { test, expect } from '@playwright/test';

async function mockLoginApi(
  page: import('@playwright/test').Page,
  options: { status?: number; body?: object } = {},
) {
  const { status = 200, body } = options;

  await page.unroute('**/api/v1/auth/login').catch(() => undefined);
  await page.unroute('**/api/v1/auth/me').catch(() => undefined);

  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(
        body ??
          (status === 200
            ? {
                accessToken: 'e2e-access-candidate',
                refreshToken: 'e2e-refresh-candidate',
                expiresAt: '2026-07-12T12:00:00.000Z',
              }
            : { message: 'Invalid email or password' }),
      ),
    });
  });

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'e2e-candidate',
        fullName: 'E2E Candidate',
        email: 'candidate@isas.dev',
        title: 'Frontend Candidate',
        role: 'Candidate',
        location: 'Ho Chi Minh City',
        createdAt: '2026-07-12T00:00:00.000Z',
      }),
    });
  });
}

async function openAuthDialog(page: import('@playwright/test').Page, path: '/login' | '/register') {
  await page.goto(path);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe('auth login smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('language', 'en');
    });
  });

  test('successful login redirects candidate to dashboard', async ({ page }) => {
    await mockLoginApi(page);
    const dialog = await openAuthDialog(page, '/login');

    await expect(dialog.getByRole('heading', { level: 1, name: /^Sign in$/i })).toBeVisible();
    await dialog.getByLabel(/e-mail/i).fill('candidate@isas.dev');
    await dialog.getByLabel(/password/i).fill('Password123!Secure');
    await dialog.getByRole('button', { name: /^Sign in$/i }).click();

    await page.waitForURL(/\/candidate\/dashboard/);
    await expect(page).toHaveURL(/\/candidate\/dashboard/);
  });

  test('invalid credentials show error message', async ({ page }) => {
    await mockLoginApi(page, { status: 401, body: { message: 'Invalid email or password' } });
    const dialog = await openAuthDialog(page, '/login');

    await dialog.getByLabel(/e-mail/i).fill('wrong@isas.dev');
    await dialog.getByLabel(/password/i).fill('wrong-password');
    await dialog.getByRole('button', { name: /^Sign in$/i }).click();

    await expect(dialog.getByText(/email or password is incorrect/i)).toBeVisible();
    await expect(page).toHaveURL(/auth=login/);
  });

  test('account lockout redirects to locked page', async ({ page }) => {
    await page.unroute('**/api/v1/auth/login').catch(() => undefined);
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 423,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Account locked due to too many attempts' }),
      });
    });

    const dialog = await openAuthDialog(page, '/login');
    await dialog.getByLabel(/e-mail/i).fill('locked@isas.dev');
    await dialog.getByLabel(/password/i).fill('Password123!Secure');
    await dialog.getByRole('button', { name: /^Sign in$/i }).click();

    await page.waitForURL(/\/account-locked/);
    await expect(page.getByRole('heading', { level: 1, name: /account locked/i })).toBeVisible();
  });

  test('register signs in candidate when API returns tokens', async ({ page }) => {
    await page.unroute('**/api/v1/auth/register').catch(() => undefined);
    await page.unroute('**/api/v1/auth/me').catch(() => undefined);

    await page.route('**/api/v1/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'e2e-access-new',
          refreshToken: 'e2e-refresh-new',
          expiresAt: '2026-07-12T12:00:00.000Z',
        }),
      });
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new-user',
          fullName: 'New User',
          email: 'new@isas.dev',
          title: '',
          role: 'Candidate',
          location: '',
          createdAt: '2026-07-12T00:00:00.000Z',
        }),
      });
    });

    const dialog = await openAuthDialog(page, '/register');
    await expect(dialog.getByRole('heading', { level: 1, name: /Create account/i })).toBeVisible();
    await dialog.getByLabel(/full name/i).fill('New User');
    await dialog.getByLabel(/e-mail/i).fill('new@isas.dev');
    await dialog.getByLabel(/^password$/i).fill('Password123!Secure');
    await dialog.getByRole('button', { name: /^Sign up$/i }).click();

    await page.waitForURL(/\/candidate\/dashboard/);
    await expect(page).toHaveURL(/\/candidate\/dashboard/);
  });
});
