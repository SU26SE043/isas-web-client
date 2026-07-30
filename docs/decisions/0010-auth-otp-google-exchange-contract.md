# 0010 Auth OTP and Google Exchange Contract

Date: 2026-07-22

## Status

Accepted

## Context

The frontend previously reset passwords with either an email-only payload or a legacy URL token,
and expected Google callbacks to expose access and refresh tokens in the browser URL. The Auth API
now defines an OTP-bound reset and a one-time Google exchange code. Authenticated password changes
also require the current password instead of reusing the public OTP flow.

## Decision

- Keep the six-digit OTP after successful verification and send `{ email, otp, newPassword }` to
  `POST /api/v1/auth/reset-password` within the verification window.
- Treat forgot-password, verify-otp, reset-password, and Google exchange as public requests that
  never attach Bearer credentials or start the refresh loop.
- Redirect Google login to `/auth/google/callback?code=...`, exchange the code once through
  `POST /api/v1/auth/google/exchange`, then store the returned session.
- Use authenticated `POST /api/v1/auth/change-password` with `{ oldPassword, newPassword }` for
  profile password changes.
- Retain `/reset-password/:token` only as a compatibility redirect to `/forgot-password`; it no
  longer submits the unsupported legacy token payload.

## Alternatives Considered

1. Continue accepting tokens directly in the callback URL. Rejected because it conflicts with the
   one-time exchange contract and exposes credentials in browser history.
2. Reuse forgot-password OTP from the authenticated profile. Rejected because the API provides a
   dedicated current-password endpoint.

## Consequences

Positive:

- Password reset is bound to the exact verified OTP.
- Google tokens are returned only from a POST exchange and are not placed in the callback URL.
- Profile password changes require proof of the existing password.

Tradeoffs:

- Legacy email-link reset URLs restart the OTP flow.
- The frontend still enforces its existing 12-character complexity policy, which is stricter than
  the API minimum of six characters.

## Follow-Up

- Add backend-integrated E2E coverage when an Auth API test environment is available.
