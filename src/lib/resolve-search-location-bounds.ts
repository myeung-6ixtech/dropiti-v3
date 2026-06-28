import { COUNTRIES, getDistrictCentroid } from '@/constants/locations';
import type { MapBounds } from '@/lib/listings-params';

/** Build a bounding box around a point (approximate district / neighborhood size). */
export function boundsAroundPoint(
  lat: number,
  lng: number,
  deltaLat = 0.06,
  deltaLng = 0.06,
): MapBounds {
  return {
    north: lat + deltaLat,
    south: lat - deltaLat,
    east: lng + deltaLng,
    west: lng - deltaLng,
  };
}

function matchDistrictByName(term: string) {
  const key = term.toLowerCase();
  const allDistricts = COUNTRIES.flatMap((c) => c.districts);
  return (
    allDistricts.find((d) => d.name.toLowerCase() === key) ??
    allDistricts.find((d) => d.name.toLowerCase().includes(key)) ??
    allDistricts.find((d) => key.includes(d.name.toLowerCase()))
  );
}

async function geocodeLocation(term: string): Promise<MapBounds | null> {
  if (typeof window === 'undefined' || !window.google?.maps?.Geocoder) {
    return null;
  }

  const geocoder = new window.google.maps.Geocoder();
  const queries = [`${term}, Hong Kong`, `${term}, Macau`, term];

  for (const address of queries) {
    const result = await new Promise<google.maps.GeocoderResult | null>((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results?.[0]) resolve(results[0]);
        else resolve(null);
      });
    });

    if (!result?.geometry) continue;

    const viewport = result.geometry.viewport;
    if (viewport) {
      return {
        north: viewport.getNorthEast().lat(),
        south: viewport.getSouthWest().lat(),
        east: viewport.getNorthEast().lng(),
        west: viewport.getSouthWest().lng(),
      };
    }

    const location = result.geometry.location;
    if (location) {
      return boundsAroundPoint(location.lat(), location.lng(), 0.04, 0.04);
    }
  }

  return null;
}

/**
 * Resolve a free-text location (e.g. "Tung Chung") to map bounds for region-first map search.
 * Tries HK/MO district centroids, then Google Geocoding when available.
 */
export async function resolveSearchLocationBounds(
  location: string,
): Promise<MapBounds | null> {
  const term = location.trim();
  if (!term) return null;

  const district = matchDistrictByName(term);
  if (district) {
    return boundsAroundPoint(district.lat, district.lng);
  }

  for (const countryCode of ['HK', 'MO'] as const) {
    const centroid = getDistrictCentroid(countryCode, term);
    if (centroid) {
      return boundsAroundPoint(centroid.lat, centroid.lng);
    }
  }

  return geocodeLocation(term);
}
