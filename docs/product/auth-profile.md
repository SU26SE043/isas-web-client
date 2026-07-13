# Auth & Profile

BRD: `BRD/User_Roles_and_Permissions.md`, `BRD/Security_Requirements.md`, FR-001–003.

## Roles (BRD ROL-001 … ROL-005)

| Role | API value | Client status |
| --- | --- | --- |
| Guest | `guest` | Unauthenticated (no `user.role`) |
| Candidate | `candidate` | B2C: CV, practice, profile |
| HR | `hr` | B2B: campaigns (future) |
| Organize | `organize` | B2B: org admin, billing (future) |
| Admin | `admin` | Platform admin (future) |

Legacy API values (`Candidate`, `interviewer`) are normalized in `parseUser()`.
`interviewer` maps to `hr` per BRD (no separate Interviewer role).

## Surfaces (Phase 3 — M01)

| Route | Screen ID | Status |
| --- | --- | --- |
| `/login` | SCR-AUT-002 | Implemented — `LoginPage`, `LoginForm` |
| `/register` | SCR-AUT-003 | Implemented — `RegisterPage`, `RegisterForm` |
| `/verify-email` | SCR-AUT-004 | Implemented — token query + resend |
| `/forgot-password` | SCR-AUT-005 | Implemented — OTP flow |
| `/forgot-password/verify` | SCR-AUT-005 | Implemented — OTP step |
| `/reset-password` | SCR-AUT-006 | Implemented — post-OTP reset |
| `/reset-password/:token` | SCR-AUT-006 | Implemented — email link reset |
| `/mfa` | SCR-AUT-007 | Implemented — `MFAChallenge` |
| `/session-expired` | SCR-AUT-008 | Implemented |
| `/access-denied` | SCR-AUT-009 | Implemented |
| `/account-locked` | SCR-AUT-010 | Implemented |
| Auth modal (overlay) | SCR-AUT-002–005 | Implemented — shares validation with pages |
| `/profile` | SCR-CAN-013 | Partial |
| Session timeout modal | SHR-100 | Implemented — `SessionTimeoutModal` |

## Behavior contract

- Unauthenticated users hitting protected routes → redirect to `/login`.
- Register → `/verify-email?email=…` (BR-01 email verify gate).
- Login handles MFA redirect, account lockout, `emailVerificationRequired`.
- Logout clears session store and returns to home.
- Password policy: 12+ chars with complexity (`passwordPolicy.ts`, SEC-012).
- Enterprise SSO via `SSOButton` when `VITE_ENABLE_ENTERPRISE_SSO=true`.
- Profile shows account info, security status, password change modal.
- Role badges use semantic colors per `docs/UI_GUIDE.md`.

## Shared infrastructure

- `useAuth`, `AuthProvider`, `sessionManager` (idle + absolute timeout).
- JWT stored in `localStorage` via `authTokenStorage` (refresh via API interceptor).

## API (via Gateway)

Auth service endpoints — see `src/features/auth/services/authEndpoints.ts`.

## E2E

- `e2e/specs/smoke/auth-login.spec.ts` — login, lockout, register → verify email.

## Open gaps

- HttpOnly cookie token storage (plan vs current localStorage) — pending backend contract.
- Enterprise SSO backend (`/login-sso`) — UI gated; requires tenant IdP config (P9).
- `UserRole` duplicate `ProtectedRoute` deprecation cleanup — low priority.
