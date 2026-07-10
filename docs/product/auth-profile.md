# Auth & Profile

BRD: `BRD/User_Roles_and_Permissions.md`, `BRD/Security_Requirements.md`, FR-001–003.

## Roles

| Role | Access (current client) |
| --- | --- |
| Guest | Home, auth modal |
| Candidate | CV analysis, practice, profile, history |
| Admin | Same as candidate for practice (route guard) |
| HR / Interviewer | Not yet routed in client |

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
