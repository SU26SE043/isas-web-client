# Design

## Domain Model

`RequirementMatch` remains the evidence unit: requirement text, priority, level, verified evidence,
page, and section title. `Strong` matches appear as strengths; `Partial` and `Weak` matches appear as
gaps. The backend sentinel `Không thấy bằng chứng` means absence, not a quote.

## Application Flow

1. Load the analysis detail through the existing React Query hook.
2. Derive evidence groups from `mustHaveMatches` and `niceToHaveMatches`.
3. Selecting a match opens its evidence details; if a verified quote exists, the candidate may open
   the CV PDF at the reported page.
4. Selecting the CV or JD source loads the authenticated download as a blob, creates an object URL,
   and embeds the PDF in a dialog. Object URLs are revoked on close/unmount.

## Interface Contract

No public API change. The UI consumes:

- `GET /api/v1/interview/practice/cv-analysis/{id}`
- `GET /api/v1/interview/files/{id}/download`

The report uses `cvId`, nullable `jdId`, requirement matches, `evidence`, `page`, and
`sectionTitle`. A text-only JD cannot be reconstructed from the detail response and is labelled as
text input rather than offered as a PDF.

## Data Model

No schema, migration, or durable client record changes.

## UI / Platform Impact

- Desktop: summary and score hierarchy followed by evidence columns and recommendations.
- Tablet/mobile: single-column cards and a near-full-screen document dialog.
- PDF zoom and paging use the browser's embedded PDF viewer; open-in-tab and download remain
  available fallbacks.
- All visible copy is bilingual and all report files remain below 250 lines.

## Observability

Blob-load failures map through the existing CV analysis error boundary and render retry UI without
exposing raw errors.

## Alternatives Considered

1. Infer evidence for `strengths[]`/`weaknesses[]` with string matching. Rejected because it can
   associate an AI summary with the wrong CV sentence.
2. Add a PDF rendering dependency. Rejected because the native browser viewer already supplies zoom,
   paging, print, and download without increasing bundle size.
3. Display unsupported evidence for legacy/no-JD reports. Rejected; the UI states that evidence is
   unavailable and recommends analysis with a JD.
