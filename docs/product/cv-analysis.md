# CV Analysis (B2C)

BRD: FR-004–006, SCR-CAN-021–022, `BRD/Business_Rules.md` (CV validation).

## User flow

1. Authenticated candidate opens **`/candidate/cv/analysis`** (sidebar: **CV Analysis**).
2. **Step 1 — Domain:** choose one of **Frontend**, **Backend**, or **Business Analyst** (persisted in session for the flow/report).
3. **Step 2 — Upload:** attach CV (PDF/DOCX) with client-side validation.
4. **Step 3 — Job description:** paste or enter JD text for match context.
5. **Step 4 — Analysis:** progress UI while parse/analysis runs (mock or poll when API wired).
6. **Match report** at **`/candidate/cv/analysis/report`** — colored match score ring, skill radar, dimension bars, insights, skills, experience, projects, education, feedback, and actions (map to profile when API ready).

Legacy paths redirect:

| Legacy | Canonical |
| --- | --- |
| `/cv-analysis` | `/candidate/cv/analysis` |
| `/cv-analysis/result` | `/candidate/cv/analysis/report` |
| `/candidate/cv/upload` | `/candidate/cv/analysis` |

## Routes

| Path | Component | Notes |
| --- | --- | --- |
| `/candidate/cv/analysis` | `CVAnalysisPage` | 4-step wizard (`CvAnalysisStepper`) |
| `/candidate/cv/analysis/report` | `CVResultPage` | Match report sections + charts |
| `/candidate/cv/upload` | `CvUploadLegacyRedirect` | Redirect only |

## UI contract

- Wizard shell: `CvAnalysisFlowShell` + numbered stepper with step descriptions.
- Steps: `CvDomainStep`, `CvUploadStep`, `CvJobDescriptionStep`, `CvAnalysisProgressStep`.
- Domain selection uses shared `SelectionOption` tiles; domain id stored as `cv-analysis:domain` in `sessionStorage` and passed into mock submit.
- Report: `CvMatchReportHeader` (semantic-colored score ring) + `CvSkillRadarChart` + `CvDimensionScoreBars` + section cards (insights, skills, experience, projects, education, feedback).
- Chart colors use semantic tokens (`info` / `success` / `warning` / `error`) — structural chrome stays monochrome per `docs/UI_GUIDE.md`.
- Primary navigation label: **CV Analysis** only (no separate Upload CV nav item).
- Error and loading states on every async step.
- Bilingual copy via `useLanguage().t()` in `src/features/cv-analysis/languages/translations.ts`.

## API

Interview/AI services via gateway — wire when backend contract is stable. Mock fixtures in `src/features/cv-analysis/mocks/`. Submit payload includes `domain`.

## Status

**UI implemented** (wizard + report + charts, mock data). Backend presign, parse poll, and profile mapping (FR-006) pending API integration story.

## Evidence

- Commits: `fd25712`, `df97289` on `phase-4-candidate-profile-cv`
- Code: `src/features/cv-analysis/**`, `src/routes/groups/candidateRoutes.tsx`
