# CV Analysis (B2C)

BRD: FR-004–006, SCR-CAN-021–022.

## User flow

1. **Domain** → `jobCategory` integer (`1` Frontend · `2` Backend · `3` BA).
2. **Upload CV** PDF ≤10MB → `POST /api/v1/campaign/api/files/upload?fileType=cv` → toast success · store `cvId`.
3. **Upload JD** (optional) PDF → `...?fileType=jd` → store `jdId` or `null`.
4. **Analyze CV** button → `POST /api/v1/campaign/api/practice/cv-analysis` `{ cvId, jdId, jobCategory }`.
5. **Report** from response fields only + history `GET .../practice/cv-analysis`.

## Base URL

`VITE_API_BASE_URL` = gateway **origin only** (no `/api` suffix). Paths below are absolute from the app root.

| Action | Path |
| --- | --- |
| Upload | `/api/v1/campaign/api/files/upload?fileType=cv\|jd` |
| Analyze | `/api/v1/campaign/api/practice/cv-analysis` |
| History | `/api/v1/campaign/api/practice/cv-analysis` |

Auth: `Authorization: Bearer {accessToken}` via `apiClient`.

## Components

`UploadCV` · `UploadJD` · `AnalyzeButton` · `ReportHeader` · `SummaryCard` · `StrengthCard` · `WeaknessCard` · `SuggestionCard` · `JDMatchCard` · `ReportHistoryList`

## Status

Live API only (`LIVE_API_DOMAINS` includes `cv-analysis`). No runtime mock fixtures.
