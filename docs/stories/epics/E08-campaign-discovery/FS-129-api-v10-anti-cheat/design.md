# Design

## Boundary

Campaign hooks detect browser/camera/face events and enqueue typed violations. `B2cPracticeInterviewRoom` remains the visual/state owner and receives only `violationPaused`, `cameraAlwaysOn`, and its existing media context callback.

## Event Contract

- Tab switch is confirmed on the hidden-to-visible return transition.
- Fullscreen exit after first successful entry uses `tab_switch` with the exact fullscreen note.
- Blur/focus uses `tab_switch` with the Alt+Tab/window-switching note; paste and live camera-track loss keep their API v10 signal types.
- Leave events pause immediately, while the blocking warning is revealed when the document/window becomes active again.
- Related blur, visibility, and fullscreen events share one ref-backed pending transition and deduplication window.
- Face-check runs every 30 seconds; its four signals open warnings without `/flags` calls.

## Recovery

The queue shows one modal at a time. Continue restores fullscreen for any leave violation whenever fullscreen is inactive; failure keeps the modal and paused state. Camera and face violations validate their existing recovery gates. `identity_unverified` returns to face enrollment. Timer, TTS, and MediaRecorder pause on the same shared-room instances and resume without reinitialization.
