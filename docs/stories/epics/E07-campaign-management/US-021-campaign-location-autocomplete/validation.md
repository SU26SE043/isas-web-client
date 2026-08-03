# Validation

## Proof Strategy

Prove provider parsing and request mapping deterministically in unit tests, then
exercise typing, selection, map rendering, keyboard behavior, provider failure,
and responsive layout in the browser.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Photon parser rejects malformed features and maps valid labels/coordinates; create/update requests trim and include `location`; step 0 rejects blank location |
| Integration | Mock provider response drives suggestions and selection without CampaignService submission |
| E2E | Create wizard location typing, selection, and map preview at desktop/mobile widths |
| Platform | `check:i18n`, `check:ui-size`, `typecheck`, unit suite, production build |
| Performance | 350 ms debounce, max 5 results, stale-request abort, lazy map iframe |
| Logs/Audit | No raw provider payload or address query logged in production |

## Fixtures

- Deterministic Photon GeoJSON response for a Ho Chi Minh City workplace address.
- Empty and malformed provider responses.

## Commands

```text
npm run check:i18n
npm run check:ui-size
npm run typecheck
npm test
npm run build
```

## Acceptance Evidence

- `npm run typecheck`: passed.
- `npm run check:i18n`: passed for 16 translation files.
- `npm run check:ui-size`: passed with the 250-line limit.
- `npm test`: 65 test files and 291 tests passed.
- `npm run build`: passed with Vite 8.0.10 (existing large-chunk warning only).
- Deterministic Playwright browser verification passed at desktop, 768 px, and
  375 px: suggestions appeared while typing, selection populated the address
  and map marker, no horizontal overflow was found, and no console errors were
  emitted.
- The visible browser check used a mocked Photon response so UI proof is stable;
  provider parsing and malformed responses are covered by unit tests.
