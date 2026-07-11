# CV Analysis (B2C)

BRD: FR-004–006, SCR-CAN-021–022, `BRD/Business_Rules.md` (CV validation).

## User flow

1. Authenticated candidate opens **`/candidate/cv/analysis`** (sidebar: **CV Analysis**).
2. **Step 1 — Upload:** attach CV (PDF/DOCX) with client-side validation.
3. **Step 2 — Job description:** paste or enter JD text for match context.
4. **Step 3 — Analysis:** progress UI while parse/analysis runs (mock or poll when API wired).
5. **Match report** at **`/candidate/cv/analysis/report`** — match score, insights, skills, experience, projects, education, feedback, and actions (map to profile when API ready).

Legacy paths redirect:

| Legacy | Canonical |
| --- | --- |
| `/cv-analysis` | `/candidate/cv/analysis` |
| `/cv-analysis/result` | `/candidate/cv/analysis/report` |
| `/candidate/cv/upload` | `/candidate/cv/analysis` |

## Routes

| Path | Component | Notes |
| --- | --- | --- |
| `/candidate/cv/analysis` | `CVAnalysisPage` | 3-step wizard (`CvAnalysisStepper`) |
| `/candidate/cv/analysis/report` | `CVResultPage` | Match report sections |
| `/candidate/cv/upload` | `CvUploadLegacyRedirect` | Redirect only |

## UI contract

- Wizard shell: `CvAnalysisFlowShell` + numbered stepper with step descriptions.
- Steps: `CvUploadStep`, `CvJobDescriptionStep`, `CvAnalysisProgressStep`.
- Report: `CvMatchReportHeader` + section cards (insights, skills, experience, projects, education, feedback).
- Primary navigation label: **CV Analysis** only (no separate Upload CV nav item).
- Error and loading states on every async step.
- Semantic colors for validation errors and weakness highlights only; structural UI stays monochrome per `docs/UI_GUIDE.md`.
- Bilingual copy via `useLanguage().t()` in `src/features/cv-analysis/languages/translations.ts`.

## API

Interview/AI services via gateway — wire when backend contract is stable. Mock fixtures in `src/features/cv-analysis/mocks/`.

## Status

**UI implemented** (wizard + report, mock data). Backend presign, parse poll, and profile mapping (FR-006) pending API integration story.

## Evidence

- Commits: `fd25712`, `df97289` on `phase-4-candidate-profile-cv`
- Code: `src/features/cv-analysis/**`, `src/routes/groups/candidateRoutes.tsx`
