# Design

## Boundary

Campaign hooks detect browser/camera/face events and enqueue typed violations. `B2cPracticeInterviewRoom` remains the visual/state owner and receives only `violationPaused`, `cameraAlwaysOn`, and its existing media context callback.

## Event Contract

- Tab switch is confirmed on the hidden-to-visible return transition.
- Fullscreen exit after first successful entry uses `tab_switch` with the exact fullscreen note.
- Blur/focus, paste, and live camera-track loss use API v10 frontend signal types.
- Face-check runs every 30 seconds; its four signals open warnings without `/flags` calls.

## Recovery

The queue shows one modal at a time. Fullscreen, camera, and face violations validate recovery before resolving. `identity_unverified` returns to face enrollment. Timer, TTS, and MediaRecorder pause on the same shared-room instances and resume without reinitialization.
