import React from 'react';
import { Button } from '@/components/ui/button';
import { Country } from '@/data/countries';
import Icon from '@/components/ui/icon';

interface CountrySelectProps {
  value: Country;
  onChange: (country: Country) => void;
  countries: Country[];
}

const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, countries }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[120px] justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{value.flag}</span>
          <span className="font-medium">{value.dialCode}</span>
        </div>
        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
              >
                <span className="text-lg">{country.flag}</span>
                <span className="font-medium">{country.dialCode}</span>
                <span className="text-sm text-slate-600 truncate">{country.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CountrySelect;