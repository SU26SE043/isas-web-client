# Candidate Dashboard

BRD: F-PROF-001, SCR-CAN-012, `BRD/Functional_Requirements.md` (profile overview).

## User flow

1. Authenticated candidate lands on **`/candidate/dashboard`** after login.
2. **Profile completeness** bar with 70% gate CTA when below threshold.
3. **Interview Activity** — year heatmap (GitHub-contribution style) for practice frequency.
4. **Quick metrics** — credits remaining, CV analysis status (link to analysis flow).

## Routes

| Path | Component |
| --- | --- |
| `/candidate/dashboard` | `CandidateDashboardPage` |

## Interview Activity heatmap

| Element | Behavior |
| --- | --- |
| Grid | 52 weeks × 7 days; month labels on top; Mon / Wed / Fri labels on left |
| Cell color | 0 / 1 / 2 / 3+ interviews per day (semantic green scale) |
| Hover | Tooltip: date, interview count, average score for that day |
| Click | Navigate to `/candidate/practice/history?date=YYYY-MM-DD` |
| Header stats | Total interviews, average score, passed (≥70), failed (&lt;70) for current year |
| Empty state | Message + **Start Interview** → `/practice` |
| Responsive | Full grid on desktop/tablet; horizontal scroll on mobile |

Data source: `useInterviewHistory()` — mock in `src/features/practice/mocks/history.fixtures.ts` until API wired.

## UI contract

- Card: `rounded-2xl`, dark monochrome surfaces per `docs/UI_GUIDE.md`.
- Heatmap activity uses semantic green levels (data visualization exception).
- Bilingual keys under `profile.dashboard.heatmap*` in `src/features/profile/languages/translations.ts`.

## Status

**UI implemented** (heatmap + stats + empty state, mock history). Dashboard summary API (`useDashboardSummary`) may still use mock/partial data.

## Evidence

- Commit: `286363d` on `phase-4-candidate-profile-cv`
- Code: `src/features/profile/components/dashboard/**`, `src/features/profile/utils/interviewHeatmapUtils.ts`
