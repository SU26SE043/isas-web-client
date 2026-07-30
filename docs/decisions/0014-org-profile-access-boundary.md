# 0014 Organization Profile Access Boundary

Date: 2026-07-29

## Status

Accepted

## Context

The Auth service exposes tenant profile reads to every authenticated Employer
member, while organization updates are restricted to `OrgAdmin`. Platform
`Admin` is a separate role and does not implicitly carry an `org_id` claim.

## Decision

- Use `GET /api/v1/auth/org` for `OrgAdmin` and `HrMember` organization reads.
- Use `PUT /api/v1/auth/org` only when the current role is `OrgAdmin`.
- Do not call either tenant endpoint for platform `Admin`.
- Render organization information in `/employer/settings`; `HrMember` receives
  a disabled, read-only view and no update control.
- Treat `403` on GET as a missing organization context and distinguish it from
  `404` organization-not-found. Preserve the current form state when PUT fails.
- Send only changed `name` and `taxCode` fields in PUT requests.

## Alternatives Considered

1. Reuse the mock company-profile service. Rejected because it models a broader
   onboarding entity and would duplicate the live Auth organization contract.
2. Allow platform `Admin` to edit the current tenant. Rejected because the API
   contract requires an Employer organization context.

## Consequences

Positive:

- All Employer members see the same live tenant identity and member count.
- Update controls match backend authorization and do not imply broader access.

Tradeoffs:

- The broader `/employer/company` onboarding profile remains a separate mock
  domain until its backend contract is available.

## Follow-Up

- Verify both roles against a staging organization when the Auth service is
  available.
