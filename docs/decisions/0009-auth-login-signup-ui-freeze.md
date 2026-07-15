# 0009 Auth Login / Sign-up UI Freeze + Shared Templates

Date: 2026-07-14

## Status

Accepted (amended 2026-07-14 — page AuthCard login/register removed)

## Context

Login and sign-up UI were redesigned (centered tabbed modal / alternate layouts) and then reverted to the previous baseline. Further visual redesigns risk breaking E2E smoke auth, marketing modal parity, and user familiarity without a product requirement.

Across the product, modules (practice, campaigns, payment, employer, admin, etc.) all need the same identity entry. Designing a separate login/sign-up UI per module creates inconsistent UX, duplicated forms, and fragile maintenance.

Product decision (2026-07-14): remove the centered AuthCard **Login** / **Register** pages. Sign-in and sign-up entry is **only** the shared split-panel `AuthModal`. Deep-links `/login` and `/register` redirect to the homepage with `?auth=login|signup` and open that modal.

## Decision

1. **Freeze** the AuthModal login and sign-up UI as the default. Do not redesign or replace this surface unless product explicitly reopens this decision.
2. **Mandatory reuse:** Login and Sign Up are **system-wide shared auth templates** via `AuthModal`. Any feature, module, or business flow that requires the user to sign in or sign up **must reuse this modal** (or the `/login` / `/register` deep-links that open it). Do **not** design or ship a module-specific login/sign-up UI.

### Shared templates (source of truth)

| Template | Routes / entry | Composition |
| --- | --- | --- |
| Sign in / Sign up | Header / guest CTAs; `/login` → `/?auth=login`; `/register` → `/?auth=signup` | Split-panel `AuthModal` with `AuthOverlay` + `SignInForm` / `SignUpForm` / `ForgotPasswordForm` |
| Utility auth pages (keep AuthCard) | `/forgot-password`, `/reset-password`, `/mfa`, `/verify-email`, session/lock/access pages | `AuthLayout` → `AuthCard` |

### How other modules must integrate

| Need | Required approach |
| --- | --- |
| Protect a route / feature | Redirect to `/login` (preserves `from`; redirects to homepage AuthModal). Use existing auth guards / `AuthProvider`. |
| Prompt guest to register | Open shared `AuthModal` (`openAuthModal('signup')`) or navigate to `/register`. |
| Deep-link after auth | Pass return URL via location state — SignInForm honors `from`. |
| Employer SSO / MFA / verify / reset | Use existing auth routes (`/mfa`, `/verify-email`, forgot/reset pages). Do not invent parallel screens inside a domain feature. |

### Out of scope for redesign

- Modal chrome (dual-panel overlay slide between sign-in and sign-up).
- Form fields and primary CTAs as they exist today (behavior/API wiring may still change).

### Still allowed without reopening this decision

- Copy / i18n (`vi` / `en`) when keys already exist or parity is maintained.
- Validation messages, lockout, MFA, email-verify gate, and API error handling.
- Bug fixes that restore the frozen baseline.
- Accessibility and security fixes that do not change overall layout language.
- New **call sites** (links, redirects, open-modal) that still land on the shared AuthModal.

### Explicitly forbidden

- Per-module login/register pages under `src/features/<module>/`.
- Duplicate forms styled “just for practice / campaign / payment”.
- Recreating the deleted AuthCard Login/Register pages.

## Alternatives Considered

1. Keep iterating on auth UI until “perfect” — rejected; churn without product ask.
2. Keep both AuthCard pages and AuthModal — rejected by product; pages removed.
3. Allow each module its own auth chrome — rejected; breaks consistency and multiplies maintenance.

## Consequences

Positive:

- One sign-in/sign-up surface (`AuthModal`) across marketing and deep-links.
- Agents and contributors treat auth entry as stable and shared.

Tradeoffs:

- E2E and docs must target the modal (`role=dialog`) instead of AuthCard pages.
- Visual improvements to auth entry require an explicit product decision to supersede this record.

## Follow-Up

- Keep `docs/product/auth-profile.md` and `docs/UI_GUIDE.md` aligned with AuthModal-only entry.
- Point US-003 to this decision.
