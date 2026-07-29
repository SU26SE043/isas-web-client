# 0015 Admin Directory Access Boundary

Date: 2026-07-29

## Status

Accepted

## Context

Auth exposes platform-wide organization and account directories containing
tenant membership and ban metadata. Both endpoints require the platform
`Admin` role. Existing Phase 13 screens used mock users and a mock suspend
action without a corresponding write API.

## Decision

- Use `GET /api/v1/auth/admin/organizations` for the Admin organization
  directory and `GET /api/v1/auth/admin/users` for the account directory.
- Keep both routes behind `RequireAuth` and `RequireRole([Admin])`; other roles
  never initiate these privileged requests.
- Treat API `401` as an expired/missing session and `403` as an authorization
  boundary. Do not retry either status.
- Send only supported query parameters and clamp `limit` to `1..500`.
- Read cursor pagination exclusively from `X-Next-Cursor`.
- Require the gateway to expose `X-Next-Cursor` when frontend/API origins
  differ (`Access-Control-Expose-Headers`).
- Remove the mock suspend action from the live account directory. Account ban
  mutations remain out of scope until Auth exposes a write contract.

## Alternatives Considered

1. Merge organizations into the Users page. Rejected because each endpoint has
   independent filters and cursor state.
2. Keep mock suspend beside live reads. Rejected because it would imply a
   persisted mutation that the backend contract does not provide.

## Consequences

Positive:

- Platform Admin sees live, cursor-paginated tenant and account data.
- Role, tenant, and ban metadata remain read-only and contract-aligned.

Tradeoffs:

- User suspension is temporarily absent from the live page.
- Cross-origin deployments must expose the cursor header.

## Follow-Up

- Add ban/unban actions only after Auth publishes the corresponding mutation
  endpoints and audit behavior.
