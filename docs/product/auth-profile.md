# Auth & Profile

BRD: `BRD/User_Roles_and_Permissions.md`, `BRD/Security_Requirements.md`, FR-001–003.

## Roles (BRD ROL-001 … ROL-005)

| Role | API value | Client status |
| --- | --- | --- |
| Guest | `guest` | Unauthenticated (no `user.role`) |
| Candidate | `candidate` | B2C: CV, practice, profile |
| HR | `hr` | B2B: campaigns (future) |
| Organize | `organize` | B2B: org admin, billing (future) |
| Admin | `admin` | Platform admin (future) |

Legacy API values (`Candidate`, `interviewer`) are normalized in `parseUser()`.
`interviewer` maps to `hr` per BRD (no separate Interviewer role).

## Surfaces

| Route | Screen ID | Status |
| --- | --- | --- |
| Auth modal (overlay) | SCR-AUT-002–005 | Partial |
| `/profile` | SCR-CAN-013 | Partial |
| Protected routes | — | `src/routes/ProtectedRoute.tsx` |

## Behavior contract

- Unauthenticated users hitting protected routes → redirect or auth prompt.
- Logout clears session store and returns to home.
- Profile shows account info, security status, password change modal.
- Role badges use semantic colors per `docs/UI_GUIDE.md`.

## API (via Gateway)

Auth service endpoints — see `src/features/auth/services/authEndpoints.ts`.

## Open gaps

- `UserRole` TypeScript typing and duplicate `ProtectedRoute` files need cleanup.
- Email verification, MFA, SSO screens not implemented (SCR-AUT-004, 007, SSO).
