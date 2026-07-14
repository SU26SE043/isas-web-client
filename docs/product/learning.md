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

### Practice Session UI consistency (required)

Learning Practice **must not** ship a separate interview room UI.

Reuse the same Practice Session surface used by:

- B2C — Luyện phỏng vấn (`/interview/:sessionId/...`)
- B2B — Candidate Interview

Shared UX includes: Device Check, Waiting Screen, Interview Layout, Camera Preview, Question Panel, Recording UI, Timer, Transcript (if any), Progress Indicator, Completion Flow, Report Layout.

Learning only changes **business logic**. Allowed differences vs interview practice:

1. **Per-question live AI feedback** — after each answer, show feedback on the shared room; candidate taps **Next Question**. Interview practice evaluates only at end-of-session report.
2. **End CTA** — **Complete Practice Session** (not Submit Interview / Finish).
3. **Purpose** — post-theory drill with instant feedback, not a full interview simulation.

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

1. **Theory** — in-app HTML article reader (`title` + `content` from backend); footer **Mark as Completed** unlocks Practice.
2. **Practice** — shared interview flow after Theory (`sessionId` prefix `learning-`).

Cannot skip Theory, Practice, lessons, or milestones.

## Practice flow

1. Theory / Open Practice registers a learning session and opens **`/interview/:sessionId/prepare`** (shared prepare → device-check → waiting → room).
2. Legacy Learning paths `.../practice/device-check` and `.../practice` only redirect into that shared flow.
3. In the shared room: AI asks questions; after **each** answer, live feedback panel → **Next Question**.
4. Final CTA **Complete Practice Session** → Practice Report on the roadmap → lesson practice completed.

| Mode | Feedback timing | End button |
| --- | --- | --- |
| Interview practice (B2C/B2B) | End-of-session report only | Submit / Finish interview |
| Learning practice | After every answer + Next Question | Complete Practice Session |

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
| `.../lessons/:lessonId/practice/device-check` | Launcher → shared `/interview/:sessionId/prepare` |
| `.../lessons/:lessonId/practice` | Redirect → device-check launcher |
| `.../lessons/:lessonId/report` | Practice Report |
| `/interview/learning-.../prepare` → `device-check` → `waiting` → room | Shared Practice Session UI |

## Related

- Create: `learning-roadmap.md`
- Shared room / device check: B2C/B2B interview flow (`InterviewPrepPage`, `DeviceCheckPage`, `PracticeInterviewPage`)
- Live feedback delta: `LearningLiveFeedbackPanel` + learning controls on shared `InterviewControls`
