# US-007 Campaign Discovery Candidate Entry

## Status

**deprecated (product)** — public browse out of scope 2026-07-12

## Lane

normal

## Product Contract

**Superseded by:** [`docs/product/campaign-discovery.md`](../../../product/campaign-discovery.md) · [`docs/product/campaign-assessment.md`](../../../product/campaign-assessment.md)

B2B candidates enter **only via magic link** (`/invite/:token`). Public campaign browse/enroll (`/candidate/campaigns*`) is **out of scope**. Assessment flow after magic link is defined in `campaign-assessment.md`.

Replacement work:

- FS-123 — deprecate public routes
- FS-124–125 — magic link validate + briefing
- FS-085–089 — B2B proctoring (P5)

## Relevant Product Docs

- `docs/product/campaign-discovery.md`
- `docs/product/campaign-assessment.md`
- `docs/product/module-scope.md` §5
- `docs/FRONTEND_MASTER_PLAN.md` — Phase 8 (v1.2)

## BRD References (historical)

- SCR-CAN-023-025 — **deprecated in product**
- UF-008, UF-009 — replaced by magic-link + assessment flow
- UF-106 — retained via `/invite/:token`

## Acceptance Criteria (legacy — do not extend)

The following applied to the deprecated public discovery implementation only:

- ~~`/candidate/campaigns` renders campaign cards~~
- ~~`/candidate/campaigns/:id/enroll` enrollment~~

**Current product acceptance** (new stories):

- `/invite/:token` validates magic link and auth branch (sign in vs register)
- No navigation to `/candidate/campaigns*` in product UI
- Full assessment per `campaign-assessment.md` (separate stories)

## Design Notes

- Do **not** extend `CampaignBrowsePage`, `CampaignDetailPage`, or `CampaignEnrollmentPage`.
- Route reconcile: redirect or remove per FS-123.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | N/A for deprecated scope |
| Integration | Magic link + assessment stories |
| E2E | `e2e/specs/b2b/campaign-invite-interview.spec.ts` (updated flow) |
| Platform | Build, i18n, UI-size, typecheck |

## Harness Delta

Mark story deprecated in backlog; track replacement stories US-010, FS-123–125.
