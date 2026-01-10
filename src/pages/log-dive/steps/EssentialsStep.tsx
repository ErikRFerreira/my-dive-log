import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, MapPin, Waves } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { UnitSystem } from '@/shared/constants';
import { COUNTRIES } from '@/shared/data/countries';
import type { Location } from '@/features/locations';

import type { LogDiveFormData } from '../types';

type Props = {
  formData: LogDiveFormData;
  localUnitSystem: UnitSystem;
  onChange: <K extends keyof LogDiveFormData>(field: K, value: LogDiveFormData[K]) => void;
  locations: Location[];
  isLoadingLocations: boolean;
};

export default function EssentialsStep({
  formData,
  localUnitSystem,
  onChange,
  locations,
  isLoadingLocations,
}: Props) {
  const [countryQuery, setCountryQuery] = useState('');

  const tryAutofillCountryByLocationName = (locationName: string) => {
    const normalizedInput = locationName.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalizedInput) return;

    const match = locations.find(
      (l) => l.name.replace(/\s+/g, ' ').trim().toLowerCase() === normalizedInput
    );

    if (match?.country_code) {
      onChange('countryCode', match.country_code);
      setCountryQuery('');
    }
  };

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countryQuery]);

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
          value={formData.date}
          onChange={(e) => onChange('date', e.target.value)}
          className="text-base"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-teal-500" />
          Dive Site Location
        </label>
        <Input
          type="text"
          placeholder="e.g., Blue Hole"
          value={formData.location}
          onChange={(e) => {
            onChange('location', e.target.value);
            tryAutofillCountryByLocationName(e.target.value);
          }}
          onBlur={(e) => tryAutofillCountryByLocationName(e.target.value)}
          className="text-base"
          list="location-suggestions"
          disabled={isLoadingLocations}
        />
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
          value={formData.countryCode}
          onValueChange={(value) => {
            onChange('countryCode', value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto">
            <div className="p-2">
              <Input
                placeholder="Search countries..."
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                className="h-8"
              />
            </div>
            {filteredCountries.length ? (
              filteredCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Waves className="w-4 h-4 text-cyan-500" />
            Max Depth ({localUnitSystem === 'metric' ? 'm' : 'ft'})
          </label>
          <Input
            type="number"
            placeholder={localUnitSystem === 'metric' ? 'e.g., 30' : 'e.g., 100'}
            value={formData.maxDepth}
            onChange={(e) => onChange('maxDepth', e.target.value)}
            className="text-base"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-cyan-500" />
            Duration (min)
          </label>
          <Input
            type="number"
            placeholder="e.g., 45"
            value={formData.duration}
            onChange={(e) => onChange('duration', e.target.value)}
            className="text-base"
          />
        </div>
      </div>
    </div>
  );
}
