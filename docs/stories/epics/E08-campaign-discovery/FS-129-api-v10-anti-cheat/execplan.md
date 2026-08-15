# Exec Plan

## Scope

1. Normalize API v10 signal mapping and listener lifecycle.
2. Add serialized/deduplicated violation handling and shared modal feedback.
3. Bridge violation pause into existing timer, TTS, recorder, and room controls.
4. Enforce fullscreen/camera/face recovery and face re-enrollment.
5. Validate focused behavior, platform gates, build, and visible browser flow.
6. Prove Alt+Tab, tab switching, fullscreen exit, deduplication, cleanup, and fullscreen failure recovery.

## Risk

High-risk: authenticated assessment integrity, browser lifecycle events, camera/media ownership, and answer/timer continuity.
