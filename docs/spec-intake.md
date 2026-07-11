# Spec Intake — ISAS Web Client

Date: 2026-07-10

## Source

- User prompt: Scaffold Harness foundation; BRD folder is product context + story backlog source.
- Attached file: `BRD/` (21 markdown files — Business Requirements Document).
- External reference: Capstone SEP490 team SU26SE043; backend ISAS engine (separate repo).

## Project Summary

**ISAS Web Client** is the frontend monolith for the ISAS platform — an AI-powered interview simulation and assessment system with two product lines on one shared engine:

- **B2C:** Personal interview practice (CV/JD → AI questions → recording → rubric scoring → history).
- **B2B:** Employer recruitment (campaign from JD → magic link → AI scoring → ranking).

The client talks to backend microservices only through **API Gateway** (`/api/v1/<service>/...`). `campaign_id` null = B2C; non-null = B2B.

## Candidate Product Docs

Living contracts under `docs/product/` — distilled from BRD, updated when behavior ships.

| File | Purpose | BRD source |
| --- | --- | --- |
| `docs/product/overview.md` | Product scope, modules, personas | `BRD/Project_Overview.md`, `BRD/Scope_and_Objectives.md` |
| `docs/product/frontend-stack.md` | React/Vite stack, folder layout, conventions | `BRD/Project_Overview.md` §4 |
| `docs/product/auth-profile.md` | Auth, roles, profile surfaces | `BRD/User_Roles_and_Permissions.md`, `BRD/Security_Requirements.md`, FR-001–003 |
| `docs/product/cv-analysis.md` | CV analysis wizard + match report | `BRD/Functional_Requirements.md` FR-004–006, SCR-CAN-021–022 |
| `docs/product/dashboard.md` | Candidate dashboard & interview heatmap | `BRD/Functional_Requirements.md` F-PROF-001, SCR-CAN-012 |
| `docs/product/practice-interview.md` | B2C practice session, result, history | `BRD/Functional_Requirements.md` FR-009–017, SCR-CAN-029–048 |
| `docs/product/api-gateway.md` | Gateway routing, client API conventions | `BRD/Integration_Requirements.md`, `BRD/Project_Overview.md` §4 |
| `docs/UI_GUIDE.md` | Dark monochrome design system (agent UI rules) | `BRD/UIUX_Specification.md` (implementation layer) |

Full business specification remains in **`BRD/`** — do not duplicate FR tables into product docs.

## Candidate Epics

| Epic | Description | Status |
| --- | --- | --- |
| E01 | Harness foundation + BRD wiring | in_progress |
| E02 | Marketing home & public pages | partial |
| E03 | Auth, session, profile | partial |
| E04 | CV analysis (B2C) | partial — wizard + report UI shipped (mock) |
| E05 | Practice interview engine (B2C) | in_progress |
| E06 | Payment & credits (B2C) | not_started |
| E07 | Campaign management (B2B) | not_started |
| E08 | Org dashboard, ranking, shortlist (B2B) | not_started |
| E09 | Admin portal | not_started |
| E10 | Reporting, notifications, integrations | not_started |

## Architecture Questions

| Question | Answer |
| --- | --- |
| Runtime stack | React 19, TypeScript, Vite, Tailwind v4, react-router-dom, zustand, react-query |
| Product surfaces | Browser SPA (responsive); no native mobile in scope |
| Storage | Client: localStorage/session for tokens; server state via API |
| External providers | API Gateway → Auth, Interview, Campaign, Payment, AI services |
| Deployment target | Docker + Nginx static; GitHub Actions CI/CD |
| Security model | JWT offline validation; RBAC (Admin, HR, Interviewer, Candidate, Guest) |

## Validation Shape

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest component/hook tests (`npm test`) |
| Integration | API client + auth interceptor against gateway (when backend available) |
| E2E | Critical flows: register → CV → practice → result (Playwright — future) |
| Platform | `npm run build` clean; responsive smoke at 320/414px |
| Release | Docker build + deploy pipeline green |

## Open Decisions

- Auth TypeScript errors (`ProtectedRoute`, `UserRole` typing) — fix before claiming build pass.
- B2B screens largely unimplemented — slice when E07 starts.
- E2E runner not configured yet — backlog item.

## First Story Candidates

- US-001 Harness + BRD foundation (this intake).
- US-002 Home landing page (implemented — mark evidence).
- US-003 Auth modal + profile (partial).
- US-004 CV analysis wizard + match report UI (**implemented** UI; API pending).
- US-005 Practice interview session + history + result (in progress).
- US-006 Candidate dashboard interview activity heatmap (**implemented** UI; mock history).

## Harness Delta

- Wired `BRD/` as product spec source in AGENTS.md and CONTEXT_RULES.md.
- Created `docs/product/*` contracts and `docs/stories/backlog.md`.
- Seeded harness-cli intake, stories, and decision records.
