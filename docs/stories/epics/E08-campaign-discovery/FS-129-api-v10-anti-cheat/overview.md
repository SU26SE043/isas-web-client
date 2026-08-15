# Overview

## Current Behavior

The existing blocking warning works for already-enqueued violations, but Alt+Tab/window switching is mapped to `focus_lost`, pause begins only when the warning is enqueued on return, and Continue restores fullscreen only for a `fullscreen_exit` warning. The modal overlay is dimmed but does not blur the room.

## Target Behavior

Treat tab switching, Alt+Tab/window switching, and fullscreen exit as one `tab_switch` API family. Pause immediately on leave, correlate related browser events into one flag, reveal one non-dismissible blurred-backdrop modal on return, and resume only after a candidate gesture restores fullscreen. Keep face signals owned by `face-check` and scope all monitoring to the active B2B room.

## Non-Goals

- Redesigning the Interview Room or creating a second media/state implementation.
- Sending backend face signals to `/flags`.
- Monitoring preparation, login, campaign detail, or completion pages.
