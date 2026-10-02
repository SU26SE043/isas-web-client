# Exec Plan

## Goal

Make the campaign sitting length and attempt limit real, server-enforced rules in the web client
without breaking anything while the Backend still runs pre-ATT1 code.

## Scope

In scope:

- F1 wizard step 5 attempt rules + Review row.
- F2 Campaign Detail card + increase dialog.
- F3 candidate campaign page states, confirm dialog, card line, `ATTEMPT_LIMIT_REACHED`.
- F4 `begin` on room entry + server-time sitting clock that never pauses.
- F5 time-up handling and the new 409 codes.
- F6 real run on dev through the UI.

Out of scope:

- Server-held per-question timer; countdown on card/page; “attempt n” in HR results.
- B2C practice behaviour.
- Backend work (ATT1-B1..B3 live in the Backend repo).

## Risk Classification

Risk flags:

- Organization credit consumption (each retake costs 1 credit).
- Exam integrity (attempt limit, clock, auto-submit) on the B2B anti-cheat room.
- Cross-service contract: one renamed JSON key silently blanks a screen or disables a rule.
- Deploy order between Frontend (Vercel) and Backend.

Hard gates:

- Contract block hash `7e4792f993948da2` matches in both specs; JSON keys in services/mappers
  match each `[C*]`/`[I*]` line the slice touches.
- Absent ATT1 fields ⇒ exactly today's behaviour.
- Frontend reaches production before Backend ATT1.

## Work Phases

WIP = 1. Each slice: implement → independent check (“KIỂM”: typecheck, `npm test` ≥ baseline
2123 passed / 339 files, `check:i18n`, `check:ui-size`, `check:radius`, `build`,
`test:e2e:smoke`, contract hash, ≥ 5 mutations that must turn tests red) → PASS before the next
slice; FAIL ⇒ a separate `fix(att1-fx)` commit for exactly the failed items.

1. F1 — done (`0591c6d6`, fix `8be01a9e`).
2. F2 — done (`e3ec89b9`, fix `db8ec0e1`).
3. F3 — done (`f7e02808`, fix `4c82d23e`).
4. F4 — in progress.
5. F5 — in progress.
6. F6 — after F1–F5 pass and Backend ATT1-B1..B3 is on dev.

## Stop Conditions

Pause for human confirmation if:

- The contract hash or a JSON key differs between the Backend and Frontend specs.
- Backend ATT1 is not on dev when F6 is due.
- Anyone proposes merging `main` (production deploy) before the Frontend-first order is agreed.
- Validation requirements need to be weakened.
