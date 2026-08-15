# Validation

## Proof Strategy

Verify backend-error classification separately from the rendered page state, and preserve the existing invite-continuation contract.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Explicit mismatch code maps to `emailMismatch`; unrelated 403 maps to `forbidden`; token persistence utility remains covered. |
| Integration | Login `from` state restores the invite path through the existing shared auth flow. |
| E2E | Candidate can switch accounts from a mismatch state and return to the invitation. |
| Platform | Typecheck, i18n parity, UI-size, build, browser QA at mobile/tablet/desktop. |

## Fixtures

- Backend response `{ code: "INVITATION_EMAIL_MISMATCH", message: "Invitation email does not match current user" }` with status 403.
- A non-mismatch 403 such as `{ code: "CAMPAIGN_CLOSED" }`.

## Commands

```text
npm test -- src/features/campaigns/services/campaignCandidate.service.test.ts src/features/campaigns/utils/inviteContinuation.test.ts
npm run typecheck
npm run check:i18n
npm run check:ui-size
npm run build
```

## Acceptance Evidence

- Focused service and continuation tests: 4/4 passed.
- `npm run check:i18n` and `npm run check:ui-size`: passed.
- Browser QA: verified the rendered mismatch state at desktop and 375px, then clicked the switch-account CTA and confirmed the original token remained in session storage through the `/login` handoff.
- Browser regression: an unrelated `403` response performs exactly one automatic join request, then stays on the generic forbidden state without looping.
- UI update: verified the mismatch state in a shared modal overlay, with the invitation page dimmed but retained behind the popup.
- Live contract: `403` with `error: "Email đăng nhập không khớp với email được mời."` is classified as `emailMismatch`.
- Browser QA: the exact Vietnamese backend payload opens the mismatch modal.
- `npm run typecheck` and `npx vite build` exceeded the local 60-second command limit without diagnostics; follow up in CI or a less-contended environment.
