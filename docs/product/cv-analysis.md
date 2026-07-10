# CV Analysis (B2C)

BRD: FR-004–006, SCR-CAN-021–022, `BRD/Business_Rules.md` (CV validation).

## User flow

1. Authenticated candidate opens `/cv-analysis`.
2. Upload CV (PDF/DOCX) with optional JD text.
3. System analyzes skills, gaps, match score.
4. Result at `/cv-analysis/result` — panels for summary, skills, improvements.

## Routes

| Path | Component |
| --- | --- |
| `/cv-analysis` | `CVAnalysisPage` |
| `/cv-analysis/result` | `CVResultPage` |

## UI contract

- Sidebar for upload form; result uses header + left/right/bottom panels.
- Error and loading states required on all async actions.
- Semantic colors only for validation errors and weakness highlights.

## API

Interview/AI services via gateway — wire when backend contract is stable.

## Status

UI scaffold exists; some data may be mock until API integration story ships.
