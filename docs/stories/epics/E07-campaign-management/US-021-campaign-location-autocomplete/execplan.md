# Exec Plan

## Goal

Make campaign workplace addresses faster and less error-prone to enter while
preserving manual entry when the geocoding provider is unavailable.

## Scope

In scope:

- Campaign create/edit wizard location state, validation, review, and API DTO.
- Debounced Photon forward search with parsed, bounded results.
- Keyboard-accessible suggestions and an OpenStreetMap marker preview.
- Unit and responsive browser verification.

Out of scope:

- Backend schema changes or a provider proxy.
- Other address fields in the product.

## Risk Classification

Risk flags:

- External systems: Photon and OpenStreetMap are browser-facing providers.
- Public contracts: campaign create/update adds `location`.
- Existing behavior: Campaign information validation changes.

Hard gates:

- External provider behavior.

## Work Phases

1. Confirm campaign and provider contracts.
2. Record the provider boundary decision.
3. Add location state, request mapping, and validation.
4. Add the autocomplete and map UI.
5. Verify automated and visible browser behavior.
6. Update Harness evidence.

## Stop Conditions

Pause for human confirmation if:

- CampaignService rejects or renames the `location` request field.
- The provider must receive authenticated or sensitive user data.
- Validation must require selecting a provider result instead of allowing manual entry.
