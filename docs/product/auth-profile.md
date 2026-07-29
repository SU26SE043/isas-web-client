# Auth & Profile

BRD: `BRD/User_Roles_and_Permissions.md`, `BRD/Security_Requirements.md`, FR-001–003.

## Roles

Canonical Auth Identity **values** (PascalCase strings, e.g. `Candidate`). Guest is client-only (unauthenticated). JSON **field names** remain camelCase — see [`api-gateway.md`](./api-gateway.md).

| Role | API value | Scope |
| --- | --- | --- |
| Candidate | `Candidate` | B2C: own interviews, reports, profile, subscription |
| OrgAdmin | `OrgAdmin` | Full control **within one organization** (settings, billing, team, campaigns, analytics) |
| HrMember | `HrMember` | Org recruitment: campaigns, interviews, candidate review, reports — **no** billing/settings/admin management |
| Admin | `Admin` | Platform-wide system administrator (all orgs/users/config) |

`OrgAdmin` ≠ platform `Admin`. Only these Identity role strings are accepted (case-insensitive).
Deleted legacy values (`Employer`, `organize`, `hr`, `interviewer`, …) are **rejected** by `normalizeUserRole()`.

## Surfaces (Phase 3 — M01)

| Route | Screen ID | Status |
| --- | --- | --- |
| `/login` | SCR-AUT-002 | Implemented — redirects to `/?auth=login` + shared `AuthModal` / `SignInForm` (**UI frozen**) |
| `/register` | SCR-AUT-003 | Implemented — redirects to `/?auth=signup` + shared `AuthModal` / `SignUpForm` (**UI frozen**) |
| `/verify-email` | SCR-AUT-004 | Implemented — token query + resend |
| `/forgot-password` | SCR-AUT-005 | Implemented — OTP flow |
| `/forgot-password/verify` | SCR-AUT-005 | Implemented — OTP step |
| `/reset-password` | SCR-AUT-006 | Implemented — post-OTP reset |
| `/reset-password/:token` | SCR-AUT-006 | Implemented — email link reset |
| `/mfa` | SCR-AUT-007 | Implemented — `MFAChallenge` |
| `/session-expired` | SCR-AUT-008 | Implemented |
| `/access-denied` | SCR-AUT-009 | Implemented |
| `/account-locked` | SCR-AUT-010 | Implemented |
| Auth modal (overlay) | SCR-AUT-002–005 | Implemented — split-panel `AuthModal` + `AuthOverlay`; **only the active form panel is mounted** (signin / signup / signup-org / forgot) so accessible names stay unique |
| `/profile` | SCR-CAN-013 | Partial |
| Session timeout modal | SHR-100 | Implemented — `SessionTimeoutModal` |

## UI freeze (login / sign-up) — shared system templates

**Status:** Locked as of 2026-07-14. Decision: [`docs/decisions/0009-auth-login-signup-ui-freeze.md`](../decisions/0009-auth-login-signup-ui-freeze.md).

Login and Sign Up are **system-wide shared auth templates**. Any feature, module, or business flow that needs sign-in or sign-up **must reuse these templates** — do not design or ship a module-specific login/register UI.

The current login and sign-up UI is also the **frozen product default**. Do not change layout, chrome, or visual language unless product explicitly supersedes decision 0009.

| Surface | Baseline to keep |
| --- | --- |
| `/login` | Homepage `?auth=login` → split-panel `AuthModal` (`SignInForm` + `AuthOverlay`) |
| `/register` | Homepage `?auth=signup` → same `AuthModal` (`SignUpForm` + `AuthOverlay`) |
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
- Tokens in `localStorage` via `authTokenStorage`: `accessToken`, `refreshToken`, `expiresAt`.
- User session in Zustand (`auth-storage`).
- Auto refresh: axios interceptor on `401` → `POST /api/v1/auth/refresh` `{ refreshToken }` (public, no Bearer) → parse the full `{ accessToken, refreshToken, expiresAt }` AuthResponse despite the backend DTO name `RefreshTokenResponse` → store new tokens → retry once.
- Refresh failure (401 expired/revoked): clear tokens + user → redirect `/login`.
- Logout: `POST /api/v1/auth/logout` with Bearer + `{ refreshToken }`, then clear local session.
- Google OAuth never puts tokens in the URL: browser `GET /login-google` → backend callback redirects to `/auth/google/callback?code=...` → frontend exchanges the one-time code and removes it through role-aware navigation.

## API (via Gateway)

Auth service endpoints — see `src/features/auth/services/authEndpoints.ts`.

| Action | Path | Auth |
| --- | --- | --- |
| Candidate registration | `POST /api/v1/auth/register` | Public — body `{ email, password, fullName }` → `{ accessToken, refreshToken, expiresAt }`; `409` email exists; `400` validation. API minimum is 6 characters; frontend keeps the stricter SEC-012 12+ complexity policy. |
| Employer + organization registration | `POST /api/v1/auth/register-org` | Public — body `{ email, password, fullName, orgName, taxCode? }` → `{ accessToken, refreshToken, expiresAt }`; creator becomes `OrgAdmin`; `409` email exists. Frontend keeps the stricter SEC-012 password policy. |
| Login | `POST /api/v1/auth/login` | Public — body `{ email, password }` → `{ accessToken, refreshToken, expiresAt }`; `401` invalid/locked; `403` banned account |
| Refresh | `POST /api/v1/auth/refresh` | Public — body `{ refreshToken }` → full AuthResponse `{ accessToken, refreshToken, expiresAt }`; `401` expired/revoked/banned |
| Start Google OAuth | `GET /api/v1/auth/login-google?returnUrl=...` | Public — browser navigation; `302` Google challenge, never XHR/JSON |
| Google backend callback | `GET /api/v1/auth/login-google-callback` | Public — backend/provider route; redirects to FE with one-time `code` or `reason=remote_error \| no_login_info \| account_suspended \| login_failed` |
| Exchange Google code | `POST /api/v1/auth/google/exchange` | Public — body `{ code }` → `{ accessToken, refreshToken, expiresAt }`; `400` invalid/expired/used code |
| Logout | `POST /api/v1/auth/logout` | Bearer + body `{ refreshToken }` |
| Current user | `GET /api/v1/auth/me` | Bearer — `Candidate \| OrgAdmin \| HrMember \| Admin` |
| Update profile | `PUT /api/v1/auth/me` | Bearer — body `{ fullName?, location?, title? }` (`null`/omit keeps current). Response body is a status string; FE must re-fetch `GET /me` and sync store. |
| Invite organization member | `POST /api/v1/auth/org/members` | `OrgAdmin` — body `{ email, fullName }`; creates an `HrMember`; `201`; `409` email exists. |
| List organization members | `GET /api/v1/auth/org/members` | `OrgAdmin` — unpaginated `OrgMemberResponse[]`. |
| Change organization role | `PATCH /api/v1/auth/org/members/{userId}` | `OrgAdmin` — body `{ orgRole: "OrgAdmin" \| "HrMember" }`; `400/403/404/409`, including protection for the final OrgAdmin. |

| Request password-reset OTP | `POST /api/v1/auth/forgot-password` | Public — body `{ email }`; success is `"OTP sent to your email"`. |
| Verify password-reset OTP | `POST /api/v1/auth/verify-otp` | Public — body `{ email, otp }`; success is `"OTP verified, you can reset your password"`. |
| Reset password | `POST /api/v1/auth/reset-password` | Public — body `{ email, otp, newPassword }`; success is `"Password reset successful"`. |

## E2E

- `e2e/specs/smoke/auth-login.spec.ts` — login, lockout, register → authenticated role redirect.
- `e2e/specs/smoke/auth-google.spec.ts` — browser redirect, one-time code exchange, callback reasons, URL-token rejection.

## Open gaps

- HttpOnly cookie token storage (plan vs current localStorage) — pending backend contract.
- Enterprise SSO backend (`/login-sso`) — UI gated; requires tenant IdP config (P9).
- `UserRole` duplicate `ProtectedRoute` deprecation cleanup — low priority.
