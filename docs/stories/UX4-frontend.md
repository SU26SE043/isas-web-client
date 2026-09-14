# UX4 Frontend usability pass

## Status

F1–F5 implemented; F6 live API wiring and the authenticated create/edit
journey are verified. F8 aligns adaptive-budget calculation with the backend
question-bank fallback and wires server warnings into the Questions step.
Publish and invitation actions remain gated on explicit user confirmation
during manual verification.
The required full-suite baseline has pre-existing failures outside the UX4
scope.

## Lane

Normal. This is a bounded frontend change request from `UX4Frontend.docx`:
layout, copy, navigation affordances, shared calculation display, dead-code
cleanup, and touch-target review. The brief explicitly forbids API contract,
mapper, migration, and backend changes.

## Product contract

Source brief: `C:/Users/HP/Downloads/UX4Frontend.docx` supplied by the user.
Relevant contracts: `docs/product/campaign-management.md`,
`docs/product/product-scope.md`, `docs/product/module-scope.md`, and the
campaign-management section of `docs/FRONTEND_MASTER_PLAN.md`.

F5 reconciliation: the user confirmed that the UX4 brief takes precedence for
the wizard cleanup. `docs/product/campaign-management.md` now records that
location remains read-only in list/detail responses but is not collected or
persisted by the create/edit wizard.

## Baseline

Measured on the new branch from local `upstream/dev` on 2026-09-07 with the
required command `npm test -- --watch=false`: 183 test files, 1032 tests, 4
failed. Existing failures are in `AuthModal`, `EndCampaignDialog`, and
`usePracticeSetupFlow`; UX4 work must not claim or repair them unless a UX4
change directly affects them.

## Acceptance criteria

1. F1: an empty criteria step is neutral and inviting; no premature error,
   summary strip, or table header is shown, and the standard/manual paths are
   clear in both Vietnamese and English.
2. F2: criterion names wrap instead of truncating, descriptions have usable
   space, and the repeated context label is removed.
3. F3: completed wizard steps are keyboard-accessible buttons with visible
   focus and `aria-current` on the current step; save status uses one three-state
   vocabulary.
4. F4: review shows `maxDeepPerQuestion`, the shared adaptive-budget result,
   an actionable overflow warning, and a clear publish affordance state.
5. F5: remove confirmed dead location code and meet the specified touch-target
   audit without shrinking text or adding non-token chrome.
6. F6: complete the employer flow manually in the real UI, record every issue,
   and separate UX4 fixes from follow-up backlog items.

## Validation

After each accepted step: required unit suite, typecheck, i18n parity,
UI-size, build, relevant E2E/manual checks, and before/after screenshots for
UI changes. Use `npm test -- --watch=false`; do not substitute `npx vitest run`
or `npm test -- --run`. Restore any build-generated
`src/environments/environment.prod.ts` change before committing. One branch/PR
and one atomic commit per accepted UX4 step; push each commit to `upstream`.

F1 evidence: focused rubric tests 9 passed; `npm run typecheck`,
`npm run check:i18n`, `npm run check:ui-size`, and `npm run build` passed;
the full suite passed at 184 files / 1037 tests.
F2 evidence: focused rubric tests 11 passed; `npm run typecheck`,
`npm run check:i18n`, `npm run check:ui-size`, and `npm run build` passed;
the full suite passed at 184 files / 1039 tests.
F3 evidence: focused wizard/rubric tests 21 passed; `npm run typecheck`,
`npm run check:i18n`, `npm run check:ui-size`, and `npm run build` passed;
the full suite passed at 185 files / 1049 tests.
F4 evidence: adaptive-budget/review tests 8 passed; `npm run typecheck`,
`npm run check:i18n`, `npm run check:ui-size`, and `npm run build` passed.
The full suite finished at 183 passed files / 4 failed files and 1049 passed /
8 failed tests; all failures are outside F4 in the existing AuthModal,
EndCampaignDialog, AudioRecorderModal, and RoadmapNameEditor tests.
F5 evidence: removed the unused location wizard component/provider, provider
environment setting, wizard location state/hydration, location i18n keys, and
obsolete location tests; retained response-only location data for list/detail.
Focused post-cleanup campaign tests passed 11/11; `npm run typecheck`,
`npm run check:i18n`, `npm run check:ui-size`, and `npm run build` passed.
The required full suite finished at 182 passed files / 3 failed files and
1048 passed / 4 failed tests; failures are outside F5 in AuthModal,
EndCampaignDialog, and EmployerInvoicesPage. The unauthenticated browser
guard was also verified before the live Employer session was supplied.

F6 verification: the Employer session now reaches the real dev gateway through
the local Vite `/api` proxy. The authenticated UI verified campaign list/detail
GET, the seven-step create flow with live campaign POST, rubric/questions/
settings payloads, AI question generation, interview-slot GET/POST, and draft
edit with live metadata PUT plus questions PUT. The first edit attempt exposed
that the gateway requires `title` and `domain` even for a partial metadata
update; the request builder now echoes those identity fields while retaining
dirty-field behavior. The live detail confirmed the updated pass score.

F6 issue log and follow-ups (not UX4 fixes): Publish and Send Invitations are
representational actions and were intentionally not clicked without an
action-time confirmation. The fallback
`npm run test:e2e -- e2e/specs/b2b/campaign-slots.spec.ts --project=chromium`
still needs a separate run against the authenticated fixture; its previous
attempt failed at page-load/selector timeouts before the slots, invitation-
capacity, and edit/jump checks could run.

## F8 evidence — backend-aligned adaptive budget and question-bank warnings

- Rebased `codex/ux4-frontend` onto `upstream/dev` at `82979ef` and retained
  both sides of the three requested conflicts: rubric input preservation and
  the UX4 empty state; semantic stepper tokens and clickable navigation; UX3
  adaptive 400-detail mapping/draft-bank behavior and UX4 location cleanup.
- `calculateAdaptiveQuestionBudget` is now the single rule used by settings,
  review, and the adaptive 400-message builder. When K is empty, review and
  settings use `questions.length`; K=20/depth=3 yields 80 and blocks publish,
  while K=5/depth=3 yields 20 and allows publish.
- Server `questionBankWarnings` is passed from the mapped campaign through
  `CampaignWizardForm` and rendered line-for-line by `CampaignQuestionsStep`.
- Full baseline: 189 files / 1069 tests passed. Typecheck, i18n parity (16
  files), UI-size, and build passed; `src/environments` remained clean.
- Mutation results: M1 wrong settings base — red; M2 removed warning prop — red;
  M3 removed `+1` — red; M4 removed `ADAPTIVE_BUDGET_TOO_SMALL` branch — red.
  Each mutant was restored with matching SHA256 and mtime before the final
  baseline run.
- Visible browser verification reached the shared login guard at
  `/employer/campaigns/new`; an authenticated session was unavailable in the
  local browser, so the two review screenshots and real publish confirmation
  remain pending rather than being claimed as complete.

## F9 evidence — separate question-bank cap from per-session setting

- Removed the four remaining `settings.maxQuestions` gates from
  `useCampaignWizard`: explicit AI generation, system-default generation,
  question-bank save, and manual question insertion now use the shared hard
  cap of 20. The per-session setting remains unchanged at its default of 5.
- Removed the same cross-field comparison from the wizard validator so a
  20-question bank can continue to Review; `settings.maxQuestions` remains
  reserved for the per-session/adaptive rule.
- Removed the dead `effectiveMaxQuestions` helper, `countCampaignMax` branch,
  and both unused validation translations. `questionLimit` remains and now
  receives the hard cap value (20).
- Added the hook source-guard with comment stripping and callback-level checks,
  plus boundary tests for generation counts 20/21 and the default-generation
  path.
- Mutation evidence: M1 restored add-manual to `settings.maxQuestions` and the
  guard went red; M2 changed the hard cap to 5 and the 20-question assertions
  went red; M3 removed the hook guard and M1 went green again. Each restored
  file matched its pre-mutation SHA256 and mtime.
- Final full baseline after restoration: 188 files passed, 1069/1070 tests
  passed; the remaining existing timeout is in `AuthModal`. The required
  browser flow remains blocked at the shared login guard because no
  authenticated session was supplied; no real publish success is claimed.
