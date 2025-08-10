import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useGoogleMapsLoader } from "@/hooks/useGoogleMapsApi";

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface GoogleMapsProps {
  pickup?: Location;
  dropoff?: Location;
  height?: string;
  onRouteUpdate?: (distance: string, duration: string, distanceValue: number, durationValue: number) => void;
  // New interactive picking options
  interactive?: boolean;
  activeMarker?: 'pickup' | 'dropoff';
  onPickupChange?: (loc: Location) => void;
  onDropoffChange?: (loc: Location) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleMaps = ({ pickup, dropoff, height = "300px", onRouteUpdate, interactive = false, activeMarker = 'pickup', onPickupChange, onDropoffChange }: GoogleMapsProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const directionsService = useRef<any>(null);
  const directionsRenderer = useRef<any>(null);
  const pickupMarker = useRef<any>(null);
  const dropoffMarker = useRef<any>(null);
  const geocoder = useRef<any>(null);
  const classesRef = useRef<{ Marker?: any } | null>(null);
  const { ready, error } = useGoogleMapsLoader();

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!isMounted) return;
      if (!mapRef.current || !window.google) return;

      const g = window.google;
      // Import modular classes
      const { Map, Marker } = await g.maps.importLibrary('maps');
      const { DirectionsService, DirectionsRenderer } = await g.maps.importLibrary('routes');
      const { Geocoder } = await g.maps.importLibrary('geocoding');

      classesRef.current = { Marker };

      // Default center (Bangalore)
      const defaultCenter = { lat: 12.9716, lng: 77.5946 };

      mapInstance.current = new Map(mapRef.current, {
        zoom: 13,
        center: pickup || defaultCenter,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      });

      directionsService.current = new DirectionsService();
      directionsRenderer.current = new DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#6366f1',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
        map: mapInstance.current,
      });
      geocoder.current = new Geocoder();
    };

    if (ready && !error && !mapInstance.current) {
      initializeMap();
    }

    return () => {
      isMounted = false;
    };
  }, [ready, error]);

  useEffect(() => {
    if (!ready || !!error || !mapInstance.current) return;

    // Clear existing markers
    if (pickupMarker.current) {
      pickupMarker.current.setMap(null);
    }
    if (dropoffMarker.current) {
      dropoffMarker.current.setMap(null);
    }

    // Add pickup marker
    if (pickup) {
      const MarkerClass = classesRef.current?.Marker || window.google?.maps?.Marker;
      if (MarkerClass) {
        const icon: any = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#22c55e" stroke="white" stroke-width="4"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
        };
        if (window.google?.maps?.Size && window.google?.maps?.Point) {
          icon.scaledSize = new window.google.maps.Size(32, 32);
          icon.anchor = new window.google.maps.Point(16, 16);
        }
        pickupMarker.current = new MarkerClass({
          position: pickup,
          map: mapInstance.current,
          title: pickup.address || 'Pickup Location',
          draggable: interactive,
          icon,
        });

        if (interactive && onPickupChange) {
          pickupMarker.current.addListener('dragend', async (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const address = await reverseGeocode(lat, lng);
            onPickupChange({ lat, lng, address });
          });
        }
      }
    }

    // Add dropoff marker
    if (dropoff) {
      const MarkerClass = classesRef.current?.Marker || window.google?.maps?.Marker;
      if (MarkerClass) {
        const icon: any = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="white" stroke-width="4"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
        };
        if (window.google?.maps?.Size && window.google?.maps?.Point) {
          icon.scaledSize = new window.google.maps.Size(32, 32);
          icon.anchor = new window.google.maps.Point(16, 16);
        }
        dropoffMarker.current = new MarkerClass({
          position: dropoff,
          map: mapInstance.current,
          title: dropoff.address || 'Dropoff Location',
          draggable: interactive,
          icon,
        });

        if (interactive && onDropoffChange) {
          dropoffMarker.current.addListener('dragend', async (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const address = await reverseGeocode(lat, lng);
            onDropoffChange({ lat, lng, address });
          });
        }
      }
    }

    // Calculate and display route if both locations are available
    if (pickup && dropoff && directionsService.current && directionsRenderer.current) {
      calculateRoute(pickup, dropoff);
    } else if (pickup || dropoff) {
      // Center map on available location
      const location = pickup || dropoff!;
      mapInstance.current.setCenter(location);
      mapInstance.current.setZoom(15);
    }
  }, [pickup, dropoff, ready, error]);

  const calculateRoute = (origin: Location, destination: Location) => {
    if (!directionsService.current || !directionsRenderer.current) return;

    const request = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: 'DRIVING' as any,
      avoidHighways: false,
      avoidTolls: false,
    };

    directionsService.current.route(request, (result: any, status: string) => {
      if (status === 'OK') {
        directionsRenderer.current.setDirections(result);
        
        // Extract route information
        const route = result.routes[0];
        if (route && route.legs && route.legs[0]) {
          const leg = route.legs[0];
          const distance = leg.distance.text;
          const duration = leg.duration.text;
          const distanceValue = leg.distance.value; // in meters
          const durationValue = leg.duration.value; // in seconds
          
          onRouteUpdate?.(distance, duration, distanceValue, durationValue);
        }
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  };

  function reverseGeocode(lat: number, lng: number): Promise<string> {
    return new Promise((resolve) => {
      if (!geocoder.current) return resolve('');
      geocoder.current.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        if (status === 'OK' && results?.[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve('');
        }
      });
    });
  }

  // Map click to select locations
  useEffect(() => {
    if (!ready || !!error || !mapInstance.current || !interactive) return;
    const g = window.google;
    g.maps.event.clearListeners(mapInstance.current, 'click');
    mapInstance.current.addListener('click', async (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const address = await reverseGeocode(lat, lng);
      const loc = { lat, lng, address };
      if (activeMarker === 'pickup') {
        onPickupChange?.(loc);
      } else {
        onDropoffChange?.(loc);
      }
    });
  }, [ready, error, interactive, activeMarker, onPickupChange, onDropoffChange]);

  if (!ready || !!error) {
    return null; // Hide map entirely if API isn't ready or failed
  }

  return (
    <Card className="glass overflow-hidden">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg"
      />
    </Card>
  );
};