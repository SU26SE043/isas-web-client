# Organization Onboarding

Frontend contract for Phase 9: employer workspace activation.

## Scope

Phase 9 covers the first B2B tenant surfaces:

- `/employer/dashboard` for tenant overview and onboarding state.
- `/employer/company` for company profile create/read/update.
- `/employer/company/verify` for verification document submission.
- Employer dashboard navigation for HR and Organize roles.

Out of scope for this phase: campaign CRUD, invite sending, candidate pipeline, ranking, analytics, billing, and admin approval operations.

## BRD Trace

- Screens: `SCR-EMP-052`, `SCR-EMP-053`, `SCR-EMP-054`.
- Functional requirements: `FR-060` to `FR-064`.
- User flows: `UF-101`, `UF-102`.
- Rules: `BRL-052` corporate email requirement, `VAL-032` secure website URL, `VAL-033` tax identifier capture.
- Roles: HR can access employer workspace; Organize can manage company profile and verification.

## UI Contract

Employer dashboard shows:

- Company profile completeness.
- Verification status.
- Campaign readiness placeholders.
- Recent onboarding activity.
- Calls to complete company profile and submit verification.

Company profile form captures:

- Company name, legal name, corporate email domain, website, industry, size, country, city, tax identifier, and description.
- Corporate email domain cannot be a public email domain.
- Website must use `https://`.

Verification page captures:

- Document type.
- Registration number.
- Issuing country.
- Document upload control.
- Authorized representative attestation.
- Pending/rejected/verified status messaging.

## Data Contract

Until backend contracts are available, the client uses a mock `EmployerService` with local state:

- `getWorkspace()`
- `saveCompanyProfile(input)`
- `submitVerification(input)`

The mock keeps tenant-scoped data in `sessionStorage` and models the post-submit status as `pending`. Verification forms lock while status is `pending` or `verified`; `rejected` allows resubmit with reviewer note display.

## Phase 9 coverage (FS-130–133)

- **FS-130:** `EmployerDashboardPage` — metrics, readiness steps, activity feed, Organize-only onboarding CTAs.
- **FS-131:** `CompanyProfilePage` + `CompanyProfileForm` — BRL-052 domain, VAL-032 HTTPS, VAL-033 tax ID; Organize/Admin only.
- **FS-132:** `CompanyVerificationPage` + `VerificationUploadForm` — document upload, attestation, pending lock, rejected resubmit.
- **FS-133:** `EmployerDashboardLayout` — role-filtered sidebar; `/enterprise/*` subpaths redirect to `/employer/*` (public marketing remains at `/enterprise`).

## Validation

Required local gates:

- `npm run check:ui-size`
- `npm run check:i18n`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`

Visible UI verification must include desktop and mobile screenshots for dashboard, company profile, and verification.
