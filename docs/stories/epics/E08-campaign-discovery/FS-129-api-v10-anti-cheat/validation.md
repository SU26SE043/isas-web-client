# Validation

## Test Matrix

| Layer | Evidence |
| --- | --- |
| Unit | Blur/focus, hidden/visible, fullscreen exit, exact `tab_switch` payloads, cross-event dedupe, initial render, and cleanup |
| Integration | Shared room pause input disables actions and pauses existing TTS/MediaRecorder/timer |
| Platform | Typecheck, i18n parity, UI-size, focused tests, production build |
| Browser | Alt+Tab/tab/fullscreen transitions produce one flag, freeze the timer, show a blurred non-dismissible warning, retry failed fullscreen, and resume only after Continue |

## Previous Acceptance

- Focused campaign/practice tests: 14/14 passed.
- TypeScript, i18n parity, UI-size, and production build passed.
- Chromium E2E passed: popup visible and clickable, timer frozen, room controls disabled, explicit Continue resumes, and exactly one correct paste flag is sent.
- Screenshots: `test-results/fs129-anti-cheat/paste-warning-desktop.png` and `resumed-room-desktop.png`.

## Current Acceptance Evidence

- Focused anti-cheat and face-check hooks: 11/11 passed.
- E2E: 6/6 passed across Chromium, Firefox, and WebKit. The leave test covers Alt+Tab event correlation, browser tab switching, fullscreen exit, exact three `tab_switch` payload notes, one flag per physical transition, timer freeze, blocking Escape behavior, fullscreen failure, retry, and resume.
- Static/release gates: TypeScript, i18n parity, UI-size, and production build passed.
- Visible QA: `test-results/fs129-anti-cheat/alt-tab-warning-desktop.png`, `alt-tab-warning-mobile.png`, and `resumed-after-window-leave-desktop.png`.
- Browser plugin was unavailable; project Playwright was used as the documented fallback.
