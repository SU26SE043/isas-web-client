# US-004 CV Analysis Flow UI

## Status

implemented

## Lane

normal

## Product Contract

Authenticated candidate completes a **3-step CV analysis wizard** (upload → JD → progress), then views a **match report** with skills, experience, and improvement sections.

## Relevant Product Docs

- `docs/product/cv-analysis.md`

## BRD References

- FR-004–006
- SCR-CAN-021–022

## Acceptance Criteria

- [x] `/candidate/cv/analysis` — wizard with file validation on step 1.
- [x] Step 2 — JD input before analysis.
- [x] Step 3 — analysis progress UI.
- [x] `/candidate/cv/analysis/report` — match report with header, insights, skills, experience, projects, education, feedback.
- [x] Legacy routes redirect to canonical paths.
- [x] `/candidate/cv/upload` redirects to analysis entry (no standalone upload nav).
- [x] Loading and error states on async steps.
- [x] Protected route requires auth.
- [ ] API presign, parse poll, profile mapping (FR-006) — deferred to API integration.

## Validation

| Layer | Expected proof |
| --- | --- |
| Platform | `npm run dev` — wizard steps and report render; `npm run check:i18n` pass |
| API | Pending backend contract |

## Evidence

- `src/features/cv-analysis/**`
- Commits: `fd25712`, `df97289` (`phase-4-candidate-profile-cv`)
