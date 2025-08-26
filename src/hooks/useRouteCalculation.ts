import { useState, useCallback } from 'react';
import { useGoogleMapsLoader } from './useGoogleMapsApi';

export interface RouteData {
  distance: string; // in kilometers as string
  duration: string; // in minutes as string  
  routes: any[]; // google.maps.DirectionsRoute[];
}

interface UseRouteCalculationReturn {
  routeData: RouteData | null;
  isLoading: boolean;
  error: string | null;
  calculateRoute: (origin: string, destination: string) => Promise<void>;
}

export const useRouteCalculation = (): UseRouteCalculationReturn => {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ready, google } = useGoogleMapsLoader();

  const calculateRoute = useCallback(async (origin: string, destination: string) => {
    if (!ready || !google || !origin || !destination) {
      setError('Google Maps not ready or missing locations');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const directionsService = new google.maps.DirectionsService();
      
      const result = await new Promise<any>((resolve, reject) => {
        directionsService.route(
          {
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              resolve(result);
            } else {
              reject(new Error(`Directions request failed: ${status}`));
            }
          }
        );
      });

      if (result.routes && result.routes.length > 0) {
        const route = result.routes[0];
        const leg = route.legs[0];
        
        const distanceKm = leg.distance ? leg.distance.value / 1000 : 0;
        const durationMinutes = leg.duration ? leg.duration.value / 60 : 0;

        setRouteData({
          distance: (Math.round(distanceKm * 100) / 100).toString(), // Convert to string
          duration: Math.round(durationMinutes).toString(), // Convert to string
          routes: result.routes
        });
      } else {
        throw new Error('No routes found');
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate route');
      setRouteData(null);
    } finally {
      setIsLoading(false);
    }
  }, [ready, google]);

  return {
    routeData,
    isLoading,
    error,
    calculateRoute
  };
};