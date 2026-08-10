# Exec Plan

## Goal

Route B2B campaign candidates through the existing B2C preparation/device-check flow before the full-screen campaign room.

## Scope

In scope:

- Route campaign start/resume to shared preparation.
- Reuse the B2C device-check implementation and session context.
- Keep campaign face enrollment as a routing concern.
- Mount only the campaign room outside `DashboardLayout`.

Out of scope:

- New preparation UI, backend timer API changes, and redesign of B2C practice.

## Risk Classification

High-risk: authenticated candidate workflow, camera/media lifecycle, campaign integrity controls, and route/layout boundary.
