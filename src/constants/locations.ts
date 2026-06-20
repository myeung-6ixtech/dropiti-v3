// ========================================
// LOCATION CONSTANTS
// ========================================
// Centralized location data for Hong Kong and Macau
// Used across add-property and edit-property components
// District lat/lng synced with dropiti-nhost `_lib/geo/centroids.json`

export interface Country {
  code: string;
  name: string;
  lat: number;
  lng: number;
  districts: District[];
}

export interface District {
  code: string;
  name: string;
  region?: string;
  lat: number;
  lng: number;
}

const hongKongDistricts: District[] = [
  { code: 'central-western', name: 'Central and Western', region: 'Hong Kong Island', lat: 22.286, lng: 114.154 },
  { code: 'eastern', name: 'Eastern', region: 'Hong Kong Island', lat: 22.284, lng: 114.224 },
  { code: 'southern', name: 'Southern', region: 'Hong Kong Island', lat: 22.247, lng: 114.16 },
  { code: 'wan-chai', name: 'Wan Chai', region: 'Hong Kong Island', lat: 22.28, lng: 114.173 },
  { code: 'sham-shui-po', name: 'Sham Shui Po', region: 'Kowloon', lat: 22.33, lng: 114.162 },
  { code: 'kowloon-city', name: 'Kowloon City', region: 'Kowloon', lat: 22.328, lng: 114.191 },
  { code: 'kwun-tong', name: 'Kwun Tong', region: 'Kowloon', lat: 22.313, lng: 114.225 },
  { code: 'wong-tai-sin', name: 'Wong Tai Sin', region: 'Kowloon', lat: 22.341, lng: 114.193 },
  { code: 'yau-tsim-mong', name: 'Yau Tsim Mong', region: 'Kowloon', lat: 22.306, lng: 114.171 },
  { code: 'islands', name: 'Islands', region: 'New Territories', lat: 22.261, lng: 113.946 },
  { code: 'kwai-tsing', name: 'Kwai Tsing', region: 'New Territories', lat: 22.354, lng: 114.126 },
  { code: 'north', name: 'North', region: 'New Territories', lat: 22.494, lng: 114.138 },
  { code: 'sai-kung', name: 'Sai Kung', region: 'New Territories', lat: 22.381, lng: 114.273 },
  { code: 'sha-tin', name: 'Sha Tin', region: 'New Territories', lat: 22.387, lng: 114.195 },
  { code: 'tai-po', name: 'Tai Po', region: 'New Territories', lat: 22.45, lng: 114.164 },
  { code: 'tsuen-wan', name: 'Tsuen Wan', region: 'New Territories', lat: 22.371, lng: 114.114 },
  { code: 'tuen-mun', name: 'Tuen Mun', region: 'New Territories', lat: 22.391, lng: 113.977 },
  { code: 'yuen-long', name: 'Yuen Long', region: 'New Territories', lat: 22.445, lng: 114.022 },
];

const macauDistricts: District[] = [
  { code: 'nossa-senhora-de-fatima', name: 'Nossa Senhora de Fátima', region: 'Macau Peninsula', lat: 22.198, lng: 113.549 },
  { code: 'santo-antonio', name: 'Santo António', region: 'Macau Peninsula', lat: 22.193, lng: 113.539 },
  { code: 'se', name: 'Sé', region: 'Macau Peninsula', lat: 22.192, lng: 113.541 },
  { code: 'sao-lazaro', name: 'São Lázaro', region: 'Macau Peninsula', lat: 22.194, lng: 113.548 },
  { code: 'sao-lourenco', name: 'São Lourenço', region: 'Macau Peninsula', lat: 22.189, lng: 113.536 },
  { code: 'taipa', name: 'Taipa', region: 'Taipa', lat: 22.157, lng: 113.559 },
  { code: 'coloane', name: 'Coloane', region: 'Coloane', lat: 22.127, lng: 113.563 },
  { code: 'cotai', name: 'Cotai', region: 'Cotai', lat: 22.142, lng: 113.561 },
];

export const COUNTRIES: Country[] = [
  { code: 'HK', name: 'Hong Kong', lat: 22.3193, lng: 114.1694, districts: hongKongDistricts },
  { code: 'MO', name: 'Macau', lat: 22.1987, lng: 113.5439, districts: macauDistricts },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((country) => country.code === code);
}

export function getDistrictsByCountry(countryCode: string): District[] {
  const country = getCountryByCode(countryCode);
  return country ? country.districts : [];
}

export function getDistrictByCode(countryCode: string, districtCode: string): District | undefined {
  const districts = getDistrictsByCountry(countryCode);
  return districts.find((district) => district.code === districtCode);
}

export function getDistrictsByRegion(countryCode: string, region: string): District[] {
  const districts = getDistrictsByCountry(countryCode);
  return districts.filter((district) => district.region === region);
}

export function getDistrictNamesByCountry(countryCode: string): string[] {
  return getDistrictsByCountry(countryCode).map((district) => district.name);
}

export function getRegionsByCountry(countryCode: string): string[] {
  const districts = getDistrictsByCountry(countryCode);
  const regions = districts.map((district) => district.region).filter(Boolean) as string[];
  return [...new Set(regions)];
}

export const DEFAULT_COUNTRY = 'HK';
export const DEFAULT_DISTRICT = 'central-western';

export function isValidCountry(countryCode: string): boolean {
  return COUNTRIES.some((country) => country.code === countryCode);
}

export function isValidDistrict(countryCode: string, districtCode: string): boolean {
  return getDistrictsByCountry(countryCode).some((district) => district.code === districtCode);
}

/** Resolve district centroid for map preview (falls back to country center). */
export function getDistrictCentroid(
  countryCode: string,
  districtCodeOrName: string,
): { lat: number; lng: number } | null {
  const districts = getDistrictsByCountry(countryCode);
  const key = districtCodeOrName.trim().toLowerCase();
  const match =
    districts.find((d) => d.code === key || d.name.toLowerCase() === key) ??
    districts.find((d) => d.name.toLowerCase().includes(key));
  if (match) return { lat: match.lat, lng: match.lng };
  const country = getCountryByCode(countryCode);
  return country ? { lat: country.lat, lng: country.lng } : null;
}
