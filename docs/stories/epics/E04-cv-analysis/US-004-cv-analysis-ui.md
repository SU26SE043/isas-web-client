# US-004 CV Analysis Flow UI

## Status

in_progress

## Lane

normal

## Product Contract

Authenticated candidate uploads CV (+ optional JD), views analysis result with skill panels and improvement suggestions.

## Relevant Product Docs

- `docs/product/cv-analysis.md`

## BRD References

- FR-004–006
- SCR-CAN-021–022

## Acceptance Criteria

- `/cv-analysis` upload form with file validation UI.
- `/cv-analysis/result` shows header, left/right panels, bottom improvements.
- Loading and error states present.
- Protected route requires auth.

## Validation

| Layer | Expected proof |
| --- | --- |
| Platform | Manual: upload flow renders all panels |

## Evidence

- `src/features/cv-analysis/**`
