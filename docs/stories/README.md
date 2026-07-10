# Stories

Work packets that turn BRD intent into bounded implementation. Backlog: [`backlog.md`](./backlog.md).

## Structure

```text
docs/stories/
  backlog.md                    ← Epic list + active stories
  epics/
    E01-foundation/US-001-*.md
    E02-marketing/US-002-*.md
    E03-auth/US-003-*.md
    ...
```

## Normal story

Use `docs/templates/story.md`. Path: `docs/stories/epics/<Epic>/US-XXX-<slug>.md`.

## High-risk story

Use `docs/templates/high-risk-story/` for auth, payment, security changes.

## Status flow

```text
planned → in_progress → implemented
              ↓
           changed → retired
```

## BRD traceability

Every story packet should list:

- BRD functional requirement IDs (FR-xxx)
- Screen IDs (SCR-xxx) when UI work
- Linked `docs/product/*.md` contract

## Durable layer

Register stories in harness DB:

```bash
scripts/bin/harness-cli story add --id US-005 --title "Practice interview" --lane normal
scripts/bin/harness-cli story update --id US-005 --status in_progress
```

Query proof: `scripts/bin/harness-cli query matrix`
