import { useEffect, useRef, useState } from "react";
import { useGoogleMapsLoader } from "@/hooks/useGoogleMapsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface LiveMapTrackingProps {
  pickup: Location;
  dropoff: Location;
  driverLocation?: Location;
  isActive?: boolean;
  height?: string;
}

export function LiveMapTracking({ 
  pickup, 
  dropoff, 
  driverLocation, 
  isActive = false,
  height = "400px" 
}: LiveMapTrackingProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { ready, error, google } = useGoogleMapsLoader();
  const [map, setMap] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    if (!ready || !google || !mapRef.current || error) return;

    try {
      // Initialize map
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: pickup,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      // Initialize directions renderer
      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });
      renderer.setMap(mapInstance);

      setMap(mapInstance);
      setDirectionsRenderer(renderer);
    } catch (err) {
      console.error('Error initializing map:', err);
    }
  }, [ready, google, error, pickup]);

  useEffect(() => {
    if (!map || !google || !directionsRenderer) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: any[] = [];

    try {
      // Add pickup marker
      const pickupMarker = new google.maps.Marker({
        position: pickup,
        map: map,
        title: 'Pickup Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      newMarkers.push(pickupMarker);

      // Add dropoff marker
      const dropoffMarker = new google.maps.Marker({
        position: dropoff,
        map: map,
        title: 'Destination',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      newMarkers.push(dropoffMarker);

      // Add driver marker if available
      if (driverLocation && isActive) {
        const driverMarker = new google.maps.Marker({
          position: driverLocation,
          map: map,
          title: 'Driver Location',
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            rotation: 0,
          },
        });
        newMarkers.push(driverMarker);
      }

      setMarkers(newMarkers);

      // Calculate and display route
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickup,
          destination: dropoff,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        }
      );

      // Adjust map bounds to include all points
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickup);
      bounds.extend(dropoff);
      if (driverLocation && isActive) {
        bounds.extend(driverLocation);
      }
      map.fitBounds(bounds);
    } catch (err) {
      console.error('Error updating map markers:', err);
    }
  }, [map, google, pickup, dropoff, driverLocation, isActive, directionsRenderer]);

  if (error || !ready) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <div 
            className="bg-muted rounded-lg flex items-center justify-center"
            style={{ height }}
          >
            <div className="text-center">
              <Navigation className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {error ? 'Map unavailable' : 'Loading map...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Live Route Tracking</h3>
          {isActive && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
              Live
            </Badge>
          )}
        </div>
        <div 
          ref={mapRef} 
          className="w-full rounded-lg overflow-hidden"
          style={{ height }}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Pickup
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            Destination
          </span>
          {driverLocation && isActive && (
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rotate-45 transform"></div>
              Driver
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}