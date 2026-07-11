# US-007 Campaign Discovery Candidate Entry

## Status

implemented

## Lane

normal

## Product Contract

Candidate can browse public active campaigns, inspect campaign details, enroll when profile completeness meets the 70% gate, and enter the magic-link landing path.

## Relevant Product Docs

- `docs/product/campaign-discovery.md`
- `docs/product/practice-interview.md`

## BRD References

- SCR-CAN-023-025
- BP-006, BP-007
- UF-008, UF-009
- BRL-022, BRL-032, BRL-059
- FR-095-124 candidate-facing campaign discovery and enrollment behavior

## Acceptance Criteria

- `/candidate/campaigns` renders campaign cards with search and filters.
- Empty, loading, and no-result states are present.
- `/candidate/campaigns/:id` renders full campaign detail and enroll CTA.
- `/candidate/campaigns/:id/enroll` blocks enrollment below 70% profile completeness.
- Enrollment requires candidate consent and redirects to interview preparation on success.
- `/invite/:token` validates mock magic-link state and handles expired invites.
- All visible text is available in Vietnamese and English.

## Design Notes

- Commands: `npm run check:ui-size`, `npm run check:i18n`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`.
- API: mock CampaignService only; live CampaignService integration deferred.
- Domain rules: show active public campaigns, profile gate 70%, invite expiry messaging, locale indicator.
- UI surfaces: Candidate dashboard layout for authenticated screens; marketing layout for magic-link landing.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-007 --unit 1 --integration 0 --e2e 0 --platform 1`

| Layer | Expected proof |
| --- | --- |
| Unit | Existing unit suite remains green |
| Integration | Pending CampaignService contract |
| E2E | Smoke suite and manual Phase 8 browser flow |
| Platform | Build, i18n, UI-size, typecheck |
| Release | Not in this story |

## Harness Delta

No Harness policy change expected.

## Evidence

- `npm run check:ui-size` passed.
- `npm run check:i18n` passed.
- `npm run typecheck` passed.
- `npm test` passed: 3 files, 10 tests.
- `npm run build` passed with existing CSS import, `/history-bg.jpg`, and chunk-size warnings.
- `npm run test:e2e` passed: 2 Chromium smoke tests.
- Playwright Phase 8 flow passed: browse campaign, open details, enroll, submit consent, redirect to interview preparation.
- Screenshots saved under `test-results/phase8-ui/`.
