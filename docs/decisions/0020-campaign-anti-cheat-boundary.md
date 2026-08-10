# 0020 Campaign Anti-Cheat Boundary

Date: 2026-08-10

## Status

Accepted

## Context

API v10 divides integrity events between frontend browser signals and backend face signals. The existing campaign room reused B2C visuals but lacked one blocking, recoverable pause boundary.

## Decision

Keep browser/face detection in campaign-only hooks and pass a single `violationPaused` state into the existing B2C room. Only the four API v10 frontend signal types reach `/flags`; face-check signals remain server-owned. One serialized shared modal requires explicit recovery/continue.

## Alternatives Considered

1. A second B2B room/state machine — rejected because it duplicates timer and media ownership.
2. Treat every browser event independently — rejected because tab switches commonly emit related blur/fullscreen events.
3. Echo face signals to `/flags` — rejected because API v10 assigns those signals to the backend.

## Consequences

Positive:

- One room UI and media lifecycle serve B2C and B2B.
- API payloads, blocking behavior, cleanup, and deduplication are explicit and testable.

Tradeoffs:

- Campaign code must bridge recovery checks to the shared room media context.
- Browser event ordering requires a small guarded fullscreen/visibility correlation window.
