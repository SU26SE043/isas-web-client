# Design

## Domain Model

`StoredCampaignInterview` remains the client-side bridge between the idempotent campaign `start` response and the shared preparation flow. It supplies the session questions and whether the campaign requires face enrollment.

## Application Flow

1. Campaign start/resume creates or retrieves the existing campaign session and stores its context.
2. Candidate is routed to `/interview/:sessionId/prepare`.
3. `CampaignInterviewPreparationPage` is a non-visual adapter that renders the existing B2C `InterviewPrepPage` unchanged and supplies the campaign-only next callback.
4. The B2C `DeviceCheckStep` owns permission, preview, audio-level, retry, and stream cleanup.
5. After device readiness, the adapter preserves required face enrollment; otherwise the existing campaign terms/identity flow proceeds.
6. The room redirects to the established campaign room, which is mounted through `FullscreenLayout`.

## Interface Contract

No endpoint changes. `POST /api/v1/campaign/{id}/start` remains idempotent create/resume. The frontend starts no room timer in preparation; it is mounted only in the interview room.

## UI / Platform Impact

No new visual component or styling. B2C visual markup, styles, camera preview, microphone meter, and responsive behavior are reused. The B2B room has no dashboard sidebar; other candidate pages are unchanged.
