# US-005 Practice Interview B2C

## Status

implemented

## Lane

normal

## Product Contract

Candidate runs AI practice interview via `/practice` → full flow (`prepare` → `device-check` → `identity` → `waiting` → `room` → `complete`), views scored result, browses history at `/candidate/practice/history` (with optional `?date=` filter from dashboard heatmap).

## Relevant Product Docs

- `docs/product/practice-interview.md`
- `docs/product/dashboard.md`
- `docs/product/campaign-assessment.md` (B2B engine reuse)

## BRD References

- FR-009–017
- SCR-CAN-029–048

## Acceptance Criteria

- `/practice` redirects to interview prepare flow with profile/credit gate.
- Full flow: prepare consent, device check, identity photo, waiting room, interview room.
- Interview room: AI panel, camera, timer (orange ≤120s, red ≤30s), submit, pause, proctoring banner.
- Violation pause overlay with continue; auto-submit at max violations.
- B2B campaign sessions: terms gate, camera always on, periodic face capture (mock).
- Flow progress persisted per session in `sessionStorage`.
- Result page: radar chart, gap analysis, error/loading states.
- `/candidate/practice/history` list and `/candidate/practice/history/:id` detail.
- History toolbar supports date filter chip when `?date=` is present.
- Role guard: Candidate + Admin only.

## Validation

| Layer | Expected proof |
| --- | --- |
| Platform | `npm run build` |
| i18n | `npm run check:i18n` |
| E2E | `e2e/specs/b2c/interview-happy-path.spec.ts` (Chromium) |

## Evidence

- `src/features/practice/**` — flow pages, proctoring store, ViolationPauseOverlay, TermsAcceptanceGate
- E2E: `e2e/specs/b2c/interview-happy-path.spec.ts`
- B2B reuse: `e2e/specs/b2b/full-journey.spec.ts` (terms + violation pause)
