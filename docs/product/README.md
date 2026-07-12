# Product Docs

Living frontend contracts for **ISAS Web Client**. Distilled from `BRD/` — the full business specification stays in BRD; these files track what the **client actually implements**.

## Source hierarchy

```text
BRD/                          ← Full product spec (business truth, Vietnamese)
docs/product/*.md             ← Frontend living contracts (English, agent-readable)
docs/stories/                 ← Work packets + backlog
src/                          ← Implementation
```

When BRD and product docs disagree, BRD wins for business intent; product docs win for shipped client behavior until BRD is formally updated.

## Contracts

| File | Domain |
| --- | --- |
| [overview.md](./overview.md) | Product scope, modules, personas |
| [frontend-stack.md](./frontend-stack.md) | React/Vite conventions |
| [auth-profile.md](./auth-profile.md) | Auth, roles, profile |
| [cv-analysis.md](./cv-analysis.md) | CV analysis wizard & match report |
| [dashboard.md](./dashboard.md) | Candidate dashboard & interview heatmap |
| [practice-interview.md](./practice-interview.md) | B2C practice session |

| [campaign-management.md](./campaign-management.md) | Employer campaign lifecycle |


| [campaign-discovery.md](./campaign-discovery.md) | Candidate B2B campaign discovery |

| [organization-onboarding.md](./organization-onboarding.md) | Employer workspace onboarding |
| [employer-analytics.md](./employer-analytics.md) | Employer candidate pipeline & analytics |
| [employer-billing.md](./employer-billing.md) | Employer subscription, billing, invoices |
| [shared-engagement.md](./shared-engagement.md) | Notifications, settings, help, support |


| [api-gateway.md](./api-gateway.md) | Gateway client conventions |

## UI

Visual rules: [`docs/UI_GUIDE.md`](../UI_GUIDE.md) (not duplicated here).

## Update rule

1. Read relevant `BRD/*.md` section.
2. Update affected `docs/product/*.md`.
3. Update or create story in `docs/stories/`.
4. Update proof: `scripts/bin/harness-cli story update`.
