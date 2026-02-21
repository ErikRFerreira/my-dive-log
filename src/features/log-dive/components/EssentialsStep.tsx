import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Calendar, MapPin, Waves } from 'lucide-react';
import { useController } from 'react-hook-form';

import type { Control, UseFormSetValue } from 'react-hook-form';

import CountryCombobox from '@/features/dives/components/CountryCombobox';
import { useGetLocations } from '@/features/dives/hooks/useGetLocations';
import { getLocalDateInputValue } from '@/shared/utils/date';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { convertValueBetweenSystems } from '@/shared/utils/units';
import InlineError from '@/components/common/InlineError';
import { useSettingsStore } from '@/store/settingsStore';

import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';

type Props = {
  control: Control<LogDiveFormInput, unknown, LogDiveFormData>;
  setValue: UseFormSetValue<LogDiveFormInput>;
};

/**
 * Step 1 of dive logging wizard: Essential dive information.
 *
 * Collects required fields:
 * - Date: When the dive occurred (max: today)
 * - Location: Name of dive site with autocomplete from previous locations
 * - Country: Input-driven combobox selection
 * - Max Depth: Maximum depth reached with unit conversion (m/ft)
 * - Duration: Total dive time in minutes
 *
 * Features:
 * - Auto-fills country when matching location is selected
 * - Keyboard-accessible country combobox search
 * - Real-time validation on required fields
 */
export default function EssentialsStep({ control, setValue }: Props) {
  const {
    locations,
    isError: isLocationsError,
    error: locationsError,
  } = useGetLocations();
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
  const todayString = getLocalDateInputValue();
  const maxDepthLimit = unitSystemField.value === 'imperial' ? 164 : 50;

  const normalizeDepthValue = (raw: string, targetUnit: 'metric' | 'imperial') => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return raw;
    const rounded = Math.round(parsed);
    const clamped = Math.max(1, Math.min(targetUnit === 'imperial' ? 164 : 50, rounded));
    return String(clamped);
  };

  // Handles switching between metric and imperial units, converting existing depth value if present
  const switchUnitSystem = (nextUnit: 'metric' | 'imperial') => {
    const prevUnit = unitSystemField.value as 'metric' | 'imperial';
    if (prevUnit === nextUnit) return;

    const currentDepthRaw = String(maxDepthField.value ?? '').trim();
    if (currentDepthRaw) {
      const currentDepth = Number(currentDepthRaw);
      if (Number.isFinite(currentDepth)) {
        const convertedDepth = convertValueBetweenSystems(
          currentDepth,
          'depth',
          prevUnit,
          nextUnit
        );
        const nextDepth = normalizeDepthValue(String(convertedDepth), nextUnit);
        setValue('maxDepth', nextDepth, { shouldDirty: true, shouldValidate: true });
      }
    }

    unitSystemField.onChange(nextUnit);
    setUnitSystem(nextUnit);
  };

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
    }
  };

  return (
    <div className="space-y-6">
      {isLocationsError && (
        <InlineError
          message={getErrorMessage(
            locationsError,
            'Failed to load saved locations. Autocomplete may be limited.'
          )}
        />
      )}
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-foreground mb-6">Essential Information</h2>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Units</label>
          <div
            className="inline-flex rounded-md border border-slate-700 overflow-hidden"
            role="radiogroup"
            aria-label="Unit system"
          >
            <button
              type="button"
              onClick={() => switchUnitSystem('metric')}
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
              onClick={() => switchUnitSystem('imperial')}
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
          htmlFor="country-input"
          className="text-sm font-medium text-foreground flex items-center gap-2 mb-2"
        >
          <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
          Country
        </label>
        <CountryCombobox
          field={countryField}
          id="country-input"
          placeholder="Search countries..."
          ariaLabel="Search countries"
          ariaDescribedBy={countryState.error?.message ? 'country-error' : undefined}
          ariaInvalid={Boolean(countryState.error?.message)}
          className="text-base"
          maxResults={50}
        />
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
            onBlur={() => {
              const raw = String(maxDepthField.value ?? '').trim();
              if (raw && unitSystemField.value) {
                // ensure unit system exists
                const normalized = normalizeDepthValue(raw, unitSystemField.value);
                if (normalized !== raw) {
                  maxDepthField.onChange(normalized);
                }
              }
            }}
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
