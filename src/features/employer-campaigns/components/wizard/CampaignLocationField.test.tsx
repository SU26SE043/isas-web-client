// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LocationCoordinates } from '../../types/campaignWizard.types';
import { CampaignLocationField } from './CampaignLocationField';
import { searchLocationSuggestions } from '../../services/locationAutocomplete.service';

const messages: Record<string, string> = {
  'employer.campaigns.form.location': 'Location',
  'employer.campaigns.location.placeholder': 'Enter a building',
  'employer.campaigns.location.help': 'Type 3 characters',
  'employer.campaigns.location.loading': 'Searching',
  'employer.campaigns.location.empty': 'No places',
  'employer.campaigns.location.error': 'Unavailable',
  'employer.campaigns.location.results': '{count} places found.',
  'employer.campaigns.location.mapTitle': 'Selected map',
  'employer.campaigns.location.attribution': 'OSM attribution',
  'employer.campaigns.location.openMap': 'Open map',
};

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'en', t: (key: string) => messages[key] ?? key }),
}));

vi.mock('../../services/locationAutocomplete.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/locationAutocomplete.service')>();
  return { ...actual, searchLocationSuggestions: vi.fn() };
});

function Harness() {
  const [value, setValue] = useState('');
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  return (
    <CampaignLocationField
      value={value}
      coordinates={coordinates}
      onChange={(nextValue, nextCoordinates) => {
        setValue(nextValue);
        setCoordinates(nextCoordinates);
      }}
    />
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(searchLocationSuggestions).mockResolvedValue([
    { id: 'a', label: 'First address', secondaryLabel: 'District 1', latitude: 10, longitude: 106 },
    { id: 'b', label: 'Second address', secondaryLabel: 'District 3', latitude: 11, longitude: 107 },
  ]);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('CampaignLocationField', () => {
  it('debounces suggestions and selects the active option with the keyboard', async () => {
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Location' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'hochiminh' } });
    expect(searchLocationSuggestions).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(350);
      await Promise.resolve();
    });
    expect(searchLocationSuggestions).toHaveBeenCalledWith('hochiminh', 'en', expect.any(AbortSignal));
    expect(screen.getAllByRole('option')).toHaveLength(2);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('Second address');
    expect(screen.getByTitle('Selected map')).toHaveAttribute(
      'src',
      expect.stringContaining('marker=11%2C107'),
    );
  });
});
