import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, MapPin, Waves } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useController } from 'react-hook-form';
import type { Control, UseFormSetValue } from 'react-hook-form';

import { useGetLocations } from '@/features/dives/hooks/useGetLocations';
import { COUNTRIES } from '@/shared/data/countries';
import { useSettingsStore } from '@/store/settingsStore';

import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';

type Props = {
  control: Control<LogDiveFormInput, unknown, LogDiveFormData>;
  setValue: UseFormSetValue<LogDiveFormInput>;
};

/**
 * Custom hook that debounces a value by a specified delay.
 * Prevents excessive updates during rapid user input (e.g., search queries).
 *
 * @param value - The value to debounce
 * @param delayMs - Delay in milliseconds before updating
 * @returns The debounced value
 */
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Step 1 of dive logging wizard: Essential dive information.
 *
 * Collects required fields:
 * - Date: When the dive occurred (max: today)
 * - Location: Name of dive site with autocomplete from previous locations
 * - Country: Country selection with virtual scrolling for performance
 * - Max Depth: Maximum depth reached with unit conversion (m/ft)
 * - Duration: Total dive time in minutes
 *
 * Features:
 * - Auto-fills country when matching location is selected
 * - Debounced country search for smooth filtering
 * - Virtual scrolling for large country list
 * - Real-time validation on required fields
 */
export default function EssentialsStep({ control, setValue }: Props) {
  const { locations, isLoading: isLoadingLocations } = useGetLocations();
  // Country search filter input
  const [countryQuery, setCountryQuery] = useState('');
  // Scroll position for virtual scrolling optimization
  const [scrollTop, setScrollTop] = useState(0);
  // Reference to scrollable country list container
  const listRef = useRef<HTMLDivElement | null>(null);
  const { field: dateField, fieldState: dateState } = useController({ name: 'date', control });
  const { field: locationField, fieldState: locationState } = useController({
    name: 'location',
    control,
  });
  const { field: countryField, fieldState: countryState } = useController({
    name: 'countryCode',
    control,
  });
  const { field: maxDepthField, fieldState: maxDepthState } = useController({
    name: 'maxDepth',
    control,
  });
  const { field: unitSystemField } = useController({
    name: 'unitSystem',
    control,
  });
  const { field: durationField, fieldState: durationState } = useController({
    name: 'duration',
    control,
  });
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);
  const todayString = new Date().toISOString().split('T')[0];
  const maxDepthLimit = unitSystemField.value === 'imperial' ? 164 : 50;

  // Debounce search query to reduce re-renders during typing
  const debouncedQuery = useDebouncedValue(countryQuery, 150);

  /**
   * Attempts to auto-fill country when user selects or types a location name.
   * Matches against previously logged locations to reduce manual data entry.
   */
  const tryAutofillCountryByLocationName = (locationName: string) => {
    const normalizedInput = locationName.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalizedInput) return;

    const match = locations.find(
      (l) => l.name.replace(/\s+/g, ' ').trim().toLowerCase() === normalizedInput
    );

    if (match?.country_code) {
      const normalizedCode = match.country_code.toUpperCase();
      setValue('countryCode', normalizedCode, { shouldDirty: true, shouldValidate: true });
      setCountryQuery('');
    }
  };

  // Filter countries by search query (name or code)
  const filteredCountries = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);
  // Resolve currently selected country from code for display
  const selectedCountry = useMemo(() => {
    const code = countryField.value?.toUpperCase();
    if (!code) return null;
    return COUNTRIES.find((c) => c.code.toUpperCase() === code) ?? null;
  }, [countryField.value]);

  // Reset scroll position when search query changes
  useEffect(() => {
    setScrollTop(0);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [debouncedQuery]);

  /**
   * Virtual scrolling implementation for country list.
   * Only renders visible items plus small buffer to improve performance.
   * Spacer divs maintain proper scroll height for non-rendered items.
   */
  const ITEM_HEIGHT = 36;
  const LIST_HEIGHT = 240;
  const totalCount = filteredCountries.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT));
  const visibleCount = Math.ceil(LIST_HEIGHT / ITEM_HEIGHT) + 2;
  const endIndex = Math.min(totalCount, startIndex + visibleCount);
  const visibleItems = filteredCountries.slice(startIndex, endIndex);
  const topSpacer = startIndex * ITEM_HEIGHT;
  const bottomSpacer = Math.max(0, (totalCount - endIndex) * ITEM_HEIGHT);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-foreground mb-6">Essential Information</h2>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Units</label>
          <div
            className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden"
            role="radiogroup"
            aria-label="Unit system"
          >
            <button
              type="button"
              onClick={() => {
                unitSystemField.onChange('metric');
                setUnitSystem('metric');
              }}
              role="radio"
              aria-checked={unitSystemField.value === 'metric'}
              className={`px-3 py-1 text-xs ${
                unitSystemField.value === 'metric'
                  ? 'bg-primary text-black'
                  : 'bg-transparent text-muted-foreground'
              }`}
            >
              Metric
            </button>
            <button
              type="button"
              onClick={() => {
                unitSystemField.onChange('imperial');
                setUnitSystem('imperial');
              }}
              role="radio"
              aria-checked={unitSystemField.value === 'imperial'}
              className={`px-3 py-1 text-xs ${
                unitSystemField.value === 'imperial'
                  ? 'bg-primary text-black'
                  : 'bg-transparent text-muted-foreground'
              }`}
            >
              Imperial
            </button>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="dive-date"
          className="text-sm font-medium text-foreground flex items-center gap-2 mb-2"
        >
          <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
          Dive Date
        </label>
        <Input
          id="dive-date"
          type="date"
          max={todayString}
          value={dateField.value}
          onChange={(e) => dateField.onChange(e.target.value)}
          onBlur={dateField.onBlur}
          aria-invalid={Boolean(dateState.error?.message)}
          aria-describedby={dateState.error?.message ? 'dive-date-error' : undefined}
          className="text-base"
        />
        {dateState.error?.message && (
          <p id="dive-date-error" className="mt-1 text-sm text-destructive">
            {dateState.error.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="dive-location"
          className="text-sm font-medium text-foreground flex items-center gap-2 mb-2"
        >
          <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
          Dive Site Location
        </label>
        <Input
          id="dive-location"
          type="text"
          placeholder="e.g., Blue Hole"
          value={locationField.value}
          onChange={(e) => {
            locationField.onChange(e.target.value);
            tryAutofillCountryByLocationName(e.target.value);
          }}
          onBlur={(e) => {
            locationField.onBlur();
            tryAutofillCountryByLocationName(e.target.value);
          }}
          aria-invalid={Boolean(locationState.error?.message)}
          aria-describedby={locationState.error?.message ? 'dive-location-error' : undefined}
          className="text-base"
          list="location-suggestions"
          disabled={isLoadingLocations}
        />
        {locationState.error?.message && (
          <p id="dive-location-error" className="mt-1 text-sm text-destructive">
            {locationState.error.message}
          </p>
        )}
        <datalist id="location-suggestions">
          {locations.map((l) => (
            <option key={l.id} value={l.name} />
          ))}
        </datalist>
      </div>

      <div>
        <label
          id="country-label"
          className="text-sm font-medium text-foreground flex items-center gap-2 mb-2"
        >
          <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
          Country
        </label>
        <Select value={countryField.value} onValueChange={(value) => countryField.onChange(value)}>
          <SelectTrigger
            id="country-trigger"
            aria-labelledby="country-label"
            aria-describedby={countryState.error?.message ? 'country-error' : undefined}
          >
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <div className="p-2">
              <Input
                placeholder="Search countries..."
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                aria-label="Search countries"
                className="h-8"
              />
            </div>
            {selectedCountry && (
              <SelectItem value={selectedCountry.code} className="hidden">
                {selectedCountry.name}
              </SelectItem>
            )}
            <div
              ref={listRef}
              className="overflow-y-auto"
              style={{ maxHeight: LIST_HEIGHT }}
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            >
              <div style={{ height: topSpacer }} />
              {visibleItems.length ? (
                visibleItems.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
              )}
              <div style={{ height: bottomSpacer }} />
            </div>
          </SelectContent>
        </Select>
        {countryState.error?.message && (
          <p id="country-error" className="mt-1 text-sm text-destructive">
            {countryState.error.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="max-depth"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Waves className="w-4 h-4 text-primary" aria-hidden="true" />
              Max Depth ({unitSystemField.value === 'metric' ? 'm' : 'ft'})
            </label>
          </div>
          <NumberInput
            id="max-depth"
            placeholder={unitSystemField.value === 'metric' ? 'e.g., 30' : 'e.g., 100'}
            value={maxDepthField.value}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                maxDepthField.onChange(val);
                return;
              }
              const num = Number(val);
              if (Number.isNaN(num)) {
                maxDepthField.onChange(val);
                return;
              }
              maxDepthField.onChange(num < 1 ? '1' : val);
            }}
            onBlur={maxDepthField.onBlur}
            min={1}
            max={maxDepthLimit}
            aria-invalid={Boolean(maxDepthState.error?.message)}
            aria-describedby={maxDepthState.error?.message ? 'max-depth-error' : undefined}
            className="text-base"
          />
          {maxDepthState.error?.message && (
            <p id="max-depth-error" className="mt-1 text-sm text-destructive">
              {maxDepthState.error.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="dive-duration"
            className="text-sm font-medium text-foreground flex items-center gap-2 mb-2"
          >
            <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
            Duration (min)
          </label>
          <NumberInput
            id="dive-duration"
            placeholder="e.g., 45"
            value={durationField.value}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                durationField.onChange(val);
                return;
              }
              const num = Number(val);
              if (Number.isNaN(num)) {
                durationField.onChange(val);
                return;
              }
              if (num < 1) {
                durationField.onChange('1');
                return;
              }
              durationField.onChange(num > 200 ? '200' : val);
            }}
            onBlur={durationField.onBlur}
            min={1}
            max={200}
            aria-invalid={Boolean(durationState.error?.message)}
            aria-describedby={durationState.error?.message ? 'dive-duration-error' : undefined}
            className="text-base"
          />
          {durationState.error?.message && (
            <p id="dive-duration-error" className="mt-1 text-sm text-destructive">
              {durationState.error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
