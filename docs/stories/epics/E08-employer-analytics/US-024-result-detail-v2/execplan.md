# Exec Plan

## Goal

Ship the employer campaign result detail v2 review experience on
`/employer/campaigns/:id/results/:sessionId`.

## Scope

In scope:

- API types, tolerant parsers, endpoints, services, React Query hooks.
- Detail header, metrics, adjustment history, question cards, audio player,
  responsive question navigation, view-model tests, and i18n.
- Browser verification and upstream branch publication.

Out of scope:

- Ranking table, CSV, proctoring analysis, backend, and existing dialogs.

## Risk Classification

Risk flags:

- Public API contract, audit/security, existing behavior, cross-platform UI,
  and weak proof.

Hard gates:

- Preserve role-scoped endpoints and existing override validation.

## Work Phases

1. Discovery and baseline gates.
2. Add parsed API contracts and service tests.
3. Add hooks and focused detail components.
4. Wire the page and localized copy.
5. Run unit, type, i18n, UI-size, build, and smoke checks.
6. Record Harness proof, commit, and push `feat/result-detail-v2` to `upstream`.

## Stop Conditions

Pause for human confirmation if backend contract or authorization scope differs
from the supplied brief, or if implementation requires changing ranking or
override behavior.
