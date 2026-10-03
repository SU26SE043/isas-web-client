# QBK1 Question Bank Draw Count

## Status

implemented

## Lane

normal — bounded step 4 behavior correction; existing candidate totals and API contract stay unchanged.

## Product Contract

`questionsPerSession` is K, the total base questions received by each candidate, including required questions. In draw mode, HR enters the count taken from the optional pool. The UI converts that count to K and derives displayed values from the backend selection rule. Full-bank mode uses `null`.

## Relevant Product Docs

- `docs/product/product-scope.md`
- `docs/product/campaign-management.md`
- `docs/FRONTEND_MASTER_PLAN.md` Phase 10
- `QBK1Frontend.docx` supplied with the request (QBK1-F1–F3 and contract K1–K5)

## Acceptance Criteria

- One fixed and three pool questions with K=3 show two drawn and three received.
- Changing a question from pool to required keeps K and the received total unchanged.
- Entering a draw count writes fixed plus draw as K, bounded to the bank and backend maximum of 20.
- Saved Draft K values outside the valid total range normalize once without changing the actual received count.
- The pool heading shows the computed draw and pool size in Vietnamese and English.
- No API, payload, mapper, review, settings, detail, or results contract changes.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Exhaustive pure-function matrix, five contract examples, rendered step 4 input tests |
| Integration | No API shape change; existing suite passes |
| E2E | Chromium smoke run if local browser is available |
| Platform | `typecheck`, `check:i18n`, `check:ui-size`, `build` |
| Release | Push a new branch based on `refs/remotes/upstream/main` |

## Evidence

- `npm run typecheck` passed.
- `npm test -- --maxWorkers=4`: 373 files, 2451 tests passed (baseline: 372 files, 2437 tests).
- `npm run check:i18n`, `npm run check:ui-size`, and `npm run build` passed.
- `npm run test:e2e:smoke -- --workers=1`: 28 Chromium tests passed.
- Temporary browser fixture checked the step 4 draw input, computed summary, and pool heading at desktop and 768px. Screenshots were saved under ignored `test-results/qbk1-*.png`; the temporary spec was removed after validation. Further mobile QA was stopped at the user's request.
- The source document's K1–K6 block matched SHA256-16 `8d807559a83d0239`.

Six compile-valid mutations were each caught by the relevant test, then the original file hash and passing test result were restored:

| Mutation | Detecting test |
| --- | --- |
| Omit fixed count when writing K | Pure-function round trip |
| Omit fixed subtraction when reading draw | K1–K5 examples and exhaustive matrix |
| Permit zero K with no fixed question | Draw bounds |
| Raise the server K limit to 21 | Explicit limit assertion |
| Bypass the draw adapter at the step 4 input | Rendered step 4 input test |
| Replace only the first repeated title token | Pool heading template test |
