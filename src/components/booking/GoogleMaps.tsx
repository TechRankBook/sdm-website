import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

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
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleMaps = ({ pickup, dropoff, height = "300px", onRouteUpdate }: GoogleMapsProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const directionsService = useRef<any>(null);
  const directionsRenderer = useRef<any>(null);
  const pickupMarker = useRef<any>(null);
  const dropoffMarker = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        setIsLoaded(true);
        return;
      }

      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAejqe2t4TAptcLnkpoFTTNMhm0SFHFJgQ&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeMap();
          setIsLoaded(true);
        };
        document.head.appendChild(script);
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      // Default center (Bangalore)
      const defaultCenter = { lat: 12.9716, lng: 77.5946 };
      
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: pickup || defaultCenter,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      });

      directionsService.current = new window.google.maps.DirectionsService();
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#6366f1',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      directionsRenderer.current.setMap(mapInstance.current);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstance.current) return;

    // Clear existing markers
    if (pickupMarker.current) {
      pickupMarker.current.setMap(null);
    }
    if (dropoffMarker.current) {
      dropoffMarker.current.setMap(null);
    }

    // Add pickup marker
    if (pickup) {
      pickupMarker.current = new window.google.maps.Marker({
        position: pickup,
        map: mapInstance.current,
        title: pickup.address || 'Pickup Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#22c55e" stroke="white" stroke-width="4"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });
    }

    // Add dropoff marker
    if (dropoff) {
      dropoffMarker.current = new window.google.maps.Marker({
        position: dropoff,
        map: mapInstance.current,
        title: dropoff.address || 'Dropoff Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="white" stroke-width="4"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });
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
  }, [pickup, dropoff, isLoaded]);

  const calculateRoute = (origin: Location, destination: Location) => {
    if (!directionsService.current || !directionsRenderer.current) return;

    const request = {
      origin: new window.google.maps.LatLng(origin.lat, origin.lng),
      destination: new window.google.maps.LatLng(destination.lat, destination.lng),
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false
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

  return (
    <Card className="glass overflow-hidden">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg"
      />
      {!isLoaded && (
        <div 
          style={{ height }}
          className="flex items-center justify-center bg-accent/20"
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </Card>
  );
};