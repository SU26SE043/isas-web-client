# Design

## Domain Model

Ban state uses `bannedAt` and `banReason`, separately from Identity lockout.

## Application Flow

The Admin confirms an action, the client calls Auth, and React Query invalidates the live user list after ban/unban. Password reset treats `204` as success.

## Interface Contract

- `POST /api/v1/auth/admin/users/{userId}/ban` with `{ reason? }` returns an updated user.
- `POST /api/v1/auth/admin/users/{userId}/unban` returns an updated user.
- `POST /api/v1/auth/admin/users/{userId}/reset-password` with `{ newPassword }` returns `204`.
- Known `400/401/403/404/409` states map to localized UI copy.

## Data Model

No migration; the UI consumes backend ban metadata.

## UI / Platform Impact

Desktop and mobile rows expose reset and ban/unban actions. Ban reasons are capped at 500 characters.

## Observability

No password or token is logged.

## Alternatives Considered

1. Legacy mock suspension was rejected because it is not the Auth contract.
