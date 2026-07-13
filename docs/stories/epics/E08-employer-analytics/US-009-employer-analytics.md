# US-009 Employer Analytics And Candidate Pipeline

## Status

implemented

## Lane

normal

## Product Contract

HR users can review ranked campaign candidates, inspect employer-only candidate profiles, view AI interview reports, and export analytics from a tenant-scoped dashboard.

## Relevant Product Docs

- `docs/product/employer-analytics.md`
- `docs/product/organization-onboarding.md`
- `docs/product/api-gateway.md`

## BRD References

- SCR-EMP-059, SCR-EMP-060, SCR-EMP-061, SCR-EMP-062
- UF-107, UF-108, UF-110, UF-112
- FR-195-224
- BR-004, BRL-015, BRL-041, BRL-054, BRL-064, BRL-066

## Acceptance Criteria

- `/employer/campaigns/:id/candidates` renders candidate pipeline with product assessment statuses (`invited`, `invite_pending`, `in_progress`, `paused_violation`, `auto_submitted`, `completed`).
- Blind-hiring mode masks candidate PII in the pipeline.
- `/employer/candidates/:id` renders employer-only candidate profile with internal notes.
- `/employer/candidates/:id/report` renders AI interview report, score breakdown, rubric evidence, and manual score override.
- Manual override requires a note of at least 20 characters and is disabled when the report is reviewed/locked.
- `/employer/analytics` renders KPI cards, funnel, score distribution, skill demand, trend summaries, and export controls.
- Export guard blocks row counts above 10,000 and records async email fallback copy.
- All visible UI text is bilingual through `useLanguage().t()`.

## Design Notes

- Use the existing `EmployerDashboardLayout`.
- Keep UI dark monochrome; semantic colors only for status, validation, and charts.
- Use desktop table plus mobile card layout for pipeline.
- Use mock data/service only; live CampaignService/ReportingService integration is deferred.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `npm test` |
| Integration | Pending live Reporting/Campaign API contract; mock service covered by manual flow |
| E2E | `npm run test:e2e`; manual Phase 11 browser flow |
| Platform | `npm run check:ui-size`, `npm run check:i18n`, `npm run typecheck`, `npm run build` |
| Release | Not in this story |

## Evidence

- `npm run check:ui-size` passed.
- `npm run check:i18n` passed.
- `npm run typecheck` passed.
- `npm test` passed: 3 files, 12 tests.
- `npm run build` passed with existing CSS import, `/history-bg.jpg`, chunk-size, and plugin timing warnings.
- `npm run test:e2e` passed: 2 Chromium smoke tests.
- Manual visible UI verification screenshots: `test-results/phase11-ui/01-pipeline-desktop.png`, `02-pipeline-filtered.png`, `03-candidate-profile.png`, `07-report-override-success.png`, `08-analytics-export-success.png`, `06-pipeline-mobile.png`.
