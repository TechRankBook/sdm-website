// Lightweight Places API via Supabase Edge Function proxy (uses key2 server-side)
// Keeps Places independent from the Google Maps JS loader and avoids race conditions

import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function usePlacesApi() {
  const ready = true; // proxy is stateless; calls handle errors per-request
  const error: Error | null = null;

  const api = useMemo(() => {
    const makeSessionToken = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : undefined);

    const autocomplete = async (input: string, sessiontoken?: string) => {
      const token = sessiontoken || makeSessionToken();
      const { data, error } = await supabase.functions.invoke('places-proxy', {
        body: { action: 'autocomplete', input, sessiontoken: token },
      });
      if (error || !data) return { predictions: [] as RestPlacePrediction[], sessiontoken: token };
      const predictions = Array.isArray((data as any).predictions) ? (data as any).predictions : [];
      return { predictions, sessiontoken: token };
    };

    const placeDetails = async (placeId: string, sessiontoken?: string): Promise<RestPlaceDetails | null> => {
      const { data, error } = await supabase.functions.invoke('places-proxy', {
        body: { action: 'details', place_id: placeId, sessiontoken },
      });
      if (error || !data) return null;
      return data as RestPlaceDetails;
    };

    const reverseGeocode = async (lat: number, lng: number): Promise<{ formatted_address: string; place_id?: string } | null> => {
      const { data, error } = await supabase.functions.invoke('places-proxy', {
        body: { action: 'reverse_geocode', lat, lng },
      });
      if (error || !data) return null;
      return data as { formatted_address: string; place_id?: string };
    };

    return { autocomplete, placeDetails, reverseGeocode };
  }, []);

  return { ready, error, ...api } as const;
}
