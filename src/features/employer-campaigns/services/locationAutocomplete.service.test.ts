import { describe, expect, it, vi } from 'vitest';
import {
  buildOpenStreetMapEmbedUrl,
  parsePhotonSuggestions,
  searchLocationSuggestions,
} from './locationAutocomplete.service';

describe('location autocomplete service', () => {
  it('parses valid Photon features and skips malformed coordinates', () => {
    const result = parsePhotonSuggestions({
      features: [
        {
          geometry: { coordinates: [106.7009, 10.7769] },
          properties: {
            osm_type: 'W',
            osm_id: 123,
            name: 'Bitexco Financial Tower',
            street: 'Hải Triều',
            housenumber: '2',
            district: 'Quận 1',
            city: 'Thành phố Hồ Chí Minh',
            country: 'Việt Nam',
          },
        },
        { geometry: { coordinates: ['bad', null] }, properties: { name: 'Bad' } },
      ],
    });

    expect(result).toEqual([
      {
        id: 'W-123',
        label: 'Bitexco Financial Tower, 2 Hải Triều, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
        secondaryLabel: 'Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
        latitude: 10.7769,
        longitude: 106.7009,
      },
    ]);
  });

  it('returns no suggestions for invalid envelopes', () => {
    expect(parsePhotonSuggestions(null)).toEqual([]);
    expect(parsePhotonSuggestions({ features: 'invalid' })).toEqual([]);
  });

  it('uses a Photon-supported locale for Vietnamese UI lookups', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await searchLocationSuggestions('FPT', 'vi');

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.searchParams.get('q')).toBe('FPT');
    expect(requestUrl.searchParams.get('lang')).toBe('en');

    vi.unstubAllGlobals();
  });

  it('builds an encoded OSM embed with a marker', () => {
    const url = new URL(
      buildOpenStreetMapEmbedUrl({ latitude: 10.7769, longitude: 106.7009 }),
    );
    expect(url.origin).toBe('https://www.openstreetmap.org');
    expect(url.searchParams.get('marker')).toBe('10.7769,106.7009');
    expect(url.searchParams.get('layer')).toBe('mapnik');
  });
});
