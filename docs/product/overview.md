# ISAS Web Client — Product Overview

Living contract distilled from `BRD/Project_Overview.md` and `BRD/Scope_and_Objectives.md`.

## What this app is

Frontend monolith for **ISAS** — AI interview simulation and assessment. One shared interview engine serves two product lines:

| Line | `campaign_id` | User | Core value |
| --- | --- | --- | --- |
| B2C | `null` | Candidate | Self-serve practice from CV/JD, credit wallet, personal history |
| B2B | set | HR / Org | Campaign from JD, magic links, AI rubric scoring, candidate ranking |

## Modules (frontend responsibility)

| Module | BRD refs | Client status |
| --- | --- | --- |
| Public marketing | SCR-AUT-001, home | Partial (`/`) |
| Auth & profile | M01, SCR-AUT-* | Partial (modal auth, `/profile`) |
| CV analysis | M03, SCR-CAN-021–022 | Partial — wizard + report UI (`/candidate/cv/analysis`, `/candidate/cv/analysis/report`; mock) |
| Candidate dashboard | M02, SCR-CAN-012 | Partial — completeness, heatmap, metrics (`/candidate/dashboard`; mock history) |
| Practice interview | M05–M06, SCR-CAN-029–048 | In progress (`/practice`, `/candidate/practice/history`, result) |
| Payment & credits | M08, SCR-CAN-026–028 | Not started |
| Campaign discovery | M04, SCR-CAN-023-025 | Implemented (`/candidate/campaigns`, mock) |
| Campaign management (B2B) | M04, SCR-EMP-055-058 | Implemented — campaign list, wizard, detail, publish, invite (`/employer/campaigns*`; mock) |
| Employer onboarding | M04, SCR-EMP-052-054 | Implemented — dashboard, company profile, verification (`/employer/dashboard`, `/employer/company*`; mock) |
| Employer analytics (B2B) | M04/M09, SCR-EMP-059-062 | Implemented — candidate pipeline, employer profile view, AI report, analytics export (`/employer/campaigns/:id/candidates`, `/employer/candidates/:id*`, `/employer/analytics`; mock) |
| Employer billing (B2B) | M08, SCR-EMP-063-065 | Implemented — subscription plans, billing overview, payment method validation, invoices (`/employer/subscription`, `/employer/billing`, `/employer/invoices`; mock) |
| Admin | M11, SCR-ADM-* | Not started |

## Key design decisions (from BRD)

- **D1:** Interview room UI is reusable for B2B and B2C.
- **D4/D15:** Credit-based UX — show credits, not token costs.
- **D11:** Soft-delete and audit-friendly history surfaces.

## Personas

Guest, Candidate, HR, Organization, Admin — see `BRD/User_Roles_and_Permissions.md`.

## Out of scope (frontend)

Native iOS/Android, offline mode, live human video interviews — see `BRD/Scope_and_Objectives.md` §5.

## When this doc changes

Update when a module ships new routes, changes API contracts, or alters role access. Link the story packet and BRD section that drove the change.
