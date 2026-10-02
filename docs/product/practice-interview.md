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

Rubric editing lives at `/candidate/rubrics` (not part of create payload). Practice setup loads the active rubric with `?language=vi|en` and shows its source and criterion names in step 7. The create request does **not** send `rubricCriterionIds`; the server pins the active rubric. Step 7 links to the candidate editor, saving user choices and CV/JD IDs in a user-bound, two-hour `sessionStorage` draft. Returning to `/candidate/practice/setup` restores step 7 and reloads the rubric. The editor only accepts an internal `/candidate/` `returnTo` path.

## Candidate rubric API

The candidate rubric editor uses the Candidate-owned contract:

| Action | Path | Notes |
| --- | --- | --- |
| Read | `GET /api/v1/interview/practice/rubrics/{jobCategory}?language=vi|en` | Returns the custom rubric or the 7-criterion seed; response does not echo `language` |
| Replace | `PUT /api/v1/interview/practice/rubrics/{jobCategory}?language=vi|en` | Replaces all criteria; total weight must be within `0.99..1.01` |
| Reset | `DELETE /api/v1/interview/practice/rubrics/{jobCategory}?language=vi|en` | Idempotently returns that language to the seed rubric |
| Read default | `GET /api/v1/interview/practice/rubrics/{jobCategory}/default?language=vi|en` | Returns the current default rubric and its `defaultVersion` |

Vietnamese and English rubrics are separate records. The frontend sends the active UI language on every verb and keeps it in the query cache key. Candidate responses may include `defaultVersion` and `basedOnDefaultVersion`; a custom rubric based on an older version can show a default/custom comparison and apply the new default after confirmation. Reset remains available to return to the default rubric.

The admin rubric editor uses `GET /api/v1/admin/rubrics/{jobCategory}?language=vi|en` and `PUT` on the same path. An update sends one entry per criterion with `id`, `name`, `description`, `weight`, `scoringScope`, and `levels`; unchanged values for existing criteria are `null`, a new criterion has `id: null`, and deleted criteria are omitted. `maxScore` is fixed at 5. The editor requires enabled weights to total exactly 100% before sending an update. DeliveryMetrics criteria retain their name and scope and can only be enabled or disabled; the service remains authoritative for validation errors.

Weighted result responses may include `scoreFormula: "Weighted"`, `scoreBeforePenalty`, `skipPenalty`, `effectiveWeight` and `contribution` per assessed criterion, and `unassessedCriteria`. The report renders these returned values and the post-penalty formula. Average or legacy responses keep the existing unweighted report. An explicit empty `unassessedCriteria` list means there are no unassessed criteria; the frontend only uses its legacy inference when the field is absent.

## Routes

| Path | Component |
| --- | --- |
| `/practice` | Setup wizard → create session on Start |
| `/candidate/practice/setup` | Setup wizard return route after editing personal criteria |
| `/interview/:sessionId/prepare` | Fetch live session detail + readiness/consent |
| `/interview/:sessionId/room` | Shared B2C and learning practice room (live); campaign has its dedicated adapter |
| `/interview/:sessionId/complete` | Scoring poll + live report |
| `/practice/result?sessionId=:sessionId` | Live post-interview report from practice session detail |
| `/candidate/practice/history` | History list |
| Device-check / waiting | Shared B2C/B2B flow after preparation |

## Engine reuse

Interview room UI stays campaign-agnostic for B2B. B2C practice uses dedicated hooks/services under `b2cPractice*`.

The B2B campaign adapter supplies a `violationPaused` input to the shared room. While true, the existing question timer, TTS, MediaRecorder, submit/next/finish actions, and recorder controls pause or become disabled. Resume uses the same state and media instances; no second interview state machine is created. B2C never enables this campaign monitoring path. The ATT1 whole-sitting clock below is the exception: it never pauses.

## B2B campaign sitting clock (ATT1)

**Status: in progress** — ATT1-F4 (enter room + server-time clock) and ATT1-F5 (time-up) are being implemented; this section describes the agreed target from the ATT1 spec (contract hash `7e4792f993948da2`, codes `[I1]`–`[I5]`). Story packet: [`ATT1-frontend`](../stories/epics/ATT1-attempts-server-clock/ATT1-frontend/overview.md). HR configures the length in [`campaign-management.md`](./campaign-management.md#attempt-rules-att1); the candidate campaign page is in [`campaign-discovery.md`](./campaign-discovery.md#attempt-states-on-the-candidate-campaign-page-att1-f3).

**Scope.** Only B2B campaign sessions created after Backend ATT1. **B2C practice is unchanged**, and so are B2B sessions created before ATT1 (`begin` returns `beganAt = null`, `durationMinutes = null` ⇒ no sitting clock).

**Questions locked until the room.** After ATT1, campaign `start` and the session `GET` used by `/interview/:sessionId/prepare` return question ids/order/time limits with empty `content` (`questionsLocked = true`) [I2]; answers and TTS speech return `409 SESSION_NOT_BEGUN` while locked [I3][I4]. The preparation page must **not** call `begin` — otherwise the clock would run during the device check.

**Entering the room (F4).** When the B2B room opens (after preparation, before the first question is read) the frontend calls `POST /api/v1/interview/practice/sessions/{id}/begin` once [I1] (repeat calls return the same `beganAt`/`deadline`), then invalidates and refetches the `["practice","session",sessionId]` query. Still locked after `begin` ⇒ call `begin` once more, then show a room-load error. `begin` `404` (old Backend) ⇒ keep today’s path using the stored `deadlineAt` from `start`. `409 SESSION_ENDED` ⇒ the sitting is over.

**Clock = server time, never paused.**

- `offset = Date.parse(serverNow) − Date.now()` taken from the latest response carrying `serverNow` (`begin` or session `GET`); `remaining = deadline − (Date.now() + offset)`. Plain `Date.now()` is never used for the sitting clock.
- The sitting clock keeps running during violation overlays, hidden tabs and reloads. The **question** timer still pauses on violation exactly as in [`campaign-assessment.md`](./campaign-assessment.md) §26–27; the effective answer timer stays `min(question timer, sitting remaining)`.
- `start.deadlineAt` is the hard campaign/slot deadline, not the sitting clock, whenever `begin` returned a result.
- Header: “Thời gian bài thi ⏱ mm:ss (theo giờ hệ thống)” in its own component. ≤ 5 min: warning colour + “Còn 5 phút — hệ thống sẽ tự nộp khi hết giờ”. ≤ 1 min: error colour. `aria-live` announces only at 5 min / 1 min / 0. The violation overlay adds “Đồng hồ bài thi vẫn chạy”.

**Time-up (F5).** At `remaining = 0`: stop recording; if a segment was being recorded, upload it with `allowDuringTimeout` and wait at most **25 s** (the server accepts answers until `deadline + 30 s`) [I3]; then call `POST .../submit` [I5] (unchanged, accepted after the deadline); show a full-screen, non-dismissible “Đã hết giờ làm bài” screen with save/submit progress, the number of main questions answered (unanswered = 0 points), and a button back to the campaign page. No further recording or question navigation after 0.

| Case | Behaviour |
| --- | --- |
| Upload `409 SESSION_TIME_UP` | Drop that answer, continue to submit |
| Upload `409 SESSION_NOT_BEGUN` | Call `begin`, retry the upload once |
| `submit` fails | Time-up screen stays, with “Hệ thống sẽ tự nộp bài trong ít phút” (server auto-finalizes after `deadline + 30 s`) — never a “submit failed” message |
| No question answered at all | Server cancels the sitting; the attempt is still consumed |

Session error mapping reads the response `code` before the HTTP status, with dedicated i18n keys for the new ATT1 codes (today every `409` maps to `practice.errors.conflict`).

**Deliberately not done:** a server-held per-question timer; any countdown on the campaign card/page; an “attempt n” label in HR results.

## Integration order

1. Optional `GET /api/v1/interview/practice/session-options?jobCategory=...&language=...` to load question-count presets without charging credit.
2. Upload CV/JD when needed, then optionally create CV analysis.
3. `POST /api/v1/interview/practice/sessions` charges 1 credit; include `language` and optional `seniority` (`Fresher|Junior|Middle|Senior`).
4. Loop multipart answers until `interviewComplete`, then `POST .../submit` and poll session detail until `Scored`.
5. Handle `402` by routing to the credit flow. Shared API handling retries one `429` using `Retry-After`.

Roadmap practice reuses the same answer/submit flow; creating a roadmap is free, opening theory is free, and starting a lesson charges 1 credit.

## Status

B2C practice session lifecycle wired to live Interview Practice APIs when `practice` is in `LIVE_API_DOMAINS`.
