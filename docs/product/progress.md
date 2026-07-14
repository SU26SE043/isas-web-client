# Progress (Minimal Learning Dashboard)

Candidate **Tiến độ** at `/candidate/progress` — visual progress only.

## Purpose

Help the Candidate glance at:

1. Overall Roadmap completion
2. Skill completion breakdown
3. Practice score improvement over sessions

No tables, KPI cards, activity feeds, insights, or action widgets on this page.

## Rules

- **Read-only** — no score or history edits.
- Candidate sees **own** data only.
- Page content is **exactly three charts**, each with a title and one short caption.
- A single page `h1` is allowed for route identity; no subtitle, filters, CTAs, or export.

## Sections

| # | Section | Chart |
| --- | --- | --- |
| 1 | Overall Roadmap Completion | Donut (Completed / In Progress / Locked + center %) |
| 2 | Skill Completion Breakdown | Stacked bar (Completed + In Progress per skill) |
| 3 | Practice Score Improvement | Line (sessions X, score 0–100 Y) |

## Routes

| Path | Screen |
| --- | --- |
| `/candidate/progress` | Minimal 3-chart dashboard |
| `/candidate/leaderboard` | Separate |
| `/candidate/achievements` | Separate |

## Implementation

- Types: `src/features/practice/types/progress.types.ts` (`ProgressMinimalDashboard`)
- Mock: `src/features/practice/mocks/progress.fixtures.ts`
- Service: `src/features/practice/services/progress.service.ts`
- UI: `ProgressDashboardPage` + three chart components under `components/progress/`
- Charts: `recharts` (monochrome tokens)

## Related

- `learning.md`, `learning-roadmap.md`, `practice-interview.md`
- `module-scope.md`
