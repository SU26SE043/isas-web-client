# US-017 Live Auth Organization Profile

## Current Behavior

Employer settings contain mock notification preferences but do not read or
update the organization identity exposed by Auth.

## Target Behavior

`OrgAdmin` and `HrMember` can read their organization from `/employer/settings`.
Only `OrgAdmin` can update the organization name and tax code.

## Affected Users

- `OrgAdmin`
- `HrMember`

## Affected Product Docs

- `docs/product/auth-profile.md`
- `docs/product/shared-engagement.md`
- `docs/decisions/0014-org-profile-access-boundary.md`

## Non-Goals

- Replacing the broader mock company-onboarding profile.
- Granting platform `Admin` implicit tenant access.
- Editing members through the organization profile form.
