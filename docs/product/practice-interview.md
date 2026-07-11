# Practice Interview (B2C)

BRD: FR-009–017, SCR-CAN-029–048, `BRD/User_Flows.md` (practice flows).

## User flow

1. Candidate starts session at `/practice` (role-guarded: Candidate + Admin).
2. Interview room: AI panel, candidate camera, controls, live conversation area.
3. Session completes → result with radar chart, gap analysis, rubric breakdown.
4. History at `/candidate/practice/history` and detail `/candidate/practice/history/:id`.
5. Optional **date filter** via query `?date=YYYY-MM-DD` (linked from dashboard heatmap).

Legacy `/practice/history` redirects to `/candidate/practice/history`.

## Routes

| Path | Component |
| --- | --- |
| `/practice` | `PracticeInterviewPage` |
| `/practice/result` | `InterviewResultPage` |
| `/practice/interview/:id` | `InterviewResultPage` |
| `/candidate/practice/history` | `InterviewHistoryPage` |
| `/candidate/practice/history/:id` | `InterviewResultPage` |

## UI contract

- Recording indicator uses semantic `error` color (status only).
- AI state badges: speaking / listening / thinking — semantic status colors.
- Result page: loading skeleton, error panel, skill radar, personal notes.
- History toolbar: status filter + optional date filter chip with clear action.

## Engine reuse

Interview room components must stay campaign-agnostic so B2B magic-link flow can reuse them later (BRD D1).

## Status

Active development on `phase-4-candidate-profile-cv`. History + heatmap integration UI complete (mock data). API integration for live session TBD.

## Related

- Dashboard heatmap: `docs/product/dashboard.md`
