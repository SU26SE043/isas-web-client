# US-018 Exec Plan

## Goal

Replace mock Admin directory reads with the two live Auth list APIs.

## Scope

In scope:

- Admin-only endpoints, parsers, services, queries, routes, UI, and errors.
- Search, role filter, cursor header, limit, responsive and authorization proof.

Out of scope:

- Account or organization mutations.
- Changes to backend role enforcement.

## Risk Classification

Risk flags:

- Auth.
- Authorization.
- Public contracts.
- Existing behavior.
- Weak proof.

Hard gates:

- Auth.
- Authorization.

## Work Phases

1. Audit mock and live coverage.
2. Record access/read-only boundary.
3. Implement both vertical slices.
4. Validate queries, headers, errors, guards, and responsive UI.
5. Update durable Harness evidence.

## Stop Conditions

Pause if write behavior is requested without a published Auth endpoint or if
the gateway does not expose the cursor header cross-origin.
