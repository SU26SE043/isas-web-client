# ISAS Web Client — Product Overview

Short summary. **Authoritative scope:** [`product-scope.md`](./product-scope.md) · **Modules & routes:** [`module-scope.md`](./module-scope.md).

## What this app is

Frontend monolith for **ISAS** — AI interview simulation and assessment. One shared interview engine serves two product lines:

| Line | `campaign_id` | User | Core value |
| --- | --- | --- | --- |
| B2C | `null` | Candidate | Practice, learning roadmap, prepaid wallet (token settle) |
| B2B | set | HR / Organize | Campaigns, magic-link invites, AI scoring, ranking |

**Deliverable:** Production-ready for **limited beta users**.

## Modules (frontend responsibility)

| Module | Tier | Client status |
| --- | --- | --- |
| Public marketing | T2 | Partial (`/`, `/pricing`, `/enterprise`) |
| Auth & profile | T1 | Partial |
| CV analysis | T1 | Partial — `/candidate/cv/analysis*` (mock) |
| Candidate dashboard | T1 | Partial — `/candidate/dashboard` (mock) |
| Interview practice | T1 | In progress — `/practice`, `/interview/*`, history |
| Learning roadmap | T1 | Partial — `/candidate/roadmap` |
| Payment & token billing | T1 | Routes exist; **token model not implemented** |
| Magic link (B2B candidate) | T1 | `/invite/:token` |
| ~~Campaign discovery (public)~~ | — | **Out of scope** — deprecate `/candidate/campaigns*` |
| Campaign management (B2B) | T1 | `/employer/campaigns*` (mock) |
| Org onboarding | T1 | `/employer/company*` (mock) |
| Employer analytics | T1 | `/employer/analytics`, candidates (mock) |
| B2B billing / invoices | T1 | **Missing routes** |
| Admin | T1 | Placeholder `/admin` |
| Learning hub | T3 | Placeholder — backlog |
| Leaderboard / certificate | T2 | Placeholder |

## Key product decisions (discovery)

- **D1:** Interview room UI reusable for B2B and B2C.
- **Billing:** Token-based usage — show tokens to users; B2C prepaid reserve/settle; B2B postpaid monthly invoice.
- **B2B entry:** Magic link only; **registered email → immediate campaign list row**; existing user signs in via link.
- **Verify gate:** Unverified org cannot create or publish campaigns.
- **Accounts:** One email = one role.
| Admin | M11-M12, SCR-ADM-069-088 | Implemented - Admin dashboard, users, RBAC, audit, AI/system config, flags, health, maintenance, support queues (`/admin/*`; mock) |

## Key design decisions (from BRD)

- **D1:** Interview room UI is reusable for B2B and B2C.
- **D4/D15:** Credit-based UX — show credits, not token costs.

- **D11:** Soft-delete and audit-friendly history surfaces.

## Personas

Guest, Candidate, HR, Organize, Admin — see [`product-scope.md`](./product-scope.md) §3.

## Out of scope (frontend)

- Public campaign discovery (`/candidate/campaigns*`)
- Native iOS/Android, offline mode, live human video interviews
- Learning Hub (Tier 3), ATS webhooks (Tier 3)

## When this doc changes

Update when product scope or module map changes. Link story packet and BRD section if BRD intent shifts.
