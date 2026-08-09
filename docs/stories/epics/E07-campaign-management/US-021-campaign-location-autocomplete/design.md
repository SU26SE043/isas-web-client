# Design

## Domain Model

- `location`: required trimmed workplace/company address stored with a campaign.
- `coordinates`: transient browser-only latitude/longitude used for map preview;
  not included in CampaignService requests.
- `LocationSuggestion`: parsed provider result containing a stable UI id, display
  label, secondary label, latitude, and longitude.

## Application Flow

1. HR types at least three characters in the location field.
2. After 350 ms, the client aborts any stale lookup and requests at most five
   Photon suggestions, biased toward Vietnam but not restricted to it.
3. HR uses pointer or keyboard to select a result; the full label becomes the
   field value and the OpenStreetMap preview centers on its coordinates.
4. Manual text remains valid if no suggestion is selected or the provider fails.
5. Final create/edit submit sends only the trimmed `location` string.

## Interface Contract

- Provider: `GET {VITE_PHOTON_API_URL || https://photon.komoot.io/api/}` with
  `q`, `limit=5`, `lang`, and Vietnam proximity-bias parameters.
- Campaign create: `POST /api/v1/campaign` adds `location: string`.
- Campaign draft update: `PUT /api/v1/campaign/{id}` may add `location: string`.
- Provider failures are non-blocking and never surface raw error bodies.

## Data Model

No frontend persistence or database migration. Coordinates live only in wizard
memory; CampaignService remains authoritative for the address string.

## UI / Platform Impact

- Reuses the existing satin `Input` and `SectionPanel` design language.
- Implements the ARIA combobox/listbox pattern, arrow/Home/End navigation,
  Enter selection, Escape dismissal, loading, empty, and error states.
- Map preview is responsive and lazy-loaded.

## Observability

- Development-only provider failures may be logged with action context.
- User copy explains that manual entry remains available.

## Alternatives Considered

1. Google Places: strong coverage, but requires a browser API key and provider SDK.
2. Geoapify: simple API, but requires provisioning a key before the feature works.
3. Public Nominatim: rejected because its public usage policy forbids client-side autocomplete.
4. Photon public endpoint: selected for immediate low-volume use, with request
   bounding and an environment override for a future proxy/self-hosted instance.
