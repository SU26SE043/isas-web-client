# 0012. Google OAuth One-Time Code Exchange

- **Date:** 2026-07-28
- **Status:** Accepted

## Context

The previous frontend callback handling accepted `accessToken`, `refreshToken`,
and `expiresAt` directly from URL query parameters after Google sign-in. Tokens
in a URL can leak through browser history, logs, screenshots, and referrer
headers.

The backend contract now redirects the browser callback to the frontend with a
short-lived, single-use `code`. The frontend exchanges that code for the normal
`AuthResponse`.

## Decision

1. Start Google sign-in with a browser navigation to
   `GET /api/v1/auth/login-google`, including the frontend callback in
   `returnUrl`.
2. Treat `GET /api/v1/auth/login-google-callback` as a backend-owned browser
   callback. It redirects to the frontend with either `code` or `reason`; the
   frontend does not call it with XHR.
3. Exchange `code` through public
   `POST /api/v1/auth/google/exchange` and require the complete response:
   `accessToken`, `refreshToken`, and `expiresAt`.
4. Never read or persist access or refresh tokens from URL query parameters.
5. Map callback reasons (`remote_error`, `no_login_info`,
   `account_suspended`, and `login_failed`) to stable bilingual UI. A reason
   callback must not trigger a code exchange.

## Alternatives considered

- **Return tokens in the redirect URL:** rejected because it exposes
  credentials to URL-based storage and telemetry.
- **Call the Google login endpoint through XHR:** rejected because the endpoint
  returns an OAuth challenge redirect, not JSON.
- **Call the backend Google callback from the SPA:** rejected because the
  identity provider owns that browser redirect step.

## Consequences

- Authentication tokens are no longer transported in the callback URL.
- The callback page must exchange the code promptly because it is single-use
  and expires after about 60 seconds.
- The frontend needs a dedicated public callback route and deterministic error
  states.
- Automated tests can verify the redirect contract and exchange flow, while a
  live Google-provider check remains a staging verification responsibility.
