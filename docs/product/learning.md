# Learning Hub (Roadmap study)

BRD / product: extends `product-scope.md` §4.2 after roadmap creation. Creation: [`learning-roadmap.md`](./learning-roadmap.md).

## Purpose

**Học tập (`/candidate/learning`)** manages and studies **Roadmaps already created** by AI.

Candidates **cannot create** a Roadmap here (create only via `/candidate/roadmap` wizard).

Learning supports:

- Managing all created roadmaps
- Tracking progress and continue / resume
- Milestone → Lesson (Theory → Practice)
- Viewing Practice Reports per lesson
- Roadmap completion / read-only review

## UI principles

Coursera-inspired **learning UX** (dashboard, continue learning, progress, filters) — **not** a 1:1 clone.

Visual system remains project Design System: dark monochrome, surface layers, minimal luxury tech (see `docs/UI_GUIDE.md`).

## Learning Dashboard

Default entry when opening **Học tập**.

Shows **Roadmap cards** with: name, domain, target level, overall progress %, current milestone, current lesson, estimated remaining time, last updated, **Continue Learning**, **View Details**.

Toolbar: search, filter by domain, filter by status, sort by time or progress.

## Roadmap Detail

Overview + total progress + milestone list.

Milestone states: **Locked** | **Current** | **Completed**.

Only the **current** milestone is open; later milestones stay locked until the current one completes.

## Lesson structure

Each milestone has many lessons. Each lesson has exactly two parts, in order:

1. **Theory** — embed Learning Content URL from backend; footer **Mark as Completed** unlocks Practice.
2. **Practice** — extended practice interview after Theory.

Cannot skip Theory, Practice, lessons, or milestones.

## Practice flow

1. **Device check** — same checks as B2C practice interview (camera, mic, speaker, permissions, network).
2. AI asks questions one by one (voice/video).
3. After **each** answer: live feedback (score, strengths, weaknesses, missing knowledge, better answer, tips) → **Next Question**.
4. End with **Complete Practice Session** (no Submit) → Practice Report saved on the roadmap → lesson practice completed.

## Completion rules

| Entity | Completed when |
| --- | --- |
| Lesson | Theory + Practice completed |
| Milestone | All lessons completed → unlock next milestone |
| Roadmap | All milestones completed → 100%, Completed, **read-only** (review theory/reports; no retake unless product adds Retake later) |

## Routes (client)

| Path | Screen |
| --- | --- |
| `/candidate/learning` | Learning Dashboard |
| `/candidate/learning/roadmaps/:roadmapId` | Roadmap Detail |
| `.../lessons/:lessonId/theory` | Theory |
| `.../lessons/:lessonId/practice/device-check` | Device check |
| `.../lessons/:lessonId/practice` | Practice session |
| `.../lessons/:lessonId/report` | Practice Report |

## Related

- Create: `learning-roadmap.md`
- Shared device check UX: practice interview flow (`DeviceCheckPage` patterns)
