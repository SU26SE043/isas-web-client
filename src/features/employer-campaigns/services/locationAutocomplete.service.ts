import { getPhotonApiUrl } from '@/shared/config/env';
import type { LocationCoordinates } from '../types/campaignWizard.types';

const RESULT_LIMIT = 5;

export type LocationSuggestion = LocationCoordinates & {
  id: string;
  label: string;
  secondaryLabel: string;
};

type PhotonFeature = {
  geometry?: { coordinates?: unknown };
  properties?: Record<string, unknown>;
};

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueParts(parts: string[]): string[] {
  return parts.filter((part, index) => part && parts.indexOf(part) === index);
}

function parseFeature(feature: PhotonFeature, index: number): LocationSuggestion | null {
  const coordinates = feature.geometry?.coordinates;
  const properties = feature.properties;
  if (!Array.isArray(coordinates) || coordinates.length < 2 || !properties) return null;

  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const name = text(properties.name);
  const houseNumber = text(properties.housenumber);
  const street = text(properties.street);
  const streetAddress = [houseNumber, street].filter(Boolean).join(' ');
  const locality = text(properties.district) || text(properties.locality);
  const city = text(properties.city) || text(properties.county);
  const state = text(properties.state);
  const country = text(properties.country);
  const parts = uniqueParts([name, streetAddress, locality, city, state, country]);
  if (parts.length === 0) return null;

  const osmType = text(properties.osm_type);
  const osmId = String(properties.osm_id ?? '').trim();
  return {
    id: osmType && osmId ? `${osmType}-${osmId}` : `place-${longitude}-${latitude}-${index}`,
    label: parts.join(', '),
    secondaryLabel: uniqueParts([locality, city, state, country]).join(', '),
    latitude,
    longitude,
  };
}

export function parsePhotonSuggestions(payload: unknown): LocationSuggestion[] {
  if (!payload || typeof payload !== 'object') return [];
  const features = (payload as { features?: unknown }).features;
  if (!Array.isArray(features)) return [];
  return features
    .map((feature, index) => parseFeature(feature as PhotonFeature, index))
    .filter((item): item is LocationSuggestion => item != null)
    .slice(0, RESULT_LIMIT);
}

export async function searchLocationSuggestions(
  query: string,
  language: 'vi' | 'en',
  signal?: AbortSignal,
): Promise<LocationSuggestion[]> {
  const url = new URL(getPhotonApiUrl());
  url.searchParams.set('q', query.trim());
  url.searchParams.set('limit', String(RESULT_LIMIT));
  url.searchParams.set('lang', language);
  url.searchParams.set('lat', '10.7769');
  url.searchParams.set('lon', '106.7009');
  url.searchParams.set('zoom', '5');
  url.searchParams.set('location_bias_scale', '0.2');

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/geo+json, application/json' },
    signal,
  });
  if (!response.ok) throw new Error(`LOCATION_LOOKUP_${response.status}`);
  return parsePhotonSuggestions(await response.json());
}

export function buildOpenStreetMapEmbedUrl(coordinates: LocationCoordinates): string {
  const { latitude, longitude } = coordinates;
  const delta = 0.008;
  const params = new URLSearchParams({
    bbox: [longitude - delta, latitude - delta, longitude + delta, latitude + delta].join(','),
    layer: 'mapnik',
    marker: `${latitude},${longitude}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

export function buildOpenStreetMapLink(coordinates: LocationCoordinates): string {
  return `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=16/${coordinates.latitude}/${coordinates.longitude}`;
}
