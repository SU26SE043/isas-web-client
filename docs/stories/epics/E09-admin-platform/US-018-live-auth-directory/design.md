# US-018 Design

## Domain Model

The organization directory uses the Auth `OrganizationResponse`. The account
directory adds optional organization membership plus ban timestamp/reason.
Each response page includes items and an optional cursor from the response
header.

## Application Flow

React Query owns server state. Search and role changes reset cursor history.
Previous cursors are retained locally so users can navigate backward. API
responses are parsed before entering UI state.

## Interface Contract

- `GET /api/v1/auth/admin/organizations?search&cursor&limit`
- `GET /api/v1/auth/admin/users?role&search&cursor&limit`
- Both require `Admin`; missing token returns `401`, any other role returns
  `403`.
- Both return arrays and `X-Next-Cursor`; limit defaults server-side and cannot
  exceed 500.

## Data Model

No local persistence, schema, migration, or retention changes.

## UI / Platform Impact

`/admin/users` becomes live and read-only. `/admin/organizations` is added to
the Admin sidebar. Both use shared tables, mobile cards, filters, and cursor
pagination.

## Observability

Harness records the access decision and verification. No sensitive payload is
logged.

## Alternatives Considered

1. A combined directory page was rejected to preserve independent query state.
