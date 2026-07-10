# 0008 — BRD as Product Source + Harness Foundation

## Status

Accepted

## Date

2026-07-10

## Context

ISAS Web Client has a complete BRD (21 markdown files in `BRD/`) but Harness v0 started with empty `docs/product/` and no story backlog. Agents need a clear path from business requirements to implementation without maintaining a second monolithic spec.

## Decision

1. **`BRD/` at repo root** is the canonical business specification.
2. **`docs/product/`** holds distilled frontend living contracts that link back to BRD sections — updated when client behavior ships.
3. **`docs/stories/`** holds the story backlog and packets; epics map to BRD modules (M01–M12) and screen inventory.
4. **`docs/spec-intake.md`** records how BRD entered the harness (input type: New spec).
5. Agents read BRD for business intent, product docs for shipped client contracts, stories for WIP scope.

## Alternatives considered

| Option | Why rejected |
| --- | --- |
| Move BRD under `docs/BRD/` | Team preference to keep `BRD/` at root as familiar entry point |
| Copy all FRs into `docs/product/` | Duplication drifts from BRD; violates Harness post-spec lifecycle |
| Single `SPEC.md` at root | Harness v0 deliberately excludes monolithic spec files |

## Consequences

- New features: update BRD when business rules change; update `docs/product/` when client ships; create/update story packet.
- `docs/UI_GUIDE.md` remains the UI implementation layer (not duplicated in BRD).
- Harness CLI tracks story status and proof separately from markdown.

## References

- `docs/HARNESS.md` — Spec lifecycle
- `docs/decisions/0002-post-spec-product-lifecycle.md`
- `docs/spec-intake.md`
