# US-003 Auth Modal + Profile

## Status

in_progress

## Lane

high-risk

## Product Contract

Users can register, sign in, reset password via dedicated auth pages (`/login`, `/register`, …) and marketing auth modal. Authenticated users manage profile at `/profile` with account info, security cards, password change.

## Relevant Product Docs

- `docs/product/auth-profile.md`

## BRD References

- FR-001–003
- `BRD/User_Roles_and_Permissions.md`
- `BRD/Security_Requirements.md`
- SCR-AUT-002–010, SCR-CAN-013

## Acceptance Criteria

- [x] Auth pages + modal: sign in, sign up, forgot password flows with validation errors.
- [x] Password recovery calls the public forgot/verify/reset endpoints and retains the verified OTP in the reset request.
- [x] Register redirects to `/verify-email`; login handles MFA, lockout, email verification gate.
- [x] JWT session persisted; logout clears state; session timeout modal.
- [x] `/profile` shows user info; change password modal works.
- [x] Protected routes redirect unauthenticated users.
- [x] E2E smoke: `e2e/specs/smoke/auth-login.spec.ts`.
- [x] Public Candidate and Organization registration use `/register` and `/register-org`, persist returned tokens, load `/me`, and redirect by role.
- [x] Login distinguishes invalid credentials, account lockout, and banned-account `403` without creating a session.
- [x] Refresh parses and persists the complete rotated token trio; `401` clears the revoked session.
- [x] Google OAuth uses browser redirects and a one-time callback code exchange; tokens are never accepted from URL query parameters.
- [x] Google callback reasons, including suspended accounts, render stable bilingual feedback.
- [x] Forgot-password email submit calls public `POST /api/v1/auth/forgot-password` with `{ email }`, advances only after the exact success response, and preserves `400 "User not found"` for form error handling.
- [x] Verify OTP is public, validates the exact success contract, and retains the submitted OTP for reset.
- [x] Reset password sends `{ email, otp, newPassword }`; weak-password failures do not clear the OTP in UI state.
- [x] Google callback exchanges a one-time `code` for tokens before establishing the session.
- [x] Authenticated profile password change sends `{ oldPassword, newPassword }` and expects `204`.

## Design Notes

- High-risk: auth, authorization, public session contract.
- Shared components: `LoginForm`, `RegisterForm`, `MFAChallenge`, `SSOButton`, `PasswordStrengthMeter`.
- Enterprise SSO gated by `VITE_ENABLE_ENTERPRISE_SSO=true`.
- **UI freeze:** `/login`, `/register`, and marketing `AuthModal` keep the current default layout — see decision [`0009-auth-login-signup-ui-freeze`](../../../decisions/0009-auth-login-signup-ui-freeze.md) and `docs/product/auth-profile.md`. Do not redesign unless that decision is superseded.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `src/features/auth/tests/AuthModal.test.tsx` |
| Unit | `src/features/auth/services/authService.forgotPassword.test.ts` |
| Unit | `src/features/auth/services/authService.passwordFlows.test.ts` |
| Unit | `src/features/auth/tests/ChangePasswordModal.test.tsx` |
| E2E | `e2e/specs/smoke/auth-login.spec.ts` |
| Platform | `npm run build` |

## Evidence

- `src/features/auth/**`
- `src/routes/groups/authRoutes.tsx`
- `e2e/specs/smoke/auth-login.spec.ts`
- `src/features/auth/utils/authErrors.test.ts`
- `src/features/auth/services/authService.tokens.test.ts`
- `e2e/specs/smoke/auth-google.spec.ts`
- `docs/decisions/0010-auth-otp-google-exchange-contract.md`
