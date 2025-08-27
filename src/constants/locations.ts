// ========================================
// LOCATION CONSTANTS
// ========================================
// Centralized location data for Hong Kong and Macau
// Used across add-property and edit-property components

export interface Country {
  code: string;
  name: string;
  districts: District[];
}

export interface District {
  code: string;
  name: string;
  region?: string; // For grouping districts by region
}

// Hong Kong Districts
const hongKongDistricts: District[] = [
  // Hong Kong Island
  { code: 'central-western', name: 'Central and Western', region: 'Hong Kong Island' },
  { code: 'eastern', name: 'Eastern', region: 'Hong Kong Island' },
  { code: 'southern', name: 'Southern', region: 'Hong Kong Island' },
  { code: 'wan-chai', name: 'Wan Chai', region: 'Hong Kong Island' },
  
  // Kowloon
  { code: 'sham-shui-po', name: 'Sham Shui Po', region: 'Kowloon' },
  { code: 'kowloon-city', name: 'Kowloon City', region: 'Kowloon' },
  { code: 'kwun-tong', name: 'Kwun Tong', region: 'Kowloon' },
  { code: 'wong-tai-sin', name: 'Wong Tai Sin', region: 'Kowloon' },
  { code: 'yau-tsim-mong', name: 'Yau Tsim Mong', region: 'Kowloon' },
  
  // New Territories
  { code: 'islands', name: 'Islands', region: 'New Territories' },
  { code: 'kwai-tsing', name: 'Kwai Tsing', region: 'New Territories' },
  { code: 'north', name: 'North', region: 'New Territories' },
  { code: 'sai-kung', name: 'Sai Kung', region: 'New Territories' },
  { code: 'sha-tin', name: 'Sha Tin', region: 'New Territories' },
  { code: 'tai-po', name: 'Tai Po', region: 'New Territories' },
  { code: 'tsuen-wan', name: 'Tsuen Wan', region: 'New Territories' },
  { code: 'tuen-mun', name: 'Tuen Mun', region: 'New Territories' },
  { code: 'yuen-long', name: 'Yuen Long', region: 'New Territories' },
];

// Macau Districts
const macauDistricts: District[] = [
  // Macau Peninsula
  { code: 'nossa-senhora-de-fatima', name: 'Nossa Senhora de Fátima', region: 'Macau Peninsula' },
  { code: 'santo-antonio', name: 'Santo António', region: 'Macau Peninsula' },
  { code: 'se', name: 'Sé', region: 'Macau Peninsula' },
  { code: 'sao-lazaro', name: 'São Lázaro', region: 'Macau Peninsula' },
  { code: 'sao-lourenco', name: 'São Lourenço', region: 'Macau Peninsula' },
  
  // Taipa
  { code: 'taipa', name: 'Taipa', region: 'Taipa' },
  
  // Coloane
  { code: 'coloane', name: 'Coloane', region: 'Coloane' },
  
  // Cotai
  { code: 'cotai', name: 'Cotai', region: 'Cotai' },
];

// Available Countries
export const COUNTRIES: Country[] = [
  {
    code: 'HK',
    name: 'Hong Kong',
    districts: hongKongDistricts,
  },
  {
    code: 'MO',
    name: 'Macau',
    districts: macauDistricts,
  },
];

// Helper Functions
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(country => country.code === code);
}

export function getDistrictsByCountry(countryCode: string): District[] {
  const country = getCountryByCode(countryCode);
  return country ? country.districts : [];
}

export function getDistrictByCode(countryCode: string, districtCode: string): District | undefined {
  const districts = getDistrictsByCountry(countryCode);
  return districts.find(district => district.code === districtCode);
}

export function getDistrictsByRegion(countryCode: string, region: string): District[] {
  const districts = getDistrictsByCountry(countryCode);
  return districts.filter(district => district.region === region);
}

// Get all district names for a country (for backward compatibility)
export function getDistrictNamesByCountry(countryCode: string): string[] {
  const districts = getDistrictsByCountry(countryCode);
  return districts.map(district => district.name);
}

// Get all regions for a country
export function getRegionsByCountry(countryCode: string): string[] {
  const districts = getDistrictsByCountry(countryCode);
  const regions = districts.map(district => district.region).filter(Boolean) as string[];
  return [...new Set(regions)]; // Remove duplicates
}

// Default values
export const DEFAULT_COUNTRY = 'HK'; // Hong Kong
export const DEFAULT_DISTRICT = 'central-western'; // Central and Western

// Validation
export function isValidCountry(countryCode: string): boolean {
  return COUNTRIES.some(country => country.code === countryCode);
}

export function isValidDistrict(countryCode: string, districtCode: string): boolean {
  const districts = getDistrictsByCountry(countryCode);
  return districts.some(district => district.code === districtCode);
}
