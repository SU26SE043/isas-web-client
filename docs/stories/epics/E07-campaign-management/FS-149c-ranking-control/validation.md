# Validation

Required gates: `npm test`, `npm run typecheck`, `npm run build`, `npm run check:ui-size`,
`npm run check:i18n`, and smoke E2E. The F3–F5 implementation runs the local compile/build,
UI-size and i18n gates after each increment. Full browser screenshots and authenticated API
evidence must be attached by the independent checker when the dev backend is available.

The implementation must not claim completion for backend-dependent paths until the independent
checker verifies preview/apply, adaptive budget errors, job-needs 409 handling, and invitation
eligibility on the dev environment.
