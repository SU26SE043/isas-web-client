# 0018 Campaign Location Provider Boundary

Date: 2026-08-03

## Status

Accepted

## Context

Campaign creation needs search-as-you-type workplace address suggestions and a
map without committing a provider secret. The current backend contract stores a
location string and has no documented geocoding proxy or coordinate fields.

## Decision

Use Photon's public forward-search endpoint for bounded, debounced browser
lookups and OpenStreetMap's embeddable map for the selected marker. Keep the
Photon base URL configurable through `VITE_PHOTON_API_URL`. Store coordinates
only in browser memory and send only `location` to CampaignService. Manual entry
remains available when the provider is unavailable.

## Alternatives Considered

1. Google Places requires a restricted browser key and SDK setup.
2. Geoapify requires a provisioned key before the feature can work.
3. Public Nominatim does not permit client-side autocomplete.
4. A backend proxy is preferable for high volume but is outside this frontend task.

## Consequences

Positive:

- Works locally without secrets and supports multilingual, global OSM results.
- Provider response is isolated behind a parser and replaceable base URL.
- Campaign payload remains a simple address string.

Tradeoffs:

- The public Photon endpoint gives no availability guarantee and may throttle.
- The typed address is sent to an external provider after the debounce threshold.
- A production proxy or self-hosted Photon instance is required if volume grows.

## Follow-Up

- Move `VITE_PHOTON_API_URL` to an organization-controlled proxy/self-hosted
  Photon deployment before sustained production traffic.
