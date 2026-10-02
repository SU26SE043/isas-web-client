# Validation

## Proof Strategy

Each slice is proven by unit/integration tests plus an independent check run (“KIỂM”) that also
applies at least five value-level mutations which must turn the related tests red. F6 is a real
run on dev through the browser; green tests do not replace it. Backend-dependent paths are not
claimed complete until F6 passes.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Length bounds 4/181 invalid, 5/180 valid; estimate `ceil(K×(1+d)×2)` with K = `questionsPerSession` and adaptive on/off; `maxAttempts` in create/update bodies; absent `maxAttempts` ⇒ 1; increase options only > current; PUT body exactly `{ title, maxAttempts }`; 409 code parsing; four attempt states; absent fields ⇒ pre-ATT1 view; `ATTEMPT_LIMIT_REACHED` mapping; `start` keeps `content = ""` questions |
| Integration | Wizard step wiring (field only in step 5, Review row + Edit → step 5); detail card per status → dialog → `apiClient.put` → invalidate + toast; candidate page states, dialog retry line, card “Còn x/y lượt” / “Hết lượt”. F4/F5: `begin` once on room entry and never on preparation, refetch after `begin`, clock correct with machine clock +10 min, overlay does not pause the sitting clock, `begin` 404 ⇒ old `deadlineAt`, 5/1 min colours, B2C shows no sitting clock; time-up ordering upload → submit, `SESSION_TIME_UP`, `SESSION_NOT_BEGUN` retry once, submit failure line, non-dismissible screen |
| E2E | `npm run test:e2e:smoke` green on every slice (rebuild before running) |
| Platform | F6 on dev: 1440 px and 375 px, no horizontal overflow, 0 console errors |
| Performance | — |
| Logs/Audit | — |

## Fixtures

- Mocked Campaign/Interview responses with and without ATT1 fields (old-Backend compatibility).
- F6: an HR account and a candidate account on dev (entered by a human, not by the agent).

## Commands

```text
npm run typecheck
npm test            # vitest run; baseline 2123 passed / 339 files
npm run check:i18n
npm run check:ui-size
npm run check:radius
npm run build
npm run test:e2e:smoke
```

## Acceptance Evidence

| Slice | Result |
| --- | --- |
| ATT1-F1 | PASS KIỂM — `0591c6d6` + `8be01a9e` |
| ATT1-F2 | PASS KIỂM — `e3ec89b9` + `db8ec0e1` |
| ATT1-F3 | PASS KIỂM — `f7e02808` + `4c82d23e` |
| ATT1-F4 | PASS KIỂM — `35a227a1` + `e9df53db` |
| ATT1-F5 | PASS KIỂM — `c88dace9` + `f99e81d2` |
| ATT1-F5b | PASS KIỂM — `ad2d5814` + `c8150611` |
| ATT1-F6 | PARTIAL — 6/8 mục PASS trên dev 03/10/2026; mục 7 bị chặn bởi luật CAMP-23, mục 4 phần lệch giờ chưa chạy. Chi tiết: [f6-dev-run.md](f6-dev-run.md) |
