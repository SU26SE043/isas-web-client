# US-001 Harness + BRD Foundation

## Status

in_progress

## Lane

tiny

## Product Contract

Wire `BRD/` as the project's product specification source and scaffold Harness docs (`docs/product/`, `docs/stories/`, `docs/spec-intake.md`) so agents can classify work and trace stories to BRD.

## Relevant Product Docs

- `docs/product/README.md`
- `docs/spec-intake.md`

## BRD References

- `BRD/README.md` (folder index)

## Acceptance Criteria

- `BRD/` is the canonical spec folder at repo root.
- `docs/product/` contains frontend living contracts linking to BRD.
- `docs/stories/backlog.md` lists epics and active stories.
- `AGENTS.md` and `CONTEXT_RULES.md` tell agents to read BRD for product context.
- Harness CLI has intake + story records for foundation work.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | n/a |
| Integration | n/a |
| E2E | n/a |
| Platform | `scripts/bin/harness-cli query matrix` shows seeded stories |

## Harness Delta

- Created spec intake, product contracts, story backlog, decision 0008.

## Evidence

- `docs/spec-intake.md`
- `scripts/bin/harness-cli query matrix`
