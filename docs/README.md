# Documentation Map

Harness + product docs for **ISAS Web Client**.

## Source hierarchy

```text
BRD/                    ← Full business specification (Vietnamese)
docs/product/           ← Frontend living contracts
docs/stories/           ← Work packets + backlog
docs/spec-intake.md     ← How BRD entered the harness
src/                    ← Implementation
```

## Main files

| File | Purpose |
| --- | --- |
| `HARNESS.md` | Agent/human collaboration loop |
| `FEATURE_INTAKE.md` | Risk lanes: tiny / normal / high-risk |
| `FRONTEND_MASTER_PLAN.md` | Development phases, screens, stories, E2E plan (sync with `product/`) |
| `ARCHITECTURE.md` | Frontend stack and boundaries |
| `CONTEXT_RULES.md` | What to read per phase and lane |
| `UI_GUIDE.md` | Dark monochrome design system |
| `spec-intake.md` | BRD intake record |

## Folders

| Folder | Purpose |
| --- | --- |
| `product/` | Shipped frontend contracts |
| `stories/` | Epics, backlog, story packets |
| `decisions/` | Architecture and process decisions |
| `templates/` | Story, decision, validation templates |

## Harness CLI

```bash
scripts/bin/harness-cli query matrix
scripts/bin/harness-cli query backlog
```

On Windows: `.\scripts\bin\harness-cli.exe`

## Current state

- Product scope v2: [`product/product-scope.md`](./product/product-scope.md) — token billing, magic-link-only B2B, assessment proctoring.
- Development plan v1.2: [`FRONTEND_MASTER_PLAN.md`](./FRONTEND_MASTER_PLAN.md) — synced 2026-07-12.
- Active stories US-001–009 in backlog; public campaign discovery (E08 US-007) **deprecated**.
- Shipped UI (mock/partial API): home, auth, CV analysis, dashboard heatmap, practice interview + history, employer campaigns (mock), magic link landing.

## Recent doc sync (2026-07-12)

- `docs/product/product-scope.md` — tiers, token billing, invite resolution, assessment summary
- `docs/product/campaign-assessment.md` — B2B proctoring flow (BR-B2B-12–23)
- `docs/product/campaign-discovery.md` — public browse out of scope
- `docs/product/payment.md` — reserve/settle B2C, postpaid B2B
- `docs/FRONTEND_MASTER_PLAN.md` v1.2 — plan aligned with product docs

## Recent doc sync (2026-07-11)

- `docs/product/cv-analysis.md` — 3-step wizard, `/candidate/cv/analysis/report`
- `docs/product/dashboard.md` — interview activity heatmap (new)
- `docs/product/practice-interview.md` — canonical `/candidate/practice/history` routes
- Stories: US-004, US-006 → `implemented`; US-005 heatmap link documented
