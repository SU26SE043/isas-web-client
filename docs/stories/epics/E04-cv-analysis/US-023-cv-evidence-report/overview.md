# US-023 Evidence-first CV Report and Source Preview

## Current Behavior

The CV result page renders top-level `strengths[]` and `weaknesses[]` as plain text. Although the
detail API already returns requirement matches with verified CV evidence, page number, and section,
the UI does not render them. CV/JD file labels are passive and cannot open the source document.
Repository-analysis source also remains in the frontend after its CV step and route were removed.

## Target Behavior

- Remove the standalone repository-analysis frontend feature.
- Arrange the CV result around summary, evidence-backed strengths/gaps, and recommendations.
- Every interactive strength/gap exposes its CV evidence, section, and page. Missing evidence is
  represented explicitly and never replaced by a fabricated quote.
- Uploaded CV and JD PDFs open in an enlarged authenticated viewer with native zoom controls.
- Evidence navigation opens the CV viewer at the relevant page.

## Affected Users

- Authenticated Candidate.

## Affected Product Docs

- `docs/product/cv-analysis.md`
- `docs/product/module-scope.md`
- `docs/product/product-scope.md`

## Non-Goals

- Changing InterviewService or AIService response contracts.
- Highlighting exact coordinates inside a PDF page.
- Deleting backend repository-analysis endpoints or admin plan entitlements.
