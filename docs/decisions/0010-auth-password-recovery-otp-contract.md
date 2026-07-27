# 0010 Auth Password Recovery OTP Contract

Date: 2026-07-27

## Status

Accepted

## Context

The existing password-recovery UI already collects an email, verifies an OTP,
and accepts a new password. The client previously omitted the verified OTP from
the final reset request and treated the three recovery endpoints like
authenticated requests, which did not match the Auth API contract.

## Decision

Password recovery uses three public requests with exact success responses:

1. `POST /api/v1/auth/forgot-password` with `{ email }`.
2. `POST /api/v1/auth/verify-otp` with `{ email, otp }`.
3. `POST /api/v1/auth/reset-password` with `{ email, otp, newPassword }`.

The client retains the submitted OTP only for the duration of the recovery flow
and forwards it to the reset request. This decision changes request wiring only;
the frozen authentication UI remains unchanged.

## Alternatives Considered

1. Reset with `{ email, newPassword }` after verification. Rejected because the
   Auth API requires the verified OTP in the reset request.
2. Introduce a new password-recovery UI. Rejected because decision 0009 freezes
   the shared authentication UI and the existing flow already collects all
   required values.

## Consequences

Positive:

- Public recovery calls cannot enter the access-token refresh loop.
- The reset request matches the backend contract.
- Existing authentication markup, styling, and layout are preserved.

Tradeoffs:

- Exact success-string validation must be updated if the backend response
  contract changes.

## Follow-Up

- Verify the success path against a running Auth API environment.
