# US-015 Progress analytics dashboard

## Status

implemented

## Lane

normal

## Product Contract

Candidate opens `/candidate/progress` and sees a **minimal** Progress dashboard with exactly three charts: Overall Roadmap Completion (donut), Skill Completion Breakdown (stacked bar), and Practice Score Improvement (line). Each section has a title and one short caption. No KPI cards, filters, tables, timelines, insights, CTAs, or export on this page.

## Relevant Product Docs

- `docs/product/progress.md`
- `docs/product/module-scope.md`
- `docs/product/learning.md`

## Acceptance Criteria

- [x] Exactly three chart sections render with mock data (donut, stacked bar, line).
- [x] No filters, KPI cards, timelines, AI insights, recommendations, or export on Progress.
- [x] Donut center shows overall roadmap completion percent.
- [x] Stacked bar shows Completed + In Progress per skill.
- [x] Line chart shows practice session scores on 0–100 Y-axis.
- [x] Bilingual `practice.progress.*` keys (vi/en); `check:i18n` / `check:ui-size` / typecheck pass.

## Design Notes

- Commands: `progressService.getDashboard()`
- API: mock until progress API exists
- UI: `ProgressDashboardPage` + chart components under `src/features/practice/components/progress/`
- Charts: recharts, monochrome design system

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit / static | `npm run typecheck`, `check:i18n`, `check:ui-size` |
| Integration | Manual: three charts visible on `/candidate/progress` |
| E2E | Optional smoke when Playwright browsers available |

## Trace

Implements FS-100 / SCR-CAN-043 (minimal progress dashboard).
