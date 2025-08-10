import React from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { Country } from '@/data/countries';

interface CountrySelectProps {
  value: Country;
  onChange: (country: Country) => void;
  countries: Country[];
}

interface OptionType {
  value: string;
  label: string;
  country: Country;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, countries }) => {
  const options: OptionType[] = countries.map(country => ({
    value: country.code,
    label: `${country.flag} ${country.dialCode}`,
    country
  }));

  const customStyles: StylesConfig<OptionType, false> = {
    control: (provided, state) => ({
      ...provided,
      minWidth: '120px',
      borderColor: state.isFocused ? 'rgb(99 102 241)' : 'rgb(226 232 240)',
      boxShadow: state.isFocused ? '0 0 0 1px rgb(99 102 241)' : 'none',
      '&:hover': {
        borderColor: 'rgb(99 102 241)'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'rgb(99 102 241)' 
        : state.isFocused 
        ? 'rgb(241 245 249)' 
        : 'white',
      color: state.isSelected ? 'white' : 'rgb(15 23 42)',
      '&:hover': {
        backgroundColor: state.isSelected ? 'rgb(99 102 241)' : 'rgb(241 245 249)'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'rgb(15 23 42)'
    })
  };

  const handleChange = (newValue: SingleValue<OptionType>) => {
    if (newValue) {
      onChange(newValue.country);
    }
  };

  const selectedOption = options.find(option => option.value === value.code);

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      styles={customStyles}
      isSearchable
      placeholder="Выберите страну"
      formatOptionLabel={(option) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{option.country.flag}</span>
          <span className="font-medium">{option.country.dialCode}</span>
          <span className="text-sm text-slate-600">{option.country.name}</span>
        </div>
      )}
    />
  );
};

export default CountrySelect;