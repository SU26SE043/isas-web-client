# US-005 Practice Interview B2C

## Status

in_progress

## Lane

normal

## Product Contract

Candidate runs AI practice interview at `/practice`, views scored result, browses history at `/candidate/practice/history` (with optional `?date=` filter from dashboard heatmap).

## Relevant Product Docs

- `docs/product/practice-interview.md`
- `docs/product/dashboard.md`

## BRD References

- FR-009–017
- SCR-CAN-029–048

## Acceptance Criteria

- `/practice` interview room with AI panel, camera, controls.
- Result page: radar chart, gap analysis, error/loading states.
- `/candidate/practice/history` list and `/candidate/practice/history/:id` detail.
- History toolbar supports date filter chip when `?date=` is present.
- Role guard: Candidate + Admin only.

## Validation

| Layer | Expected proof |
| --- | --- |
| Platform | `npm run dev` — practice + history routes render |

## Evidence

- `src/features/practice/**`
- Heatmap → history link: commit `286363d`
