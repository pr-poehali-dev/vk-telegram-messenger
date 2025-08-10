export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  phoneLength: number[];
}

export const countries: Country[] = [
  { code: 'RU', name: 'Россия', dialCode: '+7', flag: '🇷🇺', phoneLength: [10] },
  { code: 'US', name: 'США', dialCode: '+1', flag: '🇺🇸', phoneLength: [10] },
  { code: 'GB', name: 'Великобритания', dialCode: '+44', flag: '🇬🇧', phoneLength: [10] },
  { code: 'DE', name: 'Германия', dialCode: '+49', flag: '🇩🇪', phoneLength: [10, 11] },
  { code: 'FR', name: 'Франция', dialCode: '+33', flag: '🇫🇷', phoneLength: [9] },
  { code: 'IT', name: 'Италия', dialCode: '+39', flag: '🇮🇹', phoneLength: [9, 10] },
  { code: 'ES', name: 'Испания', dialCode: '+34', flag: '🇪🇸', phoneLength: [9] },
  { code: 'UA', name: 'Украина', dialCode: '+380', flag: '🇺🇦', phoneLength: [9] },
  { code: 'BY', name: 'Беларусь', dialCode: '+375', flag: '🇧🇾', phoneLength: [9] },
  { code: 'KZ', name: 'Казахстан', dialCode: '+7', flag: '🇰🇿', phoneLength: [10] },
  { code: 'CN', name: 'Китай', dialCode: '+86', flag: '🇨🇳', phoneLength: [11] },
  { code: 'JP', name: 'Япония', dialCode: '+81', flag: '🇯🇵', phoneLength: [10] },
  { code: 'KR', name: 'Южная Корея', dialCode: '+82', flag: '🇰🇷', phoneLength: [10, 11] },
  { code: 'IN', name: 'Индия', dialCode: '+91', flag: '🇮🇳', phoneLength: [10] },
  { code: 'BR', name: 'Бразилия', dialCode: '+55', flag: '🇧🇷', phoneLength: [10, 11] },
  { code: 'AR', name: 'Аргентина', dialCode: '+54', flag: '🇦🇷', phoneLength: [10] },
  { code: 'MX', name: 'Мексика', dialCode: '+52', flag: '🇲🇽', phoneLength: [10] },
  { code: 'CA', name: 'Канада', dialCode: '+1', flag: '🇨🇦', phoneLength: [10] },
  { code: 'AU', name: 'Австралия', dialCode: '+61', flag: '🇦🇺', phoneLength: [9] },
  { code: 'TR', name: 'Турция', dialCode: '+90', flag: '🇹🇷', phoneLength: [10] },
  { code: 'EG', name: 'Египет', dialCode: '+20', flag: '🇪🇬', phoneLength: [10] },
  { code: 'ZA', name: 'ЮАР', dialCode: '+27', flag: '🇿🇦', phoneLength: [9] },
  { code: 'AE', name: 'ОАЭ', dialCode: '+971', flag: '🇦🇪', phoneLength: [9] },
  { code: 'SA', name: 'Саудовская Аравия', dialCode: '+966', flag: '🇸🇦', phoneLength: [9] },
  { code: 'IL', name: 'Израиль', dialCode: '+972', flag: '🇮🇱', phoneLength: [9] },
];

export const validatePhoneNumber = (phone: string, country: Country): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return country.phoneLength.includes(cleanPhone.length);
};

export const formatPhoneNumber = (phone: string, country: Country): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (country.code === 'RU' || country.code === 'KZ') {
    // Российский/Казахский формат: +7 999 999 99 99
    if (cleanPhone.length <= 3) return cleanPhone;
    if (cleanPhone.length <= 6) return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3)}`;
    if (cleanPhone.length <= 8) return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 8)} ${cleanPhone.slice(8, 10)}`;
  }
  
  if (country.code === 'US' || country.code === 'CA') {
    // Американский/Канадский формат: +1 999 999 9999
    if (cleanPhone.length <= 3) return cleanPhone;
    if (cleanPhone.length <= 6) return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3)}`;
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 10)}`;
  }
  
  if (country.code === 'DE') {
    // Немецкий формат: +49 999 999 9999
    if (cleanPhone.length <= 3) return cleanPhone;
    if (cleanPhone.length <= 6) return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3)}`;
    if (cleanPhone.length <= 9) return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 10)}`;
  }
  
  // Стандартный формат для остальных стран
  const maxLength = Math.max(...country.phoneLength);
  if (cleanPhone.length <= 3) return cleanPhone;
  if (cleanPhone.length <= 6) return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3)}`;
  return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, maxLength)}`;
};