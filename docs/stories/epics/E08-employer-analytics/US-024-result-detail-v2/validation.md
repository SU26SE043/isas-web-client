# Validation

## Proof Strategy

Use pure view-model tests for score/status/duration/navigation rules, parser
tests for camel/Pascal and nullable fields, service tests for endpoint and blob
requests, component tests for history/audio/card states, and browser smoke plus
manual responsive inspection for the page.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Parser, view-model, audio player, card, history, metrics, page wiring |
| Integration | History/audio service requests and override invalidation |
| E2E | Employer results detail route and smoke suite |
| Platform | 1280px and 375px responsive browser checks |
| Performance | Audio fetch deferred until first play |
| Logs/Audit | History renders newest-first and distinguishes Set/Clear |

## Fixtures

- Existing employer campaign result fixtures.
- Transcript questions with no-speech, skipped, failed, review, sample answer,
  and delivery metric variants.
- History items with Set, Clear, null actor, and AuditBackfill source.

## Commands

```text
npm test -- --watch=false
npm run typecheck
npm run check:i18n
npm run check:ui-size
npm run build
npx playwright test e2e/specs/smoke --project=chromium
```

## Acceptance Evidence

Recorded in the Harness trace after verification.
