import { useEffect, useId, useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { COUNTRIES } from '@/shared/data/countries';

type CountryComboboxProps = {
  field: {
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
  };
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  className?: string;
  maxResults?: number;
};

function CountryCombobox({
  field,
  id,
  placeholder = 'Type to search',
  ariaLabel,
  ariaDescribedBy,
  ariaInvalid,
  className,
  maxResults = 50,
}: CountryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();

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
    if (!trimmed) return COUNTRIES.slice(0, maxResults);

    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(trimmed) || c.code.toLowerCase().includes(trimmed)
    ).slice(0, maxResults);
  }, [maxResults, query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const selectCountry = (countryCode: string, countryName: string) => {
    field.onChange(countryCode.toUpperCase());
    setQuery(countryName);
    setActiveIndex(-1);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Input
        id={id ?? field.name}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-activedescendant={
          isOpen && activeIndex >= 0 && filtered[activeIndex]
            ? `${listboxId}-option-${filtered[activeIndex].code}`
            : undefined
        }
        placeholder={placeholder}
        value={query}
        className={className}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (!filtered.length) {
            if (e.key === 'Escape') setIsOpen(false);
            return;
          }

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
            setActiveIndex((prev) => (prev + 1) % filtered.length);
            return;
          }

          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setIsOpen(true);
            setActiveIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
            return;
          }

          if (e.key === 'Enter' && isOpen && activeIndex >= 0) {
            e.preventDefault();
            const activeCountry = filtered[activeIndex];
            if (activeCountry) selectCountry(activeCountry.code, activeCountry.name);
            return;
          }

          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        onBlur={() => {
          field.onBlur();
          window.setTimeout(() => setIsOpen(false), 100);
        }}
      />

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
          ) : (
            filtered.map((c, index) => (
              <button
                key={c.code}
                id={`${listboxId}-option-${c.code}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                  index === activeIndex ? 'bg-accent text-accent-foreground' : ''
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  selectCountry(c.code, c.name);
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

