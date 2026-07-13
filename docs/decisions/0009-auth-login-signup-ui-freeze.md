# 0009 Auth Login / Sign-up UI Freeze

Date: 2026-07-14

## Status

Accepted

## Context

Login and sign-up UI were redesigned (centered tabbed modal / alternate layouts) and then reverted to the previous baseline. Further visual redesigns risk breaking E2E smoke auth, marketing modal parity, and user familiarity without a product requirement.

## Decision

Freeze the **current** login and sign-up UI as the default. Do not redesign or replace these surfaces unless product explicitly reopens this decision.

### Locked surfaces

| Surface | Route / entry | Required composition |
| --- | --- | --- |
| Sign in page | `/login` | `AuthLayout` → `AuthCard` + `LoginForm` |
| Sign up page | `/register` | `AuthLayout` → `AuthCard` + `RegisterForm` |
| Marketing auth modal | Header / guest CTAs | Split-panel `AuthModal` with `AuthOverlay` + `SignInForm` / `SignUpForm` / `ForgotPasswordForm` |

### Out of scope for redesign

- Layout shell (`AuthCard` centered card, BrandLogo, title, description, footer link).
- Modal chrome (dual-panel overlay slide between sign-in and sign-up).
- Form fields and primary CTAs as they exist today (behavior/API wiring may still change).

### Still allowed without reopening this decision

- Copy / i18n (`vi` / `en`) when keys already exist or parity is maintained.
- Validation messages, lockout, MFA, email-verify gate, and API error handling.
- Bug fixes that restore the frozen baseline.
- Accessibility and security fixes that do not change overall layout language.

## Alternatives Considered

1. Keep iterating on auth UI until “perfect” — rejected; churn without product ask.
2. Force pages and modal into a single shared redesign — rejected; revert already restored distinct page vs modal patterns.

## Consequences

Positive:

- Agents and contributors treat auth login/sign-up as stable UI.
- E2E smoke (`auth-login.spec.ts`) and US-003 stay aligned with a known layout.

Tradeoffs:

- Visual improvements to auth entry require an explicit product decision to supersede this record.

## Follow-Up

- Document freeze in `docs/product/auth-profile.md` and `docs/UI_GUIDE.md`.
- Point US-003 to this decision.
