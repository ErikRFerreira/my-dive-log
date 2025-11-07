import { countries as countryMap } from 'countries-list';

export type Country = { code: string; name: string };

export const COUNTRIES: Country[] = Object.entries(countryMap)
  .map(([code, meta]) => ({ code, name: (meta as { name: string }).name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_CODE_SET = new Set(COUNTRIES.map((c) => c.code));
