# US-005 Practice Interview B2C

## Status

implemented

## Lane

normal

## Product Contract

Candidate runs AI practice interview via `/practice` **pre-session wizard** (domain → level → CV → question count → rubric → confirm) then B2C flow (`prepare` → `device-check` → `waiting` → `room` → `complete`) — **no identity step**, **no anti-cheat**. Camera is mandatory for the full session with live mirror preview in the room. B2B campaign sessions reuse the engine with terms, identity, and strict proctoring (see `campaign-assessment.md`).

## Relevant Product Docs

- `docs/product/practice-interview.md`
- `docs/product/dashboard.md`
- `docs/product/campaign-assessment.md` (B2B engine reuse)

## BRD References

- FR-009–017
- SCR-CAN-029–048

## Acceptance Criteria

- `/practice` shows a 6-step setup wizard before the interview engine; confirm creates session + reserves tokens then navigates to prepare.
- B2C flow after confirm: prepare consent → device check → waiting room → interview room (skip `/identity`).
- Interview room: AI panel, **live candidate camera** (no disable toggle), timer (orange ≤120s, red ≤30s), submit, pause.
- B2C: **no** proctoring banner, tab listeners, periodic snapshots, or violation pause.
- B2B campaign sessions: terms gate → identity → camera always on → periodic face capture (mock) → violation pause → auto-submit at max violations.
- Flow progress persisted per session in `sessionStorage`.
- Result page: tabbed report (Overview/Breakdown/Roadmap), radar chart, gap analysis, roadmap preview via `learningService`, error/loading states.
- Roadmap menu `/candidate/roadmap` opens **creation wizard** (domain → reports → target level → confirm → AI → Learning). See `docs/product/learning-roadmap.md`.
- Learning `/candidate/learning` is a **dashboard of created roadmaps** (search/filter/sort), then milestone → theory → device-check → practice with live feedback → practice report. See `docs/product/learning.md`.
- `/candidate/practice/history` paginated table, soft-delete (hide/restore), compare mode.
- Learning hub, module viewer (`passThreshold`), guided practice, progress dashboard.
- Certificate viewer with PDF download; route aliases `/candidate/results/:id`, `/candidate/history`.
- Role guard: Candidate + Admin only.

## Validation

| Layer | Expected proof |
| --- | --- |
| Platform | `npm run build` |
| i18n | `npm run check:i18n` |
| E2E | `e2e/specs/b2c/interview-happy-path.spec.ts`, `e2e/specs/b2c/results-learning.spec.ts` (Chromium) |

## Evidence

- `src/features/practice/**` — flow pages, `useInterviewRoomProctoring`, `CandidateCameraPanel`, `useInterviewMedia`
- E2E: `e2e/specs/b2c/interview-happy-path.spec.ts`, `e2e/specs/b2c/results-learning.spec.ts`
- Phase 6: `HistoryTable`, `certificatePdf`, `SkillBreakdownAccordion`, learning module `getModule` API
- B2B reuse: `e2e/specs/b2b/campaign-invite-interview.spec.ts`, `e2e/specs/b2b/full-journey.spec.ts`
