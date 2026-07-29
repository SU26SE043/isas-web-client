# Admin Analytics Boundary

Date: 2026-07-29

## Status

Accepted

## Context

The Phase 13 Admin dashboard combines mock user metrics, health, and audit data. Auth now publishes platform-wide user analytics for Admins.

## Decision

Replace the mock user metrics with `GET /api/v1/auth/admin/analytics` through a parse-first service and React Query. Expose day/month grouping. Keep health and audit panels on their current mock boundary until their own contracts are published.

## Alternatives Considered

1. Replace the entire snapshot; rejected because Auth analytics does not provide health or audit records.
2. Display live and mock user totals together; rejected because duplicate sources are misleading.

## Consequences

Positive:

- Dashboard identity metrics are live, role-gated, and contract-aligned.

Tradeoffs:

- The page temporarily combines live analytics with clearly separate mock operational panels.

## Follow-Up

- Wire live health and audit contracts independently when published.
