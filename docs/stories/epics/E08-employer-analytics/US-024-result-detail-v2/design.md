# Design

## Domain Model

The result list remains the source of candidate order and effective score. A
transcript question may carry nullable answer/audio/status fields and nullable
delivery metrics. Override history is newest-first and is read-only in this
story; `Set` and `Clear` map to the existing override workflow.

## Application Flow

The detail page queries results, transcript, and override history. Audio is
fetched only after the employer presses play, stored as an object URL for the
player lifetime, and revoked on unmount. Successful override mutation
invalidates both the campaign results list and the current session history.

## Interface Contract

- `GET /api/v1/campaign/{id}/results/{sessionId}/override-history`
- `GET /api/v1/campaign/{id}/results/{sessionId}/answers/{answerId}/audio`
- Existing transcript and override endpoints remain unchanged.
- Parsers accept camelCase and PascalCase fields and nullable additive fields.

## Data Model

No database, schema, or migration changes. Audit history is supplied by the
backend and rendered in newest-first order.

## UI / Platform Impact

Responsive employer detail layout: sticky question navigation on large screens,
horizontal question chips on small screens, keyboard-accessible controls, and
native audio playback with a single active player.

## Observability

Existing API error handling is preserved; audio/history errors are rendered as
localized UI states without exposing raw backend errors.

## Alternatives Considered

1. Keep fetching audio at mount — rejected because it wastes bandwidth and
   violates the review flow contract.
2. Derive candidate navigation from the filtered ranking table — rejected;
   server result order is the stable navigation contract.
