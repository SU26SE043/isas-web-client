# Practice Interview (B2C)

BRD: FR-009–019, SCR-CAN-029–048, `BRD/User_Flows.md` (practice + results + learning flows).

## User flow

1. Candidate starts session at `/practice` (role-guarded: Candidate + Admin) → redirects to `/interview/:sessionId/prepare`.
2. **Prepare** — profile/credit gate, checklist, recording consent.
3. **Device check** — `/interview/:sessionId/device-check` — camera/mic preview.
4. **Terms** (B2B campaign sessions only) — `/interview/:sessionId/terms` — assessment terms acceptance.
5. **Identity** — `/interview/:sessionId/identity` — baseline face photo capture.
6. **Waiting** — `/interview/:sessionId/waiting` — question poll / buffer.
7. **Room** — `/interview/:sessionId/room` — AI panel, candidate camera, timer, controls, recording.
8. **Proctoring** — tab/focus violations pause session (`ViolationPauseOverlay`); max violations → auto-submit.
9. Session completes → upload → `/interview/:sessionId/complete` → result/history.
10. Result tabs: Overview (radar + score dial), Skill breakdown, Per-question feedback, Roadmap preview.
11. History at `/candidate/practice/history` and detail `/candidate/practice/history/:id`.
12. Learning hub at `/candidate/learning`, module viewer `/candidate/learning/:moduleId`.
13. Full roadmap at `/candidate/roadmap` (regenerate limit BRL-026).
14. Certificates at `/candidate/certificates/:id`.
15. Compare results from history compare mode → `/candidate/practice/history/compare?left=&right=`.
16. Progress dashboard at `/candidate/progress`, leaderboard and achievements linked from there.
17. Guided learning practice at `/candidate/learning/:moduleId/practice`.
18. Optional **date filter** on history via `?date=YYYY-MM-DD` (linked from dashboard heatmap).

Legacy `/practice/history` redirects to `/candidate/practice/history`.

## Routes

| Path | Component |
| --- | --- |
| `/practice` | `PracticeEntryPage` → `/interview/session-123/prepare` |
| `/interview/:sessionId/prepare` | `InterviewPrepPage` |
| `/interview/:sessionId/device-check` | `DeviceCheckPage` |
| `/interview/:sessionId/terms` | `TermsAcceptancePage` (B2B campaign sessions) |
| `/interview/:sessionId/identity` | `IdentityVerifyPage` |
| `/interview/:sessionId/waiting` | `WaitingRoomPage` |
| `/interview/:sessionId/room` | `PracticeInterviewPage` |
| `/interview/:sessionId/complete` | `InterviewCompletePage` |
| `/practice/result` | `InterviewResultPage` (query: `assessmentId`) |
| `/practice/interview/:id` | `InterviewResultPage` |
| `/candidate/practice/history` | `InterviewHistoryPage` |
| `/candidate/results/:id` | Redirect → `/candidate/practice/history/:id` |
| `/candidate/history` | Redirect → `/candidate/practice/history` |
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

FS-090 through FS-103 implemented on mock services:

- **Results:** scoring poll, tabbed report (`ReportTabs`), `ScoreDial`, `SkillRadarChart`, `SkillBreakdownAccordion` (alias), question feedback, roadmap preview via `learningService.getRoadmap()`.
- **History:** `HistoryTable`, pagination, status/date filters, compare mode, soft-delete (hide/restore).
- **Learning:** roadmap page with regen limit, learning hub, module viewer with `passThreshold`, guided practice session.
- **Progress:** dashboard, leaderboard, achievements.
- **Certificates:** viewer with PDF download (minimal PDF blob).
- **Route aliases:** `/candidate/results/:id` and `/candidate/history` redirect to practice history routes.

E2E: `e2e/specs/b2c/results-learning.spec.ts`, extended `interview-happy-path.spec.ts` (view result after complete).

Live API integration TBD.

## Engine reuse

Interview room components must stay campaign-agnostic so B2B magic-link flow can reuse them later (BRD D1).

### B2B campaign assessment (proctoring)

When `campaign_id` is set (session id prefix `campaign-`), the full assessment flow applies: device check, **terms** (`/interview/:sessionId/terms`), identity baseline photo, camera always on, periodic face capture (mock), tab/focus monitoring, violation pause overlay, auto-submit at max violations — see [`campaign-assessment.md`](./campaign-assessment.md).

Flow progress is persisted per session in `sessionStorage` (`isas-interview-flow:{sessionId}`).

B2C practice (`/practice`, `campaign_id = null`) uses the same interview routes without the terms step; lighter proctoring defaults (higher max violations, camera toggle allowed).

## Status

Phase 5 interview engine + Phase 6 results/learning on mock services. Live Interview API integration TBD.

## Related

- Dashboard heatmap: `docs/product/dashboard.md`
