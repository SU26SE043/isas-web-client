# 0009 Auth Login / Sign-up UI Freeze + Shared Templates

Date: 2026-07-14

## Status

Accepted

## Context

Login and sign-up UI were redesigned (centered tabbed modal / alternate layouts) and then reverted to the previous baseline. Further visual redesigns risk breaking E2E smoke auth, marketing modal parity, and user familiarity without a product requirement.

Across the product, modules (practice, campaigns, payment, employer, admin, etc.) all need the same identity entry. Designing a separate login/sign-up UI per module creates inconsistent UX, duplicated forms, and fragile maintenance.

## Decision

1. **Freeze** the current login and sign-up UI as the default. Do not redesign or replace these surfaces unless product explicitly reopens this decision.
2. **Mandatory reuse:** Login and Sign Up are **system-wide shared auth templates**. Any feature, module, or business flow that requires the user to sign in or sign up **must reuse these templates**. Do **not** design or ship a module-specific login/sign-up UI.

### Shared templates (source of truth)

| Template | Routes / entry | Composition |
| --- | --- | --- |
| Sign in page | `/login` | `AuthLayout` → `AuthCard` + `LoginForm` |
| Sign up page | `/register` | `AuthLayout` → `AuthCard` + `RegisterForm` |
| Marketing auth modal | Header / guest CTAs | Split-panel `AuthModal` with `AuthOverlay` + `SignInForm` / `SignUpForm` / `ForgotPasswordForm` |

### How other modules must integrate

| Need | Required approach |
| --- | --- |
| Protect a route / feature | Redirect to `/login` (preserve `from` return path). Use existing auth guards / `AuthProvider`. |
| Prompt guest to register | Link or navigate to `/register`, or open shared `AuthModal` where marketing already uses it. |
| Deep-link after auth | Pass return URL / query via existing auth redirect helpers — do not clone forms. |
| Employer SSO / MFA / verify / reset | Use existing auth routes (`/mfa`, `/verify-email`, forgot/reset pages). Do not invent parallel screens inside a domain feature. |

### Out of scope for redesign

- Layout shell (`AuthCard` centered card, BrandLogo, title, description, footer link).
- Modal chrome (dual-panel overlay slide between sign-in and sign-up).
- Form fields and primary CTAs as they exist today (behavior/API wiring may still change).

### Still allowed without reopening this decision

- Copy / i18n (`vi` / `en`) when keys already exist or parity is maintained.
- Validation messages, lockout, MFA, email-verify gate, and API error handling.
- Bug fixes that restore the frozen baseline.
- Accessibility and security fixes that do not change overall layout language.
- New **call sites** (links, redirects, open-modal) that still land on the shared templates.

### Explicitly forbidden

- Per-module login/register pages under `src/features/<module>/`.
- Duplicate forms styled “just for practice / campaign / payment”.
- Alternate auth cards that fork `AuthCard` / `LoginForm` / `RegisterForm` / `AuthModal` visuals.

## Alternatives Considered

1. Keep iterating on auth UI until “perfect” — rejected; churn without product ask.
2. Force pages and modal into a single shared redesign — rejected; revert already restored distinct page vs modal patterns.
3. Allow each module its own auth chrome — rejected; breaks consistency and multiplies maintenance.

## Consequences

Positive:

- Agents and contributors treat auth login/sign-up as stable, **shared** UI.
- E2E smoke (`auth-login.spec.ts`) and US-003 stay aligned with a known layout.
- New features wire auth via redirect/`AuthModal` only.

Tradeoffs:

- Visual improvements to auth entry require an explicit product decision to supersede this record.

## Follow-Up

- Document freeze + reuse rule in `docs/product/auth-profile.md` and `docs/UI_GUIDE.md`.
- Point US-003 to this decision.
- Keep `AGENTS.md` aligned so agents do not invent module-local auth screens.
