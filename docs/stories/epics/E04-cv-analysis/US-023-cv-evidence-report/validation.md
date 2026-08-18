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

Pending implementation and verification.
