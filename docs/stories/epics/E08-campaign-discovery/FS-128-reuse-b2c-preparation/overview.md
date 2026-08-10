# Overview

## Current Behavior

Campaign start or resume sent the candidate to a campaign-specific interview route inside `DashboardLayout`. The B2C preparation/device-check surface was bypassed and the room retained the candidate sidebar.

## Target Behavior

Campaign sessions enter the existing B2C preparation surface before the interview room. The same `InterviewPrepPage` and `DeviceCheckStep` own all visual and media behavior. Campaign-only routing retains face-enrollment and policy state without introducing a B2B visual clone. The campaign room uses `FullscreenLayout` with no sidebar.

## Affected Users

- Candidate participating in an employer campaign from an invitation or My Campaigns.

## Affected Product Docs

- `docs/product/campaign-discovery.md`
- `docs/product/campaign-assessment.md`
- `docs/product/practice-interview.md`

## Non-Goals

- Redesigning or copying the B2C preparation/device-check UI.
- Changing campaign API endpoints or their server-side timer semantics.
