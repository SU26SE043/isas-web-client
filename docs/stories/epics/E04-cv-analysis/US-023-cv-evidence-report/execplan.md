# Exec Plan

## Goal

Make CV analysis results auditable against the uploaded CV/JD while removing the retired repository
analysis frontend surface.

## Scope

In scope:

- Retire repository-analysis frontend source, translations, and product references.
- Evidence-first result layout on the landing report and saved-report detail.
- Authenticated CV/JD PDF preview, page navigation, open-tab, and download actions.
- Responsive, bilingual UI plus deterministic component/service tests.

Out of scope:

- Backend API/schema changes.
- PDF coordinate highlighting or OCR changes.
- Unrelated candidate, practice, campaign, or billing screens.

## Risk Classification

Risk flags:

- Public contracts: a documented candidate route/module is retired.
- Existing behavior: the report layout and source interactions change.
- Multi-domain: CV analysis and repository-analysis frontend slices are reconciled.
- Weak proof: prior E2E did not assert requirement evidence or source preview.

Hard gates:

- None. The product owner explicitly approved the removal and evidence behavior on 2026-08-18.

## Work Phases

1. Retire repository-analysis and align living docs.
2. Implement evidence derivation and interaction components.
3. Implement authenticated document viewer and source actions.
4. Add component/service tests and refresh the story contract.
5. Run build, i18n, UI-size, unit/E2E checks, and visible responsive verification.
6. Record validation evidence and trace friction from the missing Harness CLI/UI skill paths.

## Stop Conditions

Pause for human confirmation if:

- Evidence requires a new backend response field.
- Source viewing would expose a file without the authenticated API client.
- A destructive change extends beyond the standalone repository-analysis frontend feature.
- Required validation would need to be weakened.
