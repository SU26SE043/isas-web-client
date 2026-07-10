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

- BRD decomposed into product contracts and 5 active stories (US-001–005).
- App code exists for home, auth, CV analysis, practice interview (partial).
- E2E and full build pass not yet claimed — see story validation sections.
