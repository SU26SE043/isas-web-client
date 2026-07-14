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
| `/login` | SCR-AUT-002 | Implemented — `LoginPage`, `AuthCard` + `LoginForm` (**UI frozen**) |
| `/register` | SCR-AUT-003 | Implemented — `RegisterPage`, `AuthCard` + `RegisterForm` (**UI frozen**) |
| `/verify-email` | SCR-AUT-004 | Implemented — token query + resend |
| `/forgot-password` | SCR-AUT-005 | Implemented — OTP flow |
| `/forgot-password/verify` | SCR-AUT-005 | Implemented — OTP step |
| `/reset-password` | SCR-AUT-006 | Implemented — post-OTP reset |
| `/reset-password/:token` | SCR-AUT-006 | Implemented — email link reset |
| `/mfa` | SCR-AUT-007 | Implemented — `MFAChallenge` |
| `/session-expired` | SCR-AUT-008 | Implemented |
| `/access-denied` | SCR-AUT-009 | Implemented |
| `/account-locked` | SCR-AUT-010 | Implemented |
| Auth modal (overlay) | SCR-AUT-002–005 | Implemented — split-panel `AuthModal` + `AuthOverlay` (**UI frozen**) |
| `/profile` | SCR-CAN-013 | Partial |
| Session timeout modal | SHR-100 | Implemented — `SessionTimeoutModal` |

## UI freeze (login / sign-up) — shared system templates

**Status:** Locked as of 2026-07-14. Decision: [`docs/decisions/0009-auth-login-signup-ui-freeze.md`](../decisions/0009-auth-login-signup-ui-freeze.md).

Login and Sign Up are **system-wide shared auth templates**. Any feature, module, or business flow that needs sign-in or sign-up **must reuse these templates** — do not design or ship a module-specific login/register UI.

The current login and sign-up UI is also the **frozen product default**. Do not change layout, chrome, or visual language unless product explicitly supersedes decision 0009.

| Surface | Baseline to keep |
| --- | --- |
| `/login` | `AuthLayout` → centered `AuthCard` (BrandLogo, title, subtitle, footer link to register) + `LoginForm` |
| `/register` | Same `AuthCard` shell + `RegisterForm` + footer link to login |
| Marketing modal | Split-panel `AuthModal`: form pane + sliding `AuthOverlay` welcome/CTA; `SignInForm` / `SignUpForm` / `ForgotPasswordForm` |

**How other modules integrate:** redirect unauthenticated users to `/login` (with return `from`) for route guards; marketing header / mobile nav / guest CTAs open the shared split-panel `AuthModal`. Wire API / guards only — never fork forms under `src/features/<module>/`.

**Not allowed without reopening 0009:** tabbed single-panel redesigns, different page shells for login/register, merging pages into the modal layout (or the reverse), per-module auth screens, or other “refresh” redesigns.

**Allowed:** i18n copy, validation/error states, MFA / lockout / verify-email gates, API wiring, a11y and security bugfixes that keep the frozen composition, and new call sites that still land on these templates.

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
