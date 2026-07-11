# US-006 Candidate Dashboard Activity Heatmap

## Status

implemented

## Lane

normal

## Product Contract

Candidate dashboard shows profile completeness, **interview activity heatmap** for the current year, and quick metrics (credits, CV analysis status).

## Relevant Product Docs

- `docs/product/dashboard.md`
- `docs/product/practice-interview.md` (history date filter)

## BRD References

- F-PROF-001
- SCR-CAN-012

## Acceptance Criteria

- [x] `/candidate/dashboard` — heatmap section with year grid and month/weekday labels.
- [x] Cell colors reflect 0 / 1 / 2 / 3+ interviews per day.
- [x] Hover tooltip: date, count, average score.
- [x] Click cell opens history filtered by date (`?date=`).
- [x] Header stats: total, average score, passed, failed.
- [x] Empty state with Start Interview CTA.
- [x] Responsive horizontal scroll on narrow viewports.
- [ ] Live dashboard API aggregation — may still use mock history.

## Validation

| Layer | Expected proof |
| --- | --- |
| Platform | `npm run dev` — dashboard heatmap renders; `npm run check:i18n` pass |

## Evidence

- `src/features/profile/components/dashboard/**`
- `src/features/profile/utils/interviewHeatmapUtils.ts`
- Commit: `286363d` (`phase-4-candidate-profile-cv`)
