# Progress (Learning Analytics)

Candidate **Tiến độ** at `/candidate/progress` — analytics only.

## Purpose

Answer four questions:

1. What level am I at?
2. How have I improved?
3. Where am I weak?
4. What should I practice next?

Aggregates practice sessions, mock interviews, roadmaps, and AI assessment (mock today).

## Rules

- **Read-only** — no score or history edits.
- **No in-page practice** — CTAs go to `/practice` or `/candidate/learning`.
- Candidate sees **own** data only.
- Domain + time-range filters re-slice the dashboard.
- Score history / timeline open existing reports when `reportId` is set.
- Export is a **client stub** (JSON/text download) until a PDF API exists.
- Interview readiness is multi-factor (technical, communication, behavioral, problem solving, confidence) — not average score alone.

## Sections (1–18)

| # | Section |
| --- | --- |
| 1 | Overall Summary |
| 2 | Interview Readiness |
| 3 | Domain Progress |
| 4 | Score History (chart + filters) |
| 5 | Skill Breakdown |
| 6 | Strength Analysis |
| 7 | Weakness Analysis (Practice Now) |
| 8 | Improvement Trend |
| 9 | Practice Timeline |
| 10 | Learning Heatmap |
| 11 | Goal Tracking |
| 12 | Roadmap Progress |
| 13 | Achievements & Milestones (preview + link) |
| 14 | AI Insights |
| 15 | Personalized Recommendations (Practice Now) |
| 16 | Comparative Statistics |
| 17 | Session Analytics |
| 18 | Export Progress |

## Routes

| Path | Screen |
| --- | --- |
| `/candidate/progress` | Analytics dashboard |
| `/candidate/leaderboard` | Separate (linked) |
| `/candidate/achievements` | Separate (linked) |
| `/candidate/practice/history/:id` | Report from chart/timeline |
| `/practice` | Practice Now / Continue Practice |
| `/candidate/learning` | Continue Learning |

## Implementation

- Types: `src/features/practice/types/progress.types.ts`
- Mock: `src/features/practice/mocks/progress.fixtures.ts`
- Service: `src/features/practice/services/progress.service.ts`
- UI: `ProgressDashboardPage` + `components/progress/*`
- Charts: `recharts`

## Related

- `learning.md`, `learning-roadmap.md`, `practice-interview.md`
- `module-scope.md` — Keep (analytics)
