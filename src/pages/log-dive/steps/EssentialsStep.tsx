import { Input } from '@/components/ui/input';
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

import { COUNTRIES } from '@/shared/data/countries';
import type { Location } from '@/features/locations';

import type { LogDiveFormData } from '../schema';

type Props = {
  control: Control<LogDiveFormData, unknown, LogDiveFormData>;
  setValue: UseFormSetValue<LogDiveFormData>;
  locations: Location[];
  isLoadingLocations: boolean;
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

export default function EssentialsStep({
  control,
  setValue,
  locations,
  isLoadingLocations,
}: Props) {
  const [countryQuery, setCountryQuery] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
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
  const { field: depthUnitField } = useController({
    name: 'depthUnit',
    control,
  });
  const { field: durationField, fieldState: durationState } = useController({
    name: 'duration',
    control,
  });

  const debouncedQuery = useDebouncedValue(countryQuery, 150);

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

  const filteredCountries = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);
  const selectedCountry = useMemo(() => {
    const code = countryField.value?.toUpperCase();
    if (!code) return null;
    return COUNTRIES.find((c) => c.code.toUpperCase() === code) ?? null;
  }, [countryField.value]);

  useEffect(() => {
    setScrollTop(0);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [debouncedQuery]);

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
      <h2 className="text-2xl font-bold text-foreground mb-6">Essential Information</h2>

      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-teal-500" />
          Dive Date
        </label>
        <Input
          type="date"
          value={dateField.value}
          onChange={(e) => dateField.onChange(e.target.value)}
          onBlur={dateField.onBlur}
          className="text-base"
        />
        {dateState.error?.message && (
          <p className="mt-1 text-sm text-destructive">{dateState.error.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-teal-500" />
          Dive Site Location
        </label>
        <Input
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
          className="text-base"
          list="location-suggestions"
          disabled={isLoadingLocations}
        />
        {locationState.error?.message && (
          <p className="mt-1 text-sm text-destructive">{locationState.error.message}</p>
        )}
        <datalist id="location-suggestions">
          {locations.map((l) => (
            <option key={l.id} value={l.name} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-teal-500" />
          Country
        </label>
        <Select
          value={countryField.value}
          onValueChange={(value) => countryField.onChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <div className="p-2">
              <Input
                placeholder="Search countries..."
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
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
          <p className="mt-1 text-sm text-destructive">{countryState.error.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-500" />
              Max Depth ({depthUnitField.value === 'metric' ? 'm' : 'ft'})
            </label>
            <div className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                onClick={() => depthUnitField.onChange('metric')}
                className={`px-2 py-1 text-xs ${
                  depthUnitField.value === 'metric'
                    ? 'bg-teal-500 text-white'
                    : 'bg-transparent text-muted-foreground'
                }`}
              >
                m
              </button>
              <button
                type="button"
                onClick={() => depthUnitField.onChange('imperial')}
                className={`px-2 py-1 text-xs ${
                  depthUnitField.value === 'imperial'
                    ? 'bg-teal-500 text-white'
                    : 'bg-transparent text-muted-foreground'
                }`}
              >
                ft
              </button>
            </div>
          </div>
          <Input
            type="number"
            placeholder={depthUnitField.value === 'metric' ? 'e.g., 30' : 'e.g., 100'}
            value={maxDepthField.value}
            onChange={(e) => maxDepthField.onChange(e.target.value)}
            onBlur={maxDepthField.onBlur}
            className="text-base"
          />
          {maxDepthState.error?.message && (
            <p className="mt-1 text-sm text-destructive">{maxDepthState.error.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-cyan-500" />
            Duration (min)
          </label>
          <Input
            type="number"
            placeholder="e.g., 45"
            value={durationField.value}
            onChange={(e) => durationField.onChange(e.target.value)}
            onBlur={durationField.onBlur}
            className="text-base"
          />
          {durationState.error?.message && (
            <p className="mt-1 text-sm text-destructive">{durationState.error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
