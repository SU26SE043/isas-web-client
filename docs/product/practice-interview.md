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
3. **Start interview** → `POST /api/v1/interview/practice/sessions` → navigate `/interview/:sessionId/room`.
4. Room: TTS `GET .../questions/{id}/speech` (blob), MediaRecorder answer, `POST .../answers` multipart (`questionId`, `file`, `durationSec`), timer with 10s warning, finish confirm → `POST .../submit` (204).
5. Scoring: `/interview/:sessionId/complete` polls `GET .../sessions/{id}` every 3s until `status === Scored`, then render `result` (`overallScore`, `criteriaScores`, `needsImprovement`, `overallComment`, `cvVsAnswer`).

Rubric editing lives at `/candidate/rubrics` (not part of create payload).

## Routes

| Path | Component |
| --- | --- |
| `/practice` | Setup wizard → create session on Start |
| `/interview/:sessionId/room` | B2C practice room (live) / learning+campaign legacy room |
| `/interview/:sessionId/complete` | Scoring poll + live report |
| `/candidate/practice/history` | History list |
| Prepare / device-check / waiting | Still used by campaign/learning; B2C device check is in setup |

## Engine reuse

Interview room UI stays campaign-agnostic for B2B. B2C practice uses dedicated hooks/services under `b2cPractice*`.

## Status

B2C practice session lifecycle wired to live Interview Practice APIs when `practice` is in `LIVE_API_DOMAINS`.
