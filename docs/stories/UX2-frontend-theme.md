# UX2 Frontend theme cleanup

## Status

F1 in progress; F2–F4 pending the preceding step's acceptance gates.

## Lane

Normal. Color classes and regression tests only; no runtime logic, API, layout,
spacing, copy, or backend changes. User confirmed light monochrome on 2026-09-05,
superseding stale dark-only instructions for this task.

## Product contract

Source brief: UX2Frontend.docx supplied by the user. Existing color values in
`src/styles/colors.css` are authoritative. Auth templates remain frozen.

Relevant contracts: `docs/product/campaign-discovery.md`,
`docs/product/cv-analysis.md`, `docs/product/practice-interview.md`, and
`docs/product/campaign-management.md`. Existing plan and UI guide still describe
dark surfaces; F4 will correct the requested UI guide sections. No phase scope changes.

## Acceptance criteria

1. F1: remove legacy neutral color classes from the five listed candidate files;
   preserve camera contrast with `surface-highlight` and `border-foreground/25`.
2. F2: remove legacy classes from six CV/practice files, preserving nested-surface
   and skeleton contrast.
3. F3: repair state-bearing white overlays only, including shared section/wizard
   components; distinguish AI/HR question sources in monochrome.
4. F4: add a repository scan with a finite, justified overlay debt allowlist,
   update stale UI guide sections and surface-elevation comment.

## Validation

Each step requires unit tests, typecheck, build, UI-size, i18n and smoke gates;
desktop/mobile screenshots of the specified screens; three semantic mutations
with hash-verified restoration and passing baseline after each restore.
F4 also requires a positive-control file reporting the correct file and line.
One branch/PR, one atomic commit per accepted step; push only to upstream.

## Evidence

- F1 initial inventory: 45 legacy color occurrences in five production files.
- F1 focused render tests: 8 passed.
- Full suite initially stalled with default workers on this host; rerun with two workers.
- Live candidate screenshots need an active magic link and candidate test account;
  requested from the user while independent implementation and checks continue.
