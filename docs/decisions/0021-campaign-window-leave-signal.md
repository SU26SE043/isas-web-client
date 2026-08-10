# 0021 Campaign Window-Leave Signal

Date: 2026-08-10

## Status

Accepted

## Context

The active B2B interview previously mapped an independent `window.blur` / `window.focus` transition to `focus_lost`. The current Campaign API contract intentionally requires browser tab switching, Alt+Tab/window switching, and fullscreen exit to use the single frontend signal type `tab_switch`. A physical Alt+Tab can emit `blur`, `visibilitychange`, and `fullscreenchange` together, so handling each event independently can over-count one action.

## Decision

Supersede the window-leave mapping portion of decision 0020:

- `visibilitychange`, `window.blur` / `window.focus`, and fullscreen exit all report `signalType: tab_switch` with source-specific notes.
- Leaving the active interview pauses its existing timer, TTS, recorder, and controls immediately.
- A pending leave transition is reported once and revealed through the existing blocking campaign violation modal when the candidate returns.
- A short synchronous ref/timestamp guard correlates related browser events into one violation.
- Continue restores mandatory fullscreen through the candidate click before the modal resolves and the shared room resumes.

Paste and camera signals keep their existing API mappings. Backend face signals remain owned by `face-check`.

## Consequences

- The frontend remains the authority for detecting browser/window lifecycle events; Backend only records the posted flag.
- Alt+Tab and browser behavior remain browser/OS dependent, so deterministic tests dispatch the same event transitions and cross-browser E2E verifies the rendered recovery boundary.
- No Interview Room redesign or second timer/media implementation is introduced.

