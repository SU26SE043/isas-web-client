# 0022 Retire Standalone Repository Analysis

Date: 2026-08-18

## Status

Accepted

## Context

CV analysis briefly included an optional GitHub repository step and the frontend also retained a
standalone `/candidate/repo-analysis` feature. The repository step was removed in `a3df2f4`, but the
unrouted feature source, translations, and Tier-1 product documentation remained. The product owner
confirmed that repository analysis must be removed from the frontend and that CV analysis should
focus on verifiable CV/JD evidence.

## Decision

- Retire the standalone GitHub repository-analysis frontend module and route contract.
- Do not collect a repository URL anywhere in the CV-analysis flow.
- Keep backend repository-analysis endpoints and admin entitlement fields outside this frontend
  change; they may be retired separately by their owning services.
- Use the existing CV/JD analysis contract as the only source for the candidate report.

## Alternatives Considered

1. Keep the standalone module hidden but compiled. Rejected because it leaves stale product and
   translation code with no supported entry point.
2. Keep repository analysis as a separate Tier-1 candidate tool. Rejected by the product owner.

## Consequences

Positive:

- Candidate CV analysis has one focused workflow without an unrelated source-code step.
- Frontend scope, routes, translations, and implementation agree.

Tradeoffs:

- Existing backend repository-analysis capability has no frontend consumer.
- Reintroducing the feature requires a new product decision and story.

## Follow-Up

- Backend owners may independently decide whether to retain or retire BC18 endpoints and plan
  entitlement fields.
