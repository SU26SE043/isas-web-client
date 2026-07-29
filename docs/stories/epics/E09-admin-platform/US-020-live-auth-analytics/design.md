# Design

## Domain Model

Analytics contains totals, active-user windows, role totals, and ordered time buckets. All count values must be non-negative integers.

## Application Flow

The Admin dashboard requests analytics grouped by day by default. Selecting month changes `groupBy` and React Query retrieves the new series.

## Interface Contract

`GET /api/v1/auth/admin/analytics` accepts optional `from`, `to`, and `groupBy=day|month`. It returns totals, active users, and time buckets. `400`, `401`, and `403` map to localized dashboard errors.

## Data Model

No migration or client persistence. Responses are parsed before entering React state.

## UI / Platform Impact

Six live KPI cards, an accessible trend chart with hidden tabular equivalent, a role distribution panel, loading/error/retry states, and responsive layouts.

## Observability

No credentials or raw analytics payloads are logged.

## Alternatives Considered

1. Keep mock metrics alongside live metrics; rejected because duplicate totals would be ambiguous.
