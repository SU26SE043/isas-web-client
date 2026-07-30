# Validation

## Proof Strategy

Prove exact URLs/bodies, response parsing, `204` handling, localized UI, and visible Admin interaction states.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Encoded IDs, trimmed reason, bodyless unban, reset payload/204 |
| Integration | User list invalidation after ban/unban |
| E2E | Confirm actions and token-lifecycle guidance |
| Platform | Typecheck, i18n, build, UI size |
| Logs/Audit | No credential or token logging |

## Fixtures

- Admin session and deterministic active/banned users.

## Commands

```text
npm test -- --run src/features/admin/utils/adminDirectoryApi.test.ts
npm run typecheck
npm run check:i18n
npm run build
```

## Acceptance Evidence

- Unit contract suite: 7/7 passed.
- TypeScript and i18n parity passed.
- Vite production build passed (existing large-chunk warning only).
- Chromium account-action E2E passed with desktop and 375px screenshots.
- UI-size check reports only the pre-existing 253-line `CampaignDetailView.tsx`.
