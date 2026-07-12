# Product Docs

Living frontend contracts for **ISAS Web Client**. Distilled from `BRD/` — the full business specification stays in BRD; these files track what the **client actually implements**.

## Source hierarchy

```text
BRD/                          ← Full business spec (business truth, Vietnamese)
docs/product/product-scope.md ← Product definition (discovery — authoritative for product)
docs/product/module-scope.md  ← Modules, routes, screen inventory
docs/product/*.md             ← Per-domain living contracts
docs/stories/                 ← Work packets + backlog
src/                          ← Implementation
```

When BRD and product docs disagree on **business intent**, update BRD after discovery sign-off. For **shipped client behavior**, `docs/product/*` wins until code changes.

## Product foundation (start here)

| File | Domain |
| --- | --- |
| [product-scope.md](./product-scope.md) | Product definition, tiers, workflows, business rules |
| [module-scope.md](./module-scope.md) | Module map, routes, screen inventory, gaps, discovery reconcile |

## Domain contracts

| File | Domain |
| --- | --- |
| [overview.md](./overview.md) | Short module status summary |
| [frontend-stack.md](./frontend-stack.md) | React/Vite conventions |
| [auth-profile.md](./auth-profile.md) | Auth, roles, profile |
| [cv-analysis.md](./cv-analysis.md) | CV analysis wizard & match report |
| [dashboard.md](./dashboard.md) | Candidate dashboard & interview heatmap |
| [practice-interview.md](./practice-interview.md) | B2C practice session |
| [payment.md](./payment.md) | Token billing, B2C wallet, B2B invoices |
| [campaign-management.md](./campaign-management.md) | Employer campaign lifecycle |
| [campaign-discovery.md](./campaign-discovery.md) | Magic link entry; public browse deprecated |
| [campaign-assessment.md](./campaign-assessment.md) | B2B assessment interview, proctoring, violations |
| [organization-onboarding.md](./organization-onboarding.md) | Employer workspace onboarding |
| [employer-analytics.md](./employer-analytics.md) | Employer candidate pipeline & analytics |
| [api-gateway.md](./api-gateway.md) | Gateway client conventions |

## UI

Visual rules: [`docs/UI_GUIDE.md`](../UI_GUIDE.md) (not duplicated here).

## Update rule

1. Read [`product-scope.md`](./product-scope.md) and relevant `BRD/*.md`.
2. Update affected `docs/product/*.md` and [`module-scope.md`](./module-scope.md) if routes/modules change.
3. Update or create story in `docs/stories/`.
4. Update proof: `scripts/bin/harness-cli story update`.
