# Admin Account Action Boundary

Date: 2026-07-29

## Status

Accepted

## Context

Auth publishes Admin-only ban, unban, and password-reset mutations. The UI must not imply that they immediately invalidate offline-validated access tokens.

## Decision

Call the Auth mutations from the live Admin directory. Require confirmation, cap ban reasons at 500 characters, parse returned users at the service boundary, and accept reset `204`. Explain that ban blocks future issuance/refresh while old access tokens survive their TTL; reset revokes refresh tokens so sessions stop on refresh.

## Alternatives Considered

1. Reuse mock suspension; rejected because it does not match Auth semantics.
2. Claim immediate sign-out; rejected because old access tokens remain valid.

## Consequences

Positive:

- Account actions match the public Auth contract and communicate session behavior accurately.

Tradeoffs:

- Access-token eviction remains TTL-bound.

## Follow-Up

- Add audit correlation when the backend exposes request identifiers.
