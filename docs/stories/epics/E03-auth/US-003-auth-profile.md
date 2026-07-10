# US-003 Auth Modal + Profile

## Status

in_progress

## Lane

high-risk

## Product Contract

Users can register, sign in, reset password via auth modal. Authenticated users manage profile at `/profile` with account info, security cards, password change.

## Relevant Product Docs

- `docs/product/auth-profile.md`

## BRD References

- FR-001–003
- `BRD/User_Roles_and_Permissions.md`
- `BRD/Security_Requirements.md`
- SCR-AUT-002–005, SCR-CAN-013

## Acceptance Criteria

- Auth modal: sign in, sign up, forgot password flows with validation errors.
- JWT session persisted; logout clears state.
- `/profile` shows user info; change password modal works.
- Protected routes redirect unauthenticated users.

## Design Notes

- High-risk: auth, authorization, public session contract.
- Fix duplicate `ProtectedRoute` and `UserRole` typing before claiming build pass.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `src/features/auth/tests/AuthModal.test.tsx` |
| Platform | `npm run build` (after TS fixes) |

## Evidence

- `src/features/auth/**`
- `src/routes/ProtectedRoute.tsx`
