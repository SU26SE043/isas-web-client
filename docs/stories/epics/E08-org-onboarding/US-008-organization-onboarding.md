# US-008 Organization Onboarding Employer Entry

## Status

implemented

## Lane

normal

## Product Contract

HR and Organize users can enter the employer workspace, review onboarding readiness, edit company profile details, and submit company verification.

## Relevant Product Docs

- `docs/product/organization-onboarding.md`
- `docs/product/api-gateway.md`

## BRD References

- SCR-EMP-052, SCR-EMP-053, SCR-EMP-054
- UF-101, UF-102
- FR-060, FR-061, FR-062, FR-063, FR-064
- BRL-052, VAL-032, VAL-033

## Acceptance Criteria

- `/employer/dashboard` renders tenant metrics, verification status, onboarding activity, and next actions.
- `/employer/company` renders a validated company profile form and persists mock edits in the current session.
- `/employer/company/verify` renders verification status, document upload input, attestation checkbox, and submit flow.
- Employer sidebar navigation is available for `/employer/dashboard`, `/employer/company`, and `/employer/company/verify`.
- `/enterprise/*` redirects to the canonical `/employer/*` routes.
- HR and Organize roles can access the routes; other roles receive the existing access denied flow.
- All visible text is bilingual through `useLanguage().t()`.

## Design Notes

- Use dark monochrome surfaces from `docs/UI_GUIDE.md`.
- Use `react-hook-form` and `zod` for forms.
- Keep every UI file under 250 lines.
- API is mock-only for Phase 9; live organization service integration is deferred.

## Validation

When durable proof is ready:
`scripts/bin/harness-cli story update --id US-008 --unit 1 --integration 0 --e2e 1 --platform 1`

| Layer | Expected proof |
| --- | --- |
| Unit | Existing unit suite remains green |
| Integration | Pending live organization API contract |
| E2E | Smoke suite and manual Phase 9 browser flow |
| Platform | Build, i18n, UI-size, typecheck |
| Release | Not in this story |

## Evidence

- `npm run check:ui-size` passed.
- `npm run check:i18n` passed.
- `npm run typecheck` passed.
- `npm test` passed: 3 files, 12 tests.
- `npm run build` passed with existing CSS import, `/history-bg.jpg`, and chunk-size warnings.
- `npm run test:e2e` passed: 2 Chromium smoke tests.
- Playwright Phase 9 flow passed: dashboard, company profile save, verification submit, mobile dashboard.
- Screenshots saved under `test-results/phase9-ui/`.
