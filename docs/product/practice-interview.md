# Practice Interview (B2C)

BRD: FR-009–019, SCR-CAN-029–048. Live Interview Practice APIs for standalone B2C sessions.

## Candidate sidebar

| Item | Route | Role |
| --- | --- | --- |
| **Practice** | `/practice` | B2C — create practice session (1 credit) |
| **Campaigns** | `/candidate/campaigns` | B2B — invited assessments |
| **Reports** | `/candidate/reports` | Interview / learning / CV reports hub |

History: `/candidate/practice/history`.

## User flow (live API)

1. Open `/practice` — setup wizard (no session API until Start).
2. Setup fields: `jobCategory` (BA|BE|FE), optional `cvId`, JD via `jdId` or `jdText` (text wins), `timeLimitSec` (60|120|240), `questionCount` (1–20), device check.
3. **Start interview** → `POST /api/v1/interview/practice/sessions` → navigate `/interview/:sessionId/prepare`.
4. Prepare loads `GET /api/v1/interview/practice/sessions/{sessionId}` through the authenticated client, then shows consent and device readiness. Invalid IDs do not call the API; `401`, `403`, and `404` render safe localized states.
5. Room: TTS `GET .../questions/{id}/speech` (blob), MediaRecorder answer, `POST .../answers` multipart (`questionId`, `file`, `durationSec`), timer with 10s warning. If the answer timer hits `0` without a submitted answer: stop/discard recording, mark the question `unanswered`, register a silent answer so scoring can assign 0, auto-advance (TTS + new timer). Finish confirm → `POST .../submit` (204, empty body).
6. Scoring: `/interview/:sessionId/complete` polls `GET .../sessions/{id}` every 3s until `status === Scored`, then render `result` (`overallScore`, `criteriaScores`, `needsImprovement`, `overallComment`, `cvVsAnswer`).

Rubric editing lives at `/candidate/rubrics` (not part of create payload).

## Routes

| Path | Component |
| --- | --- |
| `/practice` | Setup wizard → create session on Start |
| `/interview/:sessionId/prepare` | Fetch live session detail + readiness/consent |
| `/interview/:sessionId/room` | B2C practice room (live) / learning+campaign legacy room |
| `/interview/:sessionId/complete` | Scoring poll + live report |
| `/candidate/practice/history` | History list |
| Device-check / waiting | Shared B2C/B2B flow after preparation |

## Engine reuse

Interview room UI stays campaign-agnostic for B2B. B2C practice uses dedicated hooks/services under `b2cPractice*`.

## Status

B2C practice session lifecycle wired to live Interview Practice APIs when `practice` is in `LIVE_API_DOMAINS`.
