# B2B Campaign Assessment (Magic Link Interview)

> **API v10 boundary (2026-08-10):** Campaign candidates reuse the B2C preparation and room UI, while campaign-only hooks own monitoring. Frontend flags are restricted to `tab_switch`, `paste`, `focus_lost`, and `camera_blocked`; face signals come only from `face-check` and are never posted to `/flags`.

**Parent:** [`product-scope.md`](./product-scope.md) §4.7  
**Entry:** [`campaign-discovery.md`](./campaign-discovery.md)  
**Shared engine:** [`practice-interview.md`](./practice-interview.md)

This is the frontend contract for the candidate assessment session after a campaign invitation. It applies only to B2B campaign rooms. B2C practice has no anti-cheat monitoring and may toggle its camera; the B2B room keeps the camera on.

## End-to-end flow

1. Candidate opens and validates the magic link, then authenticates with the invited account.
2. Candidate reviews the campaign and starts/resumes it through the idempotent `POST /api/v1/campaign/{campaignId}/start`.
3. The shared B2C preparation/device-check UI obtains camera and microphone access.
4. If `faceEnrollRequired` is true, capture a valid, exposed reference frame and upload it before room entry.
5. Enter the shared full-screen interview room; keep the camera active and answer sequential questions.
6. While the room is active, monitor allowed browser signals and run `face-check` every 30 seconds.
7. A violation opens one serialized, non-dismissible warning and pauses room interaction, timer, TTS, and recording.
8. Candidate explicitly selects **Tiếp tục làm bài**. Fullscreen/camera/face recovery must succeed when applicable before resuming.
9. On submit or route exit, remove all monitoring listeners, polling, queue state, and media resources through the existing lifecycle.

## Screen flow

| Step | Route / surface | Notes |
| --- | --- | --- |
| Magic link | `/invite/:token` | Invitation validation and shared auth UI |
| Campaign hub/detail | `/candidate/campaigns` and campaign detail | No anti-cheat monitoring |
| Shared preparation | `/interview/:sessionId/prepare` | Existing B2C consent/device-check UI |
| Face enrollment | `/candidate/campaigns/:campaignId/face-enroll/:sessionId` | API v10 reference image when required |
| Interview room | `/candidate/campaigns/:campaignId/interview/:sessionId` | Shared B2C room UI; camera locked on |
| Violation pause | Shared modal over the room | One recovery/continue action; no overlapping dialogs |
| Completion | Campaign completion route | No monitoring after submit |

## Business rules

| Rule | Description |
| --- | --- |
| BR-B2B-12 | Camera remains on for the active B2B room |
| BR-B2B-13 | Candidate answers one question at a time |
| BR-B2B-14 | Upload a valid baseline image when `faceEnrollRequired` is true |
| BR-B2B-15 | Face check runs every 30 seconds while the room is active |
| BR-B2B-16 | Face-check signals pause the room but are not echoed to `/flags` |
| BR-B2B-17 | Tab return, independent focus loss, paste, fullscreen exit, or camera loss pauses the room |
| BR-B2B-18 | Warning UI shows the specific reason and one explicit Continue action |
| BR-B2B-19 | Resume only after explicit Continue and any required recovery succeeds |
| BR-B2B-20 | Related browser events are deduplicated; distinct events are serialized in one queue |
| BR-B2B-21 | Monitoring exists only in the active room and respects `antiCheatEnabled` |

## API v10 session policy

`POST /api/v1/campaign/{campaignId}/start` is create-or-get and returns `antiCheatEnabled`, `faceEnrollRequired`, and `deadlineAt`. `deadlineAt` remains the server authority for session expiry. A `204` face-check response means face verification is disabled and is treated as safe.

## API v10 anti-cheat mapping

| Event | `/flags` payload or owner |
| --- | --- |
| Visible → hidden → visible | `tab_switch`; note `Candidate switched away from the interview tab.` |
| Fullscreen exits after successful entry | `tab_switch`; note `Candidate exited fullscreen mode.` |
| Window blur → focus / Alt+Tab | `tab_switch`; note `Candidate left the interview window using Alt+Tab or window switching.` |
| Paste | `paste`; note `Candidate attempted to paste content during the interview.` |
| Live camera track becomes unavailable | `camera_blocked`; note `Candidate camera became unavailable during the interview.` |
| `no_face`, `multiple_faces`, `face_mismatch`, `identity_unverified` | Backend/AI owns these through `face-check`; never POST to `/flags` |

`identity_unverified` is a technical enrollment/reference-image issue, not confirmed cheating. It routes to face re-enrollment.

## API endpoints

- `POST /api/v1/campaign/{campaignId}/start`
- `POST /api/v1/campaign/{campaignId}/sessions/{sessionId}/flags`
- `POST /api/v1/campaign/{campaignId}/sessions/{sessionId}/face-enroll` (`multipart/form-data`, field `image`)
- `POST /api/v1/campaign/{campaignId}/sessions/{sessionId}/face-check` (`multipart/form-data`, field `image`)

## Status

**Implemented against API v10** — active-room browser monitoring, face enrollment/check, serialized blocking warnings, recovery gates, and pause/resume integration reuse the shared interview engine.

## Related

- [`campaign-management.md`](./campaign-management.md)
- [`module-scope.md`](./module-scope.md)
- [`../decisions/0020-campaign-anti-cheat-boundary.md`](../decisions/0020-campaign-anti-cheat-boundary.md)
- [`../decisions/0021-campaign-window-leave-signal.md`](../decisions/0021-campaign-window-leave-signal.md)
