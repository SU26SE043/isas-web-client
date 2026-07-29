# US-017 Design

## Domain Model

`Organization` contains `id`, `name`, optional `taxCode`, `createdAt`, and
non-negative integer `memberCount`. Updates accept optional `name` and
`taxCode`.

## Application Flow

The employer settings page loads the organization only for `OrgAdmin` or
`HrMember`. The service normalizes plain, wrapped, camelCase, and PascalCase
Auth responses. The update flow replaces local organization state only after a
successful response.

## Interface Contract

- `GET /api/v1/auth/org`: Employer member; `200 OrganizationResponse`;
  `403` missing `org_id`; `404` not found.
- `PUT /api/v1/auth/org`: `OrgAdmin`; body `{ name?, taxCode? }`;
  `200 OrganizationResponse`; `403`; `404`.

## Data Model

No frontend persistence, schema, migration, or retention change.

## UI / Platform Impact

The organization card appears before notification settings at
`/employer/settings`. It uses the existing monochrome surfaces and primitives,
stacks at mobile width, and exposes a read-only state for `HrMember`.

## Observability

Harness intake, decision, story verification, and detailed trace record the
authorization-sensitive change.

## Alternatives Considered

1. A new organization route was unnecessary because settings is already the
   role-aware shared destination after employer login.
