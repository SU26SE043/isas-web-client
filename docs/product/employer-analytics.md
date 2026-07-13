# Employer Analytics And Candidate Pipeline

Frontend contract for Phase 11: HR hiring decisions after candidates complete campaign interviews.

Status: **Implemented (mock)** — pipeline uses product statuses (`invited`, `invite_pending`, `in_progress`, `paused_violation`, `auto_submitted`, `completed`); blind hiring, score override, analytics export.

## Scope

Phase 11 covers employer-side candidate review and analytics:

- `/employer/campaigns/:id/candidates` candidate pipeline with search, status filter, sorting, ranking, and bulk export affordance.
- `/employer/candidates/:id` employer candidate profile with candidate summary, masked identity support, internal notes, and stage context.
- `/employer/candidates/:id/report` interview report with score breakdown, rubric evidence, recommendation, and manual score override workflow.
- `/employer/analytics` analytics dashboard with funnel metrics, score distribution, time-to-hire indicators, and CSV/PDF export actions.

Out of scope: campaign CRUD, candidate interview room, employer billing, admin reports, ATS integration, scheduled reports, and live backend integration.

## BRD Trace

- Screens: `SCR-EMP-059`, `SCR-EMP-060`, `SCR-EMP-061`, `SCR-EMP-062`.
- User flows: `UF-107`, `UF-108`, `UF-110`, `UF-112`.
- Functional requirements: `FR-195` to `FR-224` for reporting surfaces.
- Rules: `BR-004` HR notes hidden from Candidate, `BRL-015` PII masking in reports, `BRL-041` bulk export limit, `BRL-054` reviewed scores are locked, `BRL-064` blind hiring masking, `BRL-066` manual score override requires a 20+ character note.

## UI Contract

Candidate pipeline provides:

- Search by candidate identifier, role, stage, and skills.
- Status and score-band filters.
- Sort by rank, score, completion date, and stage.
- Desktop table and mobile cards.
- **Invite resolution indicators:** `invited` (linked registered Candidate), `invite_pending` (email only, not registered yet) per [`product-scope.md`](./product-scope.md) BR-B2B-07–11.
- Blind-hiring display mode that replaces names/emails with anonymized candidate codes.
- Export flow that blocks exports over 10,000 rows and warns that exported PII is masked.

### Pipeline statuses

Product-defined statuses ([`product-scope.md`](./product-scope.md), [`campaign-assessment.md`](./campaign-assessment.md)):

| Status | Meaning |
| --- | --- |
| `invited` | Email matched existing Candidate; linked to campaign; awaiting interview via magic link |
| `invite_pending` | Email not registered; row shows email only until candidate registers via link |
| `in_progress` | Candidate in active assessment |
| `paused_violation` | Proctoring pause; may resume if under max violations |
| `auto_submitted` | Max violations reached; forced submit |
| `completed` | Assessment evaluated |

Post-interview employer review (locked report, etc.) — BRL-054.

### Candidate profile

Candidate profile provides:

- Candidate stage, score, shortlist status, skill tags, experience summary, and contact row.
- Internal HR notes that are not exposed to candidates.
- Links to the report view and back to the campaign pipeline.

Interview report provides:

- Score overview, score breakdown, rubric evidence, strengths, risks, recommendation, and transcript excerpts.
- Manual score override form requiring a 20+ character note.
- Reviewed/locked reports disable override controls.

Analytics dashboard provides:

- KPI cards for active candidates, completion rate, average score, and time-to-hire.
- Funnel, score distribution, top skills, and weekly trend cards.
- Global date/status filter.
- CSV/PDF export controls with BRL-041 guard.

## Data Contract

Until backend contracts are wired, the client uses a mock `EmployerAnalyticsService`:

- `listPipelineCandidates(campaignId, filters)`
- `getCandidate(candidateId)`
- `getCandidateReport(candidateId)`
- `getAnalytics(filters)`
- `overrideCandidateScore(candidateId, score, note)`
- `exportAnalytics(format, rowCount)`

The mock is tenant-scoped in memory and does not expose unmasked PII when blind-hiring is enabled.

## Validation

Required gates:

- `npm run check:ui-size`
- `npm run check:i18n`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`

Visible UI verification must include desktop and mobile screenshots plus a manual flow: open pipeline, sort/filter, open candidate profile, open report, attempt score override, open analytics, and trigger export.
