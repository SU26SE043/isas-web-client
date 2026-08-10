# Validation

## Test Matrix

| Layer | Evidence |
| --- | --- |
| Unit | Hidden-to-visible timing, fullscreen API mapping/dedupe, cleanup, face-check 204/signals/30-second polling |
| Integration | Shared room pause input disables actions and pauses existing TTS/MediaRecorder/timer |
| Platform | Typecheck, i18n parity, UI-size, focused tests, production build |
| Browser | Active B2B room shows non-dismissible warning; interaction resumes only after Continue |

## Acceptance

- Focused campaign/practice tests: 14/14 passed.
- TypeScript, i18n parity, UI-size, and production build passed.
- Chromium E2E passed: popup visible and clickable, timer frozen, room controls disabled, explicit Continue resumes, and exactly one correct paste flag is sent.
- Screenshots: `test-results/fs129-anti-cheat/paste-warning-desktop.png` and `resumed-room-desktop.png`.
