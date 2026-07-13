# US-003 Auth Modal + Profile

## Status

implemented

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
- [x] Register redirects to `/verify-email`; login handles MFA, lockout, email verification gate.
- [x] JWT session persisted; logout clears state; session timeout modal.
- [x] `/profile` shows user info; change password modal works.
- [x] Protected routes redirect unauthenticated users.
- [x] E2E smoke: `e2e/specs/smoke/auth-login.spec.ts`.

## Design Notes

- High-risk: auth, authorization, public session contract.
- Shared components: `LoginForm`, `RegisterForm`, `MFAChallenge`, `SSOButton`, `PasswordStrengthMeter`.
- Enterprise SSO gated by `VITE_ENABLE_ENTERPRISE_SSO=true`.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `src/features/auth/tests/AuthModal.test.tsx` |
| E2E | `e2e/specs/smoke/auth-login.spec.ts` |
| Platform | `npm run build` |

## Evidence

- `src/features/auth/**`
- `src/routes/groups/authRoutes.tsx`
- `e2e/specs/smoke/auth-login.spec.ts`
