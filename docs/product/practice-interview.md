# Practice Interview (B2C)

BRD: FR-009–019, SCR-CAN-029–048, `BRD/User_Flows.md` (practice + results + learning flows).

## User flow

1. Candidate starts session at `/practice` (role-guarded: Candidate + Admin).
2. Interview room: AI panel, candidate camera, controls, live conversation area.
3. Session completes → upload → AI scoring poll → result report.
4. Result tabs: Overview (radar + score dial), Skill breakdown, Per-question feedback, Roadmap preview.
5. History at `/candidate/practice/history` and detail `/candidate/practice/history/:id`.
6. Learning hub at `/candidate/learning`, module viewer `/candidate/learning/:moduleId`.
7. Full roadmap at `/candidate/roadmap` (regenerate limit BRL-026).
8. Certificates at `/candidate/certificates/:id`.
9. Compare results from history compare mode → `/candidate/practice/history/compare?left=&right=`.
10. Progress dashboard at `/candidate/progress`, leaderboard and achievements linked from there.
11. Guided learning practice at `/candidate/learning/:moduleId/practice`.
12. Optional **date filter** on history via `?date=YYYY-MM-DD` (linked from dashboard heatmap).

Legacy `/practice/history` redirects to `/candidate/practice/history`.

## Routes

| Path | Component |
| --- | --- |
| `/practice` | `PracticeEntryPage` |
| `/practice/result` | `InterviewResultPage` (query: `assessmentId`) |
| `/practice/interview/:id` | `InterviewResultPage` |
| `/candidate/practice/history` | `InterviewHistoryPage` |
| `/candidate/practice/history/:id` | `InterviewResultPage` |
| `/candidate/roadmap` | `RoadmapPage` |
| `/candidate/learning` | `LearningHubPage` |
| `/candidate/learning/:moduleId` | `LearningModulePage` |
| `/candidate/learning/:moduleId/practice` | `LearningPracticePage` |
| `/candidate/progress` | `ProgressDashboardPage` |
| `/candidate/leaderboard` | `LeaderboardPage` |
| `/candidate/achievements` | `AchievementsPage` |
| `/candidate/practice/history/compare` | `CompareResultsPage` |
| `/candidate/certificates/:id` | `CertificateViewerPage` |

## UI contract

- Recording indicator uses semantic `error` color (status only).
- AI state badges: speaking / listening / thinking — semantic status colors.
- Result page: scoring poll UI, tabbed report, score dial, skill radar, gap analysis, question feedback accordion.
- History toolbar: status filter + optional date filter chip with clear action.
- Learning module pass threshold: 80% (BRL-011).

## Phase 6 coverage

All FS-090 through FS-103 stories are implemented on mock services (P0-P3), including compare results, progress dashboard, guided practice session, leaderboard, and achievements.

## Engine reuse

Interview room components must stay campaign-agnostic so B2B magic-link flow can reuse them later (BRD D1).

### B2B campaign assessment (proctoring)

When `campaign_id` is set, the full assessment flow applies: device check, terms, identity baseline photo, camera always on, periodic face match, tab/focus monitoring, violation pause, auto-submit — see [`campaign-assessment.md`](./campaign-assessment.md).

B2C practice (`/practice`, `campaign_id = null`) uses the same interview **routes** where applicable; full proctoring parity with B2B — **Chưa được đặc tả trong tài liệu.**

## Status

Phase 6 UI on `phase-6-results-learning` — mock data for results, roadmap, learning modules, certificates. Live API integration TBD.

## Related

- Dashboard heatmap: `docs/product/dashboard.md`
