# ATT1 — Attempt limit and server-timed sitting (Frontend)

## Status

in_progress — F1–F3 implemented; F4–F5 in_progress; F6 planned (needs Backend ATT1-B1..B3 on dev).

## Contract

ATT1 frontend delivery is split into F1–F6 and uses contract hash `7e4792f993948da2`
(identical block in the Backend and Frontend ATT1 specs). Codes `[C1]`–`[C8]` cover the
Campaign service (`/api/v1/campaign/...`); `[I1]`–`[I5]` cover Interview Practice
(`/api/v1/interview/practice/...`). The product docs summarize behaviour and cite these codes;
they do not copy the contract block.

Rules agreed with the product owner:

- Each candidate may take at most `maxAttempts` attempts per campaign (1–3, default 1). After
  deployment the value can only be increased; an increase applies to every candidate, including
  those already out of attempts (the way to rescue a session broken by a grading failure).
- An attempt is a `start` that creates a **new** sitting. Resuming an unfinished sitting does not
  count; a sitting that died because AI failed to generate questions does not count.
- A retake draws a new base question set (a campaign without questions-per-session reuses the
  same full set). Resuming keeps the same questions.
- The whole-sitting clock starts when the candidate **enters the room** (after preparation),
  lasts exactly `timeLimitMinutes` (5–180), never exceeds the campaign/slot deadline, and never
  pauses (reload, violation overlay). The length is locked after deployment.
- Time-up: the server stops accepting answers (30 s grace for an in-flight upload), auto-submits
  answered questions, unanswered = 0. No answer at all ⇒ the sitting is cancelled and the attempt
  is still consumed.
- Sittings created before ATT1, and every B2C sitting, keep today's behaviour.

## Current Behavior

`timeLimitMinutes` was only printed in the invitation email (input in the invite step's email
tab); the server did not enforce it. Candidates could work until the campaign expired, restart an
abandoned sitting without limit, and question content was exposed by `start` before the device
check. The room counted the server deadline with the machine clock and paused it during
violations.

## Target Behavior

| Slice | Surface | Contract | Status | Commits |
| --- | --- | --- | --- | --- |
| ATT1-F1 | Wizard step 5 “Luật làm bài” (length 5–180, attempts 1/2/3, estimate warning) + Review row | [C1] [C4] [C5] | implemented (PASS KIỂM) | `0591c6d6`, `8be01a9e` |
| ATT1-F2 | Campaign Detail attempt-rules card + increase-attempts dialog (Active) | [C2] [C3] [C5] | implemented (PASS KIỂM) | `e3ec89b9`, `db8ec0e1` |
| ATT1-F3 | Candidate campaign page: four attempt states, confirm dialog, card attempts line | [C6] [C7] [C8] | implemented (PASS KIỂM) | `f7e02808`, `4c82d23e` |
| ATT1-F4 | Interview room: `begin` on room entry, server-time sitting clock that never pauses | [I1] [I2] [I4] | in_progress | — |
| ATT1-F5 | Time-up: final upload, submit, non-dismissible time-up screen, new 409 codes | [I3] [I5] | in_progress | — |
| ATT1-F6 | Real run on dev through the UI (HR + candidate, 375 px, clock skew) | all | planned | — |

All slices land on one branch `feat/att1-fe` (from `main` tip `32ab8a9e`), one PR, one atomic
commit per slice plus `fix(att1-fx)` commits from the check loop.

## Affected Users

- HR / Organization Admin creating campaigns and managing Active campaigns.
- Invited B2B candidates (campaign page, preparation, interview room).

## Affected Product Docs

- `docs/product/campaign-management.md` — § Attempt rules (ATT1)
- `docs/product/campaign-discovery.md` — § Attempt states on the candidate campaign page (ATT1-F3)
- `docs/product/practice-interview.md` — § B2B campaign sitting clock (ATT1)
- `docs/product/campaign-assessment.md` — §27 note (sitting clock does not pause)

## Non-Goals

- Server-held per-question timer.
- Countdown on the campaign card or campaign page.
- “Attempt n” label in HR results.
- Any change to B2C practice sittings.

## Dependencies

- F1–F5 are built and tested against mocks; F6 needs Backend ATT1-B1..B3 deployed on dev.
- **Production order: Frontend first, then Backend.** New Frontend + old Backend behaves as today
  (`begin` 404, absent fields). Old Frontend + new Backend would show no question content in the
  room. Merging `main` triggers the production deploy, so do not merge before agreeing the order.
