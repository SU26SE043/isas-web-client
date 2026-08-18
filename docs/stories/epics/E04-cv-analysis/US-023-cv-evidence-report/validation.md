# Validation

## Proof Strategy

Prove that the report never invents evidence, that authenticated file blobs are cleaned up, that
source controls work at responsive sizes, and that removing repository analysis leaves no imports or
routes behind.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Group Strong vs Partial/Weak; detect verified vs missing evidence; construct PDF page hash |
| Integration | Service returns an authenticated PDF blob; viewer handles success/retry/cleanup |
| E2E | Open a CV report, select strength/gap evidence, open CV/JD source viewer |
| Platform | Production build, i18n parity, UI file-size limit |
| Performance | Blob requested only when a viewer opens; URL revoked when it closes |
| Logs/Audit | No raw API errors or source content logged |

## Fixtures

- Analysis with one Strong match containing verbatim evidence and page/section metadata.
- Analysis with one Partial match containing evidence.
- Analysis with one Weak match using `Không thấy bằng chứng`.
- Uploaded CV and JD PDF blobs.
- Legacy/no-JD analysis with no requirement matches.

## Commands

```text
npm test -- --run
npm run check:i18n
npm run check:ui-size
npm run build
npx playwright test e2e/specs/b2c/cv-upload.spec.ts
```

## Acceptance Evidence

- Unit/component/service: 6 CV-analysis test files, 21 tests passed, covering grouping, sentinel
  rejection, page hashes, evidence disclosure, legacy fallback, and authenticated PDF blobs.
- E2E: `e2e/specs/b2c/cv-upload.spec.ts` passed 3/3 in Chromium, including upload → report → exact
  quote → CV viewer → JD viewer.
- Browser QA: verified at 1280×720, 768×900, and 375×812. All widths reported
  `scrollWidth === clientWidth`; strengths/gaps stack at responsive breakpoints; no console warnings
  or errors were emitted.
- Viewer QA: CV evidence opened with `#page=1&zoom=page-width`; JD opened in the same enlarged
  authenticated viewer; the Weak fixture displayed the explicit no-evidence state without a quote.
- Platform: typecheck, i18n parity, UI-size limit, and production build passed. The build retains the
  existing bundle chunk-size advisory only.
- Full Vitest run reached 405/408 passing; its only failures came from the user's unrelated,
  untracked `src/features/practice/hooks/useQuestionSpeech.test.ts`. The CV-analysis suite is green
  and those practice files were neither modified nor staged by this story. Re-running the suite
  with that one unrelated file excluded passed 403/403.
- Harness friction: the checkout does not contain `scripts/bin/harness-cli`, and the project-scoped
  UI skill paths named by the repository instructions are absent. Validation was recorded in this
  story packet and performed against `docs/UI_GUIDE.md` plus the browser workflow instead.
