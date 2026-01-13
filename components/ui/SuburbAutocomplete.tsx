'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { getAllSuburbOptions, getCouncilForSuburb, Council, SuburbOption } from '@/lib/councils';
import { MapPin } from 'lucide-react';

interface SuburbAutocompleteProps {
  defaultValue?: string; // This expects a COUNCIL name if editing, but we might want to support suburb if stored
  onSelect: (value: { council: Council; suburb: string }) => void;
  required?: boolean;
}

export function SuburbAutocomplete({ defaultValue, onSelect, required = false }: SuburbAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState<string | null>(defaultValue || null);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const allOptions = useMemo(() => getAllSuburbOptions(), []);

  // Filter suburbs
  const filteredOptions = useMemo(() => {
    if (!query) return [];
    // If query matches "Richmond (City...", we shouldn't filter aggressively.
    // Standard logic: Filter by suburb name startsWith
    return allOptions.filter(opt => 
      opt.suburb.toLowerCase().startsWith(query.toLowerCase())
    ).slice(0, 10);
  }, [query, allOptions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: SuburbOption) => {
    setQuery(`${option.suburb} (${option.council.name})`);
    setSelectedCouncil(option.council.name);
    onSelect({ council: option.council, suburb: option.suburb });
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setSelectedCouncil(null); // Clear selection on edit
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Search your suburb..."
            required={required}
            className="pl-10 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
            autoComplete="off"
        />
        {/* Hidden input to store the actual Council Name for form submission if needed directly */}
        {/* But standard pattern is to use the onSelect to set a hidden field in the parent */}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredOptions.map((opt, idx) => {
             // Create unique key for split suburbs
             const key = `${opt.suburb}-${opt.council.name}`;
             return (
                <li
                    key={key}
                    className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-slate-50 text-slate-900"
                    onClick={() => handleSelect(opt)}
                >
                    <div className="flex flex-col">
                        <span className="truncate font-medium">{opt.suburb}</span>
                        <span className="truncate text-xs text-slate-400">{opt.council.name}</span>
                    </div>
                </li>
             );
          })}
        </ul>
      )}
      
      {isOpen && query && filteredOptions.length === 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm text-slate-500">
              No suburbs found.
          </div>
      )}
    </div>
  );
}
