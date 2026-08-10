# Overview

## Current Behavior

The campaign room had direct browser listeners and soft face warnings, but did not block interaction, used incomplete API notes, could double count related events, and did not pause timer/TTS/recording.

## Target Behavior

Use API v10 mappings exactly. Serialize violations through one non-dismissible shared modal, pause the existing room state/media, verify recovery, and resume only after the candidate explicitly continues. Keep face signals owned by `face-check` and scope all monitoring to the active B2B room.

## Non-Goals

- Redesigning the Interview Room or creating a second media/state implementation.
- Sending backend face signals to `/flags`.
- Monitoring preparation, login, campaign detail, or completion pages.
