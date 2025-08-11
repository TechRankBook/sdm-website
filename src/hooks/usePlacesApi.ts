// Lightweight REST-based Places API utilities using key2 for autocomplete + details + reverse geocode
// Keeps Places independent from the Google Maps JS loader and avoids race conditions

import { useMemo } from 'react';

const PLACES_API_KEY = 'AIzaSyA7sn0fs6f0vRDm3RIkRKn_R-haAgH4M0A'; // key2 specifically for Places

export interface RestPlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface RestPlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  name?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export function usePlacesApi() {
  // No script to load for REST endpoints; treat as ready and rely on per-call error handling
  const ready = true;
  const error: Error | null = null;

  const api = useMemo(() => {
    const makeSessionToken = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : undefined);

    const autocomplete = async (input: string, sessiontoken?: string) => {
      const token = sessiontoken || makeSessionToken();
      const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
      url.searchParams.set('key', PLACES_API_KEY);
      url.searchParams.set('input', input);
      url.searchParams.set('components', 'country:in');
      url.searchParams.set('types', 'geocode');
      if (token) url.searchParams.set('sessiontoken', token);

      const data = await fetchJson<any>(url.toString());
      if (data.status !== 'OK' || !Array.isArray(data.predictions)) return { predictions: [] as RestPlacePrediction[], sessiontoken: token };
      return { predictions: data.predictions as RestPlacePrediction[], sessiontoken: token };
    };

    const placeDetails = async (placeId: string, sessiontoken?: string): Promise<RestPlaceDetails | null> => {
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.set('key', PLACES_API_KEY);
      url.searchParams.set('place_id', placeId);
      url.searchParams.set('fields', 'formatted_address,geometry,place_id,name');
      if (sessiontoken) url.searchParams.set('sessiontoken', sessiontoken);

      const data = await fetchJson<any>(url.toString());
      if (data.status !== 'OK' || !data.result) return null;
      const r = data.result;
      return {
        place_id: r.place_id,
        formatted_address: r.formatted_address,
        geometry: { location: { lat: r.geometry.location.lat, lng: r.geometry.location.lng } },
        name: r.name,
      };
    };

    const reverseGeocode = async (lat: number, lng: number): Promise<{ formatted_address: string; place_id?: string } | null> => {
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      url.searchParams.set('latlng', `${lat},${lng}`);
      url.searchParams.set('key', PLACES_API_KEY);
      const data = await fetchJson<any>(url.toString());
      if (data.status !== 'OK' || !Array.isArray(data.results) || !data.results[0]) return null;
      return { formatted_address: data.results[0].formatted_address, place_id: data.results[0].place_id };
    };

    return { autocomplete, placeDetails, reverseGeocode };
  }, []);

  return { ready, error, ...api } as const;
}
