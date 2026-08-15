# Design

## Domain Model

`CampaignCandidateError` exposes the HTTP status, backend code, and backend message. A new `emailMismatch` error code is emitted only for HTTP 403 plus `INVITATION_EMAIL_MISMATCH` (or the explicitly equivalent backend message).

## Application Flow

1. Candidate joins an invitation with a Candidate JWT.
2. An explicit mismatch error moves the page into a terminal `email-mismatch` UI state and prevents automatic retries.
3. The switch-account CTA saves the token, clears the shared auth session, and opens the shared `/login` entry with the original invite as `from`.
4. A successful Candidate login returns to the invite and retries the existing join flow.

## Interface Contract

No new endpoint. The existing join API remains `POST /api/v1/campaign/invitations/{token}/join`.

## UI / Platform Impact

The error state is an inline semantic-error card on the invite landing page. It includes the authenticated email when available and reuses the shared login entry; no feature-local auth UI is introduced.

## Observability

Raw backend errors are not shown to users. `CampaignCandidateError` retains status/API code for development diagnostics.

## Alternatives Considered

1. Treat every 403 as an email mismatch — rejected because campaigns may be closed, revoked, or otherwise forbidden.
