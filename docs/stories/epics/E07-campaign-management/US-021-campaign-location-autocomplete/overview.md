# US-021 Campaign Location Autocomplete

## Status

implemented

## Current Behavior

The campaign response model can read `location`, but the create/edit wizard does
not expose the field and the create/update request DTOs do not send it.

## Target Behavior

The Campaign information step accepts a company/workplace address, suggests
matching places while the employer types, and shows the selected place on a
map. Create and draft-update requests send the trimmed address as `location`.

## Affected Users

- HR and Organization Admin users creating or editing a Draft campaign.

## Affected Product Docs

- `docs/product/campaign-management.md`
- `docs/product/api-gateway.md`

## Non-Goals

- Changing the organization profile address.
- Persisting latitude/longitude in CampaignService.
- Reverse geocoding, draggable markers, routing, or distance calculations.
- Adding a backend geocoding proxy in this frontend repository.
