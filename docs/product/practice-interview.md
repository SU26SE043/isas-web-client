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
5. Room: question text renders immediately from session state and never depends on TTS. The authenticated TTS `GET .../questions/{id}/speech` is prefetched as a blob as soon as the question is known, then played after the start gate through one persistent audio coordinator. Recording and the answer timer stay locked during TTS loading/playback. At the 9s load ceiling or on a transient 502/504, the coordinator uses Web Speech with the already-rendered question text when supported; otherwise it degrades to text-only and unlocks the answer flow. HTML audio and Web Speech are mutually exclusive and both are cancelled on question change/recording stop. A 60s playback watchdog prevents a missing completion event from hanging the room. Autoplay rejection exposes a manual Play action. MediaRecorder answers use echo cancellation and `POST .../answers` multipart (`questionId`, `file`, `durationSec`). If the answer timer hits `0` without a submitted answer: stop/discard recording, mark the question `unanswered`, register a silent answer so scoring can assign 0, auto-advance (TTS + new timer). The Finish control is shown only after the answer API returns `interviewComplete: true`; it then calls `POST .../submit` (204, empty body).
6. Scoring: `/interview/:sessionId/complete` polls `GET .../sessions/{sessionId}` every 3s until `status === Scored`, then redirects to `/practice/result?sessionId={sessionId}`. The result page calls the same authenticated session-detail endpoint, polls only while evaluation is pending, and renders `result` (`overallScore`, `criteriaScores`, `needsImprovement`, `overallComment`, `cvVsAnswer`). The frontend never creates an `assessment-*` ID.

Rubric editing lives at `/candidate/rubrics` (not part of create payload). Practice setup also loads the active rubric with `?language=vi|en` before sending selected `rubricCriterionIds`.

## Candidate rubric API

The rubric editor uses the Candidate-owned CRUD contract:

| Action | Path | Notes |
| --- | --- | --- |
| Read | `GET /api/v1/interview/practice/rubrics/{jobCategory}?language=vi|en` | Returns the custom rubric or the 7-criterion seed; response does not echo `language` |
| Replace | `PUT /api/v1/interview/practice/rubrics/{jobCategory}?language=vi|en` | Replaces all criteria; total weight must be within `0.99..1.01` |
| Reset | `DELETE /api/v1/interview/practice/rubrics/{jobCategory}?language=vi|en` | Idempotently returns that language to the seed rubric |

Vietnamese and English rubrics are separate records. The frontend sends the active UI language on every verb and keeps it in the query cache key.

## Routes

| Path | Component |
| --- | --- |
| `/practice` | Setup wizard → create session on Start |
| `/interview/:sessionId/prepare` | Fetch live session detail + readiness/consent |
| `/interview/:sessionId/room` | Shared B2C and learning practice room (live); campaign has its dedicated adapter |
| `/interview/:sessionId/complete` | Scoring poll + live report |
| `/practice/result?sessionId=:sessionId` | Live post-interview report from practice session detail |
| `/candidate/practice/history` | History list |
| Device-check / waiting | Shared B2C/B2B flow after preparation |

## Engine reuse

Interview room UI stays campaign-agnostic for B2B. B2C practice uses dedicated hooks/services under `b2cPractice*`.

The B2B campaign adapter supplies a `violationPaused` input to the shared room. While true, the existing question timer, TTS, MediaRecorder, submit/next/finish actions, and recorder controls pause or become disabled. Resume uses the same state and media instances; no second interview state machine is created. B2C never enables this campaign monitoring path.

## Integration order

1. Optional `GET /api/v1/interview/practice/session-options?jobCategory=...&language=...` to load question-count presets without charging credit.
2. Upload CV/JD when needed, then optionally create CV analysis.
3. `POST /api/v1/interview/practice/sessions` charges 1 credit; include `language` and optional `seniority` (`Fresher|Junior|Middle|Senior`).
4. Loop multipart answers until `interviewComplete`, then `POST .../submit` and poll session detail until `Scored`.
5. Handle `402` by routing to the credit flow. Shared API handling retries one `429` using `Retry-After`.

Roadmap practice reuses the same answer/submit flow; creating a roadmap is free, opening theory is free, and starting a lesson charges 1 credit.

## Status

B2C practice session lifecycle wired to live Interview Practice APIs when `practice` is in `LIVE_API_DOMAINS`.
