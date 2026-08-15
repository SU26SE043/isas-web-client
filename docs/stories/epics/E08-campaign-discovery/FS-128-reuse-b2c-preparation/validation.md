# Validation

## Proof Strategy

Prove the existing shared preparation page still passes its regression suite, campaign session context loads it without a B2C API call, and the campaign room route is outside `DashboardLayout`.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Shared preparation page remains stable; campaign stored-session mapping is valid. |
| Integration | Campaign start/resume route targets `/interview/:sessionId/prepare`; face-enrollment branch remains available. |
| E2E | Candidate enters B2C preparation, completes device check, and reaches a no-sidebar campaign room. |
| Platform | Typecheck, i18n parity, UI file size, and visual desktop/mobile checks. |

## Commands

```text
npm test -- --run src/features/practice/pages/InterviewPrepPage.test.tsx src/features/campaigns/utils/campaignInterviewSession.test.ts
npm run check:i18n
npm run check:ui-size
npx tsc --noEmit --pretty false
```

## Acceptance Evidence

Pending browser flow verification.
