# US-004 CV Analysis Flow UI

## Status

implemented

## Lane

normal

## Product Contract

Authenticated candidate completes a **4-step CV analysis wizard** (domain → upload → JD → progress), then views a **match report** with skill radar, dimension score bars, skills, experience, and improvement sections. Selective CV-to-profile mapping with merge strategy.

## Relevant Product Docs

- `docs/product/cv-analysis.md`
- `docs/product/profile.md`

## BRD References

- FR-004–006
- SCR-CAN-021–022

## Acceptance Criteria

- [x] `/candidate/cv/analysis` — wizard with domain selection on step 1, file validation on step 2.
- [x] Step 3 — JD input before analysis.
- [x] Step 4 — analysis progress UI with parse error recovery (ERR-021–025 mock).
- [x] `/candidate/cv/analysis/report` — match report with header, colored charts, insights, skills, experience, projects, education, feedback.
- [x] CV-to-profile mapping with per-section toggles and merge (FR-006 mock).
- [x] `analysisId` persisted in session; report loads from last analysis.
- [x] Legacy routes redirect to canonical paths.
- [x] `/candidate/cv/upload` redirects to analysis entry (no standalone upload nav).
- [x] Protected route requires auth.
- [x] E2E: `e2e/specs/b2c/cv-upload.spec.ts`.
- [ ] API presign, parse poll — deferred to backend integration.

## Validation

| Layer | Expected proof |
| --- | --- |
| E2E | `e2e/specs/b2c/cv-upload.spec.ts` |
| Platform | `npm run build`, `npm run check:i18n` |

## Evidence

- `src/features/cv-analysis/**`
