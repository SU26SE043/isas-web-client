# FS-149c — RNK1 ranking controls and campaign policy visibility

## Contract

RNK1 frontend delivery is split into F0–F6 and uses contract hash `6d2e1996de84f5fb`.
The employer sees score context, answered questions, CV context, below-cutoff reasons,
manual criteria floors, question-bank depth, and must-have job needs. Employer never edits
scoring expressions or scoring policies; SCP1-F1..F4 are intentionally out of scope.

## Evidence

- F0–F2, F3, F4 and F5 are separate commits on `codex/rnk1-f0-f1`, created from `upstream/dev`.
- Local frontend gates: typecheck, build, `check:ui-size`, and `check:i18n` passed for the delivered increments.
- Browser credentialed employer verification remains an environment-dependent follow-up; no credentials were entered by the agent.
