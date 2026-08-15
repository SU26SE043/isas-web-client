# 0019 Campaign Shared Preparation Boundary

Date: 2026-08-10

## Status

Accepted

## Context

Campaign candidates bypassed the established B2C preparation/device-check flow and entered a dashboard-wrapped room. Duplicating that preparation UI would create divergent camera and microphone lifecycle behavior.

## Decision

Use `InterviewPrepPage` and `DeviceCheckStep` directly for B2B campaign preparation. Keep campaign session, face-enrollment, and next-route decisions in a non-visual campaign adapter. Render only the campaign interview room through `FullscreenLayout`.

## Alternatives Considered

1. A separate B2B preparation page â€” rejected because it duplicates UI and media logic.
2. Put all campaign routing into B2C visual components â€” rejected because campaign policy should remain at the B2B boundary.
3. Remove the candidate dashboard shell globally â€” rejected because normal candidate navigation still requires the sidebar.

## Consequences

Positive:

- B2B and B2C share one device-check implementation and media cleanup path.
- The campaign room receives the complete viewport without an empty sidebar region.

Tradeoffs:

- Campaign start remains the documented idempotent create/resume request before preparation; server-side deadline semantics must be enforced by the backend contract.
