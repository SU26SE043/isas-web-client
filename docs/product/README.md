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
| [cv-analysis.md](./cv-analysis.md) | CV upload & analysis |
| [practice-interview.md](./practice-interview.md) | B2C practice session |
| [api-gateway.md](./api-gateway.md) | Gateway client conventions |

## UI

Visual rules: [`docs/UI_GUIDE.md`](../UI_GUIDE.md) (not duplicated here).

## Update rule

1. Read relevant `BRD/*.md` section.
2. Update affected `docs/product/*.md`.
3. Update or create story in `docs/stories/`.
4. Update proof: `scripts/bin/harness-cli story update`.
