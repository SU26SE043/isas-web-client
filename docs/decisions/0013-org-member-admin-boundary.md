# 0013 Organization Member Administration Boundary

Date: 2026-07-28

## Status

Accepted

## Context

The employer team screen previously used local mock data and allowed both
`OrgAdmin` and platform `Admin`. The live Auth API scopes
`/api/v1/auth/org/members` to the organization in the authenticated employer's
claims and rejects callers that are not organization administrators.

Platform `Admin` does not implicitly have an organization context for these
tenant-scoped endpoints.

## Decision

- The employer team route and navigation are available to `OrgAdmin` only.
- List members with `GET /api/v1/auth/org/members`.
- Invite an `HrMember` with `{ email, fullName }`; the frontend does not send a
  password or choose a role during creation.
- Change membership only through `PATCH /api/v1/auth/org/members/{userId}` with
  an exact `OrgAdmin` or `HrMember` value.
- Treat the returned `userId`, `orgRole`, and `joinedAt` fields as the canonical
  team member model.

## Alternatives Considered

1. Keep platform `Admin` access in the frontend and rely on backend `403`.
   Rejected because the route would advertise an operation without tenant
   context.
2. Keep the mock-only team service. Rejected because the Auth API contract is
   now available.
3. Send the target role in the invite request. Rejected because creation always
   produces an `HrMember`; role elevation is a separate PATCH operation.

## Consequences

Positive:

- Frontend authorization matches the live tenant boundary.
- Invite and role changes use the exact backend DTOs.
- The last-OrgAdmin conflict is surfaced without optimistic corruption.

Tradeoffs:

- Platform administrators need a separate admin-scoped API if cross-tenant
  membership management is required later.

## Follow-Up

- Verify the three calls against a staging organization with at least two
  administrators.
