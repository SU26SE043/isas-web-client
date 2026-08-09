import { expect, test } from '@playwright/test';

test.describe('Google OAuth one-time code flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem('language', 'en');
    });
  });

  test('starts OAuth with a browser GET and a frontend callback returnUrl', async ({ page }) => {
    let initiationCount = 0;

    await page.route('**/api/v1/auth/login-google?*', async (route) => {
      initiationCount += 1;
      const request = route.request();
      const requestUrl = new URL(request.url());

      expect(request.method()).toBe('GET');
      expect(requestUrl.searchParams.get('returnUrl')).toBe('/auth/google/callback');
      const callbackUrl = `${new URL(page.url()).origin}/auth/google/callback?error=login_failed`;

      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!doctype html>
          <html>
            <head><meta charset="utf-8"></head>
            <body>
              <script>
                window.location.replace(${JSON.stringify(callbackUrl)});
              </script>
            </body>
          </html>`,
      });
    });

    await page.goto('/login');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /continue with google/i }).click();

    await page.waitForURL(/\/auth\/google\/callback\?error=login_failed/);
    expect(initiationCount).toBe(1);
  });

  test('exchanges the callback code once and redirects by returned user role', async ({ page }) => {
    let exchangeCount = 0;

    await page.route('**/api/v1/auth/google/exchange', async (route) => {
      exchangeCount += 1;
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toEqual({ code: 'one-time-code' });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'google-access',
          refreshToken: 'google-refresh',
          expiresAt: '2099-12-31T23:59:59.000Z',
        }),
      });
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'google-candidate',
          fullName: 'Google Candidate',
          email: 'google@isas.dev',
          role: 'Candidate',
          location: '',
          title: '',
          createdAt: '2026-07-28T00:00:00.000Z',
        }),
      });
    });

    await page.goto('/auth/google/callback?code=one-time-code');

    await page.waitForURL(/\/candidate\/dashboard/);
    expect(exchangeCount).toBe(1);
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('accessToken')))
      .toBe('google-access');
    await expect(page).not.toHaveURL(/code=/);
  });

  test('shows the suspended-account reason without attempting an exchange', async ({ page }) => {
    let exchangeCount = 0;
    await page.route('**/api/v1/auth/google/exchange', async (route) => {
      exchangeCount += 1;
      await route.abort();
    });

    await page.goto('/auth/google/callback?reason=account_suspended');

    await expect(page.getByRole('heading', { name: /google sign-in failed/i })).toBeVisible();
    await expect(page.getByText(/account has been suspended/i)).toBeVisible();
    expect(exchangeCount).toBe(0);
  });

  test('maps an invalid, expired, or reused exchange code to one stable error', async ({ page }) => {
    await page.route('**/api/v1/auth/google/exchange', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid or expired code' }),
      });
    });

    await page.goto('/auth/google/callback?code=expired-code');

    await expect(page.getByRole('heading', { name: /google sign-in failed/i })).toBeVisible();
    await expect(page.getByText(/invalid, expired, or has already been used/i)).toBeVisible();
  });

  test('does not accept legacy access and refresh tokens from the URL', async ({ page }) => {
    await page.goto('/?accessToken=leaked-access&refreshToken=leaked-refresh');

    await expect
      .poll(() =>
        page.evaluate(() => ({
          accessToken: window.localStorage.getItem('accessToken'),
          refreshToken: window.localStorage.getItem('refreshToken'),
        })),
      )
      .toEqual({ accessToken: null, refreshToken: null });
  });
});
