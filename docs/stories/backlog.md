# Story Backlog — ISAS Web Client

Sliced from `BRD/Functional_Requirements.md` modules and `BRD/Screen_Inventory.md`. Create story **packets** only when work is selected (Harness rule).

## Epics

| Epic | Description | BRD module | Status |
| --- | --- | --- | --- |
| E01 | Harness foundation + BRD wiring | — | in_progress |
| E02 | Marketing home & employer section | Public | partial |
| E03 | Auth modal, session, profile | M01 | partial |
| E04 | CV analysis UI (wizard + report) | M03 | partial |
| E05 | Practice interview, result, history | M05–M06 | in_progress |
| E06 | Payment, credits, subscription (B2C) | M08 | not_started |
| E07 | Campaign create, magic link (B2B) | M04 | implemented |
| E08 | Campaign discovery, org dashboard, ranking, analytics | M04, M09 | in_progress |
| E09 | Admin portal & audit | M11–M12 | not_started |
| E10 | Notifications, reporting, ATS hooks | M09–M10 | not_started |

## Active stories

| ID | Title | Epic | Lane | Status | Packet |
| --- | --- | --- | --- | --- | --- |
| US-001 | Harness + BRD foundation | E01 | tiny | in_progress | [US-001](./epics/E01-foundation/US-001-harness-brd-foundation.md) |
| US-002 | Home landing page | E02 | normal | implemented | [US-002](./epics/E02-marketing/US-002-home-landing.md) |
| US-003 | Auth modal + profile | E03 | high-risk | in_progress | [US-003](./epics/E03-auth/US-003-auth-profile.md) |
| US-004 | CV analysis flow UI | E04 | normal | implemented | [US-004](./epics/E04-cv-analysis/US-004-cv-analysis-ui.md) |
| US-005 | Practice interview B2C | E05 | normal | in_progress | [US-005](./epics/E05-practice/US-005-practice-interview.md) |
| US-006 | Candidate dashboard heatmap | E03 | normal | implemented | [US-006](./epics/E03-auth/US-006-candidate-dashboard.md) |
| US-007 | Campaign management employer workflow | E07 | normal | implemented | [US-007](./epics/E07-campaign-management/US-007-campaign-management.md) |
| US-007 | Campaign discovery candidate entry | E08 | normal | implemented | [US-007](./epics/E08-campaign-discovery/US-007-campaign-discovery.md) |
| US-008 | Organization onboarding employer entry | E08 | normal | implemented | [US-008](./epics/E08-org-onboarding/US-008-organization-onboarding.md) |
| US-009 | Employer analytics and candidate pipeline | E08 | normal | implemented | [US-009](./epics/E08-employer-analytics/US-009-employer-analytics.md) |

## How to pick work

1. `scripts/bin/harness-cli query matrix` — proof status.
2. Choose one story `planned` or `in_progress` (WIP=1).
3. Read story packet + linked `docs/product/*` + `BRD/` sections.
4. Implement → validate → `story update` → trace.

## BRD traceability

| Story | BRD functional reqs | Screen IDs |
| --- | --- | --- |
| US-003 | FR-001–003 | SCR-AUT-002–005, SCR-CAN-013 |
| US-004 | FR-004–006 | SCR-CAN-021–022 |
| US-005 | FR-009–017 | SCR-CAN-029–048 |
| US-006 | F-PROF-001 | SCR-CAN-012 |
| US-007 | FR-095-159 | SCR-EMP-055-058 |
| US-007 | FR-095-124 (candidate-facing) | SCR-CAN-023-025 |
| US-008 | FR-060-064 | SCR-EMP-052-054 |
| US-009 | FR-195-224 | SCR-EMP-059-062 |

Full FR list: `BRD/Functional_Requirements.md`.
