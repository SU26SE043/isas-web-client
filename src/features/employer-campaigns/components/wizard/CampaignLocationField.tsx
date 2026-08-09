import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ExternalLink, LoaderCircle, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { LocationCoordinates } from '../../types/campaignWizard.types';
import {
  buildOpenStreetMapEmbedUrl,
  buildOpenStreetMapLink,
  searchLocationSuggestions,
  type LocationSuggestion,
} from '../../services/locationAutocomplete.service';

interface CampaignLocationFieldProps {
  value: string;
  coordinates: LocationCoordinates | null;
  invalid?: boolean;
  onChange: (value: string, coordinates: LocationCoordinates | null) => void;
}

type LookupStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

export function CampaignLocationField({
  value,
  coordinates,
  invalid = false,
  onChange,
}: CampaignLocationFieldProps) {
  const { t, language } = useLanguage();
  const listboxId = useId();
  const selectedLabel = useRef('');
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const query = value.trim();
  const shouldLookup = focused && query.length >= 3 && query !== selectedLabel.current;
  const listOpen = shouldLookup && status !== 'idle';

  useEffect(() => {
    if (!shouldLookup) {
      setSuggestions([]);
      setStatus('idle');
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setStatus('loading');
      searchLocationSuggestions(query, language, controller.signal)
        .then((items) => {
          setSuggestions(items);
          setActiveIndex(items.length ? 0 : -1);
          setStatus(items.length ? 'ready' : 'empty');
        })
        .catch((error: unknown) => {
          if ((error as { name?: string }).name === 'AbortError') return;
          if (import.meta.env.DEV) console.warn('[campaign-location] lookup failed', error);
          setSuggestions([]);
          setActiveIndex(-1);
          setStatus('error');
        });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [language, query, shouldLookup]);

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    selectedLabel.current = suggestion.label;
    onChange(suggestion.label, {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setSuggestions([]);
    setStatus('idle');
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!listOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setStatus('idle');
      return;
    }
    if (!suggestions.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(suggestions.length - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  };

  const statusText =
    status === 'loading'
      ? t('employer.campaigns.location.loading')
      : status === 'empty'
        ? t('employer.campaigns.location.empty')
        : status === 'error'
          ? t('employer.campaigns.location.error')
          : status === 'ready'
            ? t('employer.campaigns.location.results').replace('{count}', String(suggestions.length))
            : '';

  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="campaign-location">{t('employer.campaigns.form.location')}</Label>
      <div className="relative" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}>
        <MapPin className="pointer-events-none absolute top-2.5 left-3 z-10 size-4 text-muted-foreground" aria-hidden />
        <Input
          id="campaign-location"
          value={value}
          className="pr-10 pl-9"
          placeholder={t('employer.campaigns.location.placeholder')}
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={listOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            listOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-describedby="campaign-location-help campaign-location-status"
          aria-invalid={invalid}
          aria-busy={status === 'loading'}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            selectedLabel.current = '';
            onChange(event.target.value, null);
          }}
        />
        {status === 'loading' ? (
          <LoaderCircle className="pointer-events-none absolute top-2.5 right-3 size-4 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden />
        ) : null}

        {listOpen ? (
          <div id={listboxId} role="listbox" className="frame-satin absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl bg-surface-elevated p-1 shadow-xl">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={index === activeIndex}
                className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-highlight focus-visible:outline-none aria-selected:bg-surface-highlight"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectSuggestion(suggestion)}
              >
                <span className="block text-sm font-medium text-foreground">{suggestion.label}</span>
                {suggestion.secondaryLabel ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">{suggestion.secondaryLabel}</span>
                ) : null}
              </button>
            ))}
            {status === 'empty' || status === 'error' ? (
              <p className={status === 'error' ? 'px-3 py-2 text-sm text-warning' : 'px-3 py-2 text-sm text-muted-foreground'}>
                {statusText}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <p id="campaign-location-help" className="text-xs text-muted-foreground">
        {t('employer.campaigns.location.help')}
      </p>
      <p id="campaign-location-status" className="sr-only" aria-live="polite">{statusText}</p>

      {coordinates ? (
        <div className="frame-satin overflow-hidden rounded-xl bg-surface-raised">
          <iframe
            className="h-56 w-full border-0 sm:h-64"
            src={buildOpenStreetMapEmbedUrl(coordinates)}
            title={t('employer.campaigns.location.mapTitle')}
            loading="lazy"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs text-muted-foreground">
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:text-foreground">
              {t('employer.campaigns.location.attribution')}
            </a>
            <a href={buildOpenStreetMapLink(coordinates)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground hover:underline">
              {t('employer.campaigns.location.openMap')}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
