# US-024 — Employer result detail v2

## Current Behavior

The employer result detail route renders a compact score summary and transcript
cards. It has no adjustment history, on-demand answer audio, or the additive
answer delivery/scoring metadata needed for review.

## Target Behavior

Employer users can inspect a candidate's ranked result, adjustment timeline,
answer transcript and scoring evidence, play available answer audio on demand,
and move between candidates in server ranking order. The existing override and
clear dialogs remain the write path.

## Affected Users

- HR and Organize users reviewing campaign results.

## Affected Product Docs

- `docs/product/employer-analytics.md`
- `docs/product/campaign-management.md`
- `docs/product/campaign-assessment.md`

## Non-Goals

- Ranking table, export, proctoring analysis, backend implementation, or auth UI.
- Changing the existing override modal, clear dialog, or PUT contract.
