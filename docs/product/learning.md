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

Coursera / Roadmap.sh–inspired **learning workspace** (dashboard, continue learning, progress, lesson tree) — **not** a 1:1 clone.

Visual system remains project Design System: dark monochrome, surface layers, minimal luxury tech (see `docs/UI_GUIDE.md`).

### Learning Workspace chrome (required)

While on Learning routes (`/candidate/learning/**`), hide the **candidate system sidebar** (Dashboard, Profile, CV, Campaigns, etc.).

| Surface | Chrome |
| --- | --- |
| Learning Dashboard + Roadmap Detail | `LearningLayout` only (logo, Learning label, language toggle, Exit Learning) — no system sidebar, no Learning lesson sidebar |
| Theory / Practice launchers / Report | `LearningLayout` + **Learning Sidebar** (roadmap name, progress, collapsible milestones → lessons, status, Back to Roadmap) |

Continue Learning opens the **current lesson Theory** (reader mode), not the system dashboard.

### Practice Session UI consistency (required)

Learning Practice **must not** ship a separate interview room UI.

Reuse the same Practice Session surface used by:

- B2C — Luyện phỏng vấn (`/interview/:sessionId/...`)
- B2B — Candidate Interview

Shared UX includes: Device Check, Waiting Screen, Interview Layout, Camera Preview, Question Panel, Recording UI, Timer, Transcript (if any), Progress Indicator, Completion Flow, Report Layout.

Learning only changes **business logic**. Allowed differences vs interview practice:

1. **Background per-question evaluation** — after each successful answer upload, the shared room immediately displays the next question while AI scores the submitted answer in the background. Per-question feedback remains available within the aggregate lesson report.
2. **End CTA** — submitting the last answer completes the session and opens the **aggregate lesson report**; it does not make the candidate wait for a per-question score first.
3. **Purpose** — post-theory drill with per-question feedback reports, not a full interview simulation.

After practice, the aggregate Learning Report (Learning workspace + Learning Sidebar) lists overall scores plus every per-question report, with **Next Lesson** when available.

## Learning Dashboard

Default entry when opening **Học tập**.

Shows **Roadmap cards** with: name, domain, target level, overall progress %, current milestone, current lesson, estimated remaining time, last updated, **Continue Learning**, **View Details**.

Toolbar: search, filter by domain, filter by status, sort by time or progress.

**Continue Learning** → current lesson Theory (`.../lessons/:lessonId/theory`).

## Roadmap Detail

Overview + total progress + milestone list.

Milestone states: **Locked** | **Current** | **Completed**.

Only the **current** milestone is open; later milestones stay locked until the current one completes.

## Lesson structure

Each milestone has many lessons. Each lesson has exactly two parts, in order:

1. **Theory** — in-app HTML article reader (`title` + `content` from backend); footer **Mark as Completed** unlocks Practice. Does **not** auto-navigate: after complete, show **Completed** + **Continue to Practice →** (or **Next Lesson** if practice already done / unavailable).
2. **Practice** — shared interview flow after Theory (`sessionId` prefix `learning-`).

Cannot skip Theory, Practice, lessons, or milestones.

## Learning flow

Learning Dashboard → Roadmap Detail (optional) → Theory → Mark Completed → Continue to Practice → Practice (shared interview) → Report → Next Lesson.

## Practice flow

1. Theory / Open Practice registers a learning session and opens **`/interview/:sessionId/prepare`** (shared prepare → device-check → waiting → room).
2. Legacy Learning paths `.../practice/device-check` and `.../practice` only redirect into that shared flow.
3. In the shared room: AI asks questions. For questions **1 .. n−1**, **Submit answer** uploads the recording, starts evaluation in the background, and immediately displays the next question.
4. On the **last** question, **Submit answer** uploads the recording, completes the session, then opens the **lesson Practice Report** (aggregate of all question feedback) as soon as scoring is ready.

| Mode | Feedback timing | End button |
| --- | --- | --- |
| Interview practice (B2C/B2B) | End-of-session report only | Submit / Finish interview |
| Learning practice | Score each answer in the background; aggregate at end | Submit answer (last answer completes) |

## Completion rules

| Entity | Completed when |
| --- | --- |
| Lesson | Theory + Practice completed |
| Milestone | All lessons completed → unlock next milestone |
| Roadmap | All milestones completed → 100%, Completed, **read-only** (review theory/reports; no retake unless product adds Retake later) |

## Routes (client)

| Path | Screen | Layout |
| --- | --- | --- |
| `/candidate/learning` | Learning Dashboard | `LearningLayout` (no system sidebar) |
| `/candidate/learning/roadmaps/:roadmapId` | Roadmap Detail | `LearningLayout` |
| `.../lessons/:lessonId/theory` | Theory reader | `LearningLayout` + Learning Sidebar |
| `.../lessons/:lessonId/practice/device-check` | Launcher → shared `/interview/:sessionId/prepare` | Learning Sidebar until redirect |
| `.../lessons/:lessonId/practice` | Redirect → device-check launcher | Learning Sidebar until redirect |
| `.../lessons/:lessonId/practice/questions/:questionId/report` | Per-question Practice Report | Learning Sidebar |
| `.../lessons/:lessonId/report` | Aggregate Practice Report | Learning Sidebar |
| `/interview/learning-.../prepare` → `device-check` → `waiting` → room | Shared Practice Session UI | `FullscreenLayout` |

## Related

- Create: `learning-roadmap.md`
- Shared room / device check: B2C/B2B interview flow (`InterviewPrepPage`, `DeviceCheckPage`, `PracticeInterviewPage`)
- Per-question / aggregate reports: `LearningQuestionReportPage`, `LearningPracticeReportPage`, learning controls on shared `InterviewControls`
