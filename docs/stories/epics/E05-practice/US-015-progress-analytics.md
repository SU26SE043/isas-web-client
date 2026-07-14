# US-015 Progress analytics dashboard

## Status

implemented

## Lane

normal

## Product Contract

Candidate opens `/candidate/progress` and sees a Learning Analytics dashboard with all 18 sections (overall, readiness, domain, score history, skills, strengths/weaknesses, trends, timeline, heatmap, goals, roadmaps, achievements preview, AI insights, recommendations, comparative stats, session analytics, export stub). Progress is read-only; practice CTAs navigate to Practice or Learning.

## Relevant Product Docs

- `docs/product/progress.md`
- `docs/product/module-scope.md`
- `docs/product/learning.md`

## Acceptance Criteria

- [x] All 18 sections render with mock data under domain + time-range filters.
- [x] Practice Now / Continue Learning / Continue Practice leave Progress (no interview room embedded).
- [x] Score history / timeline points with `reportId` open `/candidate/practice/history/:id`.
- [x] Export downloads stub JSON/text for each report kind (no PDF library).
- [x] Bilingual `practice.progress.*` keys (vi/en); `check:i18n` / `check:ui-size` / typecheck pass.

## Design Notes

- Commands: `progressService.getDashboard({ domain?, range? })`, `exportReport(kind)`
- API: mock until progress API exists
- UI: section components under `src/features/practice/components/progress/`
- Charts: recharts; heatmap CSS grid

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit / static | `npm run typecheck`, `check:i18n`, `check:ui-size` |
| Integration | Manual: filter + CTA + export on `/candidate/progress` |
| E2E | Optional smoke when Playwright browsers available |

## Trace

Implements FS-100 / SCR-CAN-043 (mock analytics).
