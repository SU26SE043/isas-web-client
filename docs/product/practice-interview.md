# Practice Interview (B2C)

BRD: FR-009–017, SCR-CAN-029–048, `BRD/User_Flows.md` (practice flows).

## User flow

1. Candidate starts session at `/practice` (role-guarded).
2. Interview room: AI panel, candidate camera, controls, live conversation area.
3. Session completes → result with radar chart, gap analysis, rubric breakdown.
4. History at `/practice/history` and detail `/practice/history/:id`.

## Routes

| Path | Component |
| --- | --- |
| `/practice` | `PracticeInterviewPage` |
| `/practice/result` | `InterviewResultPage` |
| `/practice/interview/:id` | `InterviewResultPage` |
| `/practice/history` | `InterviewHistoryPage` |
| `/practice/history/:id` | `InterviewResultPage` |

## UI contract

- Recording indicator uses semantic `error` color (status only).
- AI state badges: speaking / listening / thinking — semantic status colors.
- Result page: loading skeleton, error panel, skill radar, personal notes.

## Engine reuse

Interview room components must stay campaign-agnostic so B2B magic-link flow can reuse them later (BRD D1).

## Status

Active development on `feature/practice`. API integration for live session TBD.
