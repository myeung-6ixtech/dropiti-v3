import { useJsApiLoader, type Libraries } from '@react-google-maps/api';

/** Shared script id — every loader call must use identical options. */
export const GOOGLE_MAP_SCRIPT_ID = 'google-map-script';

/** Stable reference (do not inline a new array in components). */
export const GOOGLE_MAP_LIBRARIES: Libraries = ['maps'];

/** Shared Google Maps JS API loader for SearchMap, PropertyMap, etc. */
export function useGoogleMapsLoader() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return useJsApiLoader({
    id: GOOGLE_MAP_SCRIPT_ID,
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAP_LIBRARIES,
  });
}
