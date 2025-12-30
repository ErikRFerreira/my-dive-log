import { useEffect, useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { COUNTRIES } from '@/shared/data/countries';

type CountryComboboxProps = {
  field: {
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
  };
};

function CountryCombobox({ field }: CountryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!field.value) {
      setQuery('');
      return;
    }

    const match = COUNTRIES.find((c) => c.code.toUpperCase() === field.value.toUpperCase());
    setQuery(match?.name ?? field.value);
  }, [field.value]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return COUNTRIES.slice(0, 40);

    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(trimmed)).slice(0, 40);
  }, [query]);

  return (
    <div className="relative">
      <Input
        id={field.name}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="country-options"
        placeholder="Type to search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          field.onBlur();
          window.setTimeout(() => setIsOpen(false), 100);
        }}
      />

      {isOpen && (
        <div
          id="country-options"
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                role="option"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  field.onChange(c.code);
                  setQuery(c.name);
                  setIsOpen(false);
                }}
              >
                {c.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CountryCombobox;

