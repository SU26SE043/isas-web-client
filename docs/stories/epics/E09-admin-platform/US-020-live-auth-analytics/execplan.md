# Exec Plan

## Goal

Replace only the Admin dashboard's mock user analytics with the published Auth contract.

## Scope

In scope:

- Parser, service, React Query hook, dashboard KPIs/chart/role totals, errors, tests, and docs.

Out of scope:

- Live health, audit, backend aggregation, and arbitrary date-range UI.

## Risk Classification

Flags: auth, authorization, public contracts, existing behavior, weak proof.

Hard gates: auth and authorization.

## Work Phases

1. Audit duplicate calls and dashboard boundaries.
2. Record contract and validation plan.
3. Implement parse-first API and live UI.
4. Verify unit, static, build, E2E, and responsive presentation.
5. Record Harness evidence and publish.

## Stop Conditions

Pause if the response shape or authorization contract diverges.
