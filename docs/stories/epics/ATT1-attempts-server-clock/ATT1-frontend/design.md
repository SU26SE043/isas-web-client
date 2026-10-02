# Design

## Domain Model

- **Attempt rules** on a campaign: `timeLimitMinutes` (5–180, locked after deployment) and
  `maxAttempts` (1–3, default 1, Active ⇒ increase only).
- **Attempt counters** per candidate from my-campaigns: `attemptsUsed`, `maxAttempts`,
  `lastAttemptAbandoned`; `interviewStatus` keeps its old values and is **not** used to decide
  “out of attempts”.
- **Sitting clock** per B2B session: `beganAt`, `deadline`, `durationMinutes`, `serverNow`,
  `questionsLocked`.

## Application Flow

1. HR sets the rules in wizard step 5 (create/update body carries both keys) and can only raise
   `maxAttempts` from Campaign Detail while Active (`PUT { title, maxAttempts }`).
2. Candidate page resolves one of four states (not started · in progress · retake · out of
   attempts) and opens a confirm dialog that states the rules before `start`.
3. `start` creates/resumes the session with locked questions; preparation reads the locked session.
4. Entering the room calls `begin`, refetches the session (questions unlocked) and starts the
   server-time clock. Time-up uploads the last answer (≤ 25 s), submits and shows the time-up
   screen.

## Interface Contract

Summarized from contract `7e4792f993948da2` (see product docs for behaviour):

| Code | Endpoint | Frontend use |
| --- | --- | --- |
| [C1] | `POST /api/v1/campaign` | send `maxAttempts`; 400 outside ranges |
| [C2] | `PUT /api/v1/campaign/{id}` | `maxAttempts` increase only when Active; `409 MAX_ATTEMPTS_DECREASE`; `title` required |
| [C3] | `PUT /api/v1/campaign/{id}` | `timeLimitMinutes` change after Draft ⇒ `409 TIME_LIMIT_LOCKED` |
| [C4] | publish | 400 when length missing / out of range |
| [C5] | `CampaignResponse` | read `maxAttempts` (absent ⇒ 1) |
| [C6] | my-campaigns list + detail | `timeLimitMinutes`, `maxAttempts`, `attemptsUsed`, `lastAttemptAbandoned` |
| [C7] | `POST /api/v1/campaign/{id}/start` | `attemptNo`, `timeLimitMinutes`; `content = ""`; `deadlineAt` = hard deadline |
| [C8] | `start` | `409 ATTEMPT_LIMIT_REACHED` |
| [I1] | `POST .../sessions/{id}/begin` | start clock; idempotent; `SESSION_ENDED`, 403, 404 |
| [I2] | `GET .../sessions/{id}` | `durationMinutes`, `beganAt`, `serverNow`, `questionsLocked` |
| [I3] | `POST .../answers` | `409 SESSION_NOT_BEGUN` / `SESSION_TIME_UP` (after deadline + 30 s) |
| [I4] | `GET .../speech` | `409 SESSION_NOT_BEGUN` while locked |
| [I5] | `POST .../submit` | unchanged; auto-finalize after deadline + 30 s |

## Data Model

No frontend persistence change beyond the existing campaign-interview session marker in
`sessionStorage` (`utils/campaignInterviewSession.ts`), which keeps `deadlineAt` for the
old-Backend path.

## UI / Platform Impact

- Employer: `CampaignAttemptRulesPanel` (wizard step 5), Review summary row,
  `CampaignAttemptRulesCard` + `IncreaseMaxAttemptsDialog` (Campaign Detail).
- Candidate: `CampaignAttemptStatus` (rules meta + four-state action), `StartCampaignConfirmDialog`,
  `MyCampaignCard` attempts line.
- Room (F4/F5): sitting-clock header component, violation-overlay line, time-up screen.
- Dark monochrome + satin frames; semantic warning/error colours only for estimate warning,
  out-of-attempts and clock thresholds; vi/en i18n; UI files ≤ 250 lines.

## Observability

No new telemetry. Server messages for `MAX_ATTEMPTS_DECREASE` / `TIME_LIMIT_LOCKED` are shown
verbatim so support can match them to Backend logs.

## Alternatives Considered

1. Countdown on the campaign card/page — rejected: Campaign does not know when the candidate
   entered the room, so the number would be wrong.
2. Infer “out of attempts” from `interviewStatus` — rejected: Backend reports an abandoned attempt
   as `NotStarted`.
3. Hide the start button when ATT1 fields are absent — rejected: Frontend ships before Backend and
   candidates would be locked out.
4. Block saving when the length is below the estimate — rejected: the estimate is rough, not a rule.
5. Call `begin` on the preparation page — rejected: the clock would run during the device check.
