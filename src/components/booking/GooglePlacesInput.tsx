import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoogleMapsLoader } from "@/hooks/useGoogleMapsApi";

interface Place {
  place_id: string;
  description: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlacesInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string, place?: Place) => void;
  onPlaceSelect?: (place: Place) => void;
  icon?: "pickup" | "dropoff";
  className?: string;
  showCurrentLocation?: boolean;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const GooglePlacesInput = ({
  placeholder,
  value,
  onChange,
  onPlaceSelect,
  icon = "pickup",
  className,
  showCurrentLocation = false
}: GooglePlacesInputProps) => {
  const { ready, error, google } = useGoogleMapsLoader();
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    if (ready && !error && window.google?.maps) {
      try {
        // Initialize services once Maps + Places are ready
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        const mapDiv = document.createElement('div');
        const map = new window.google.maps.Map(mapDiv);
        placesService.current = new window.google.maps.places.PlacesService(map);
      } catch (e) {
        // If creation fails, keep services null so UI gracefully degrades
        autocompleteService.current = null;
        placesService.current = null;
      }
    } else {
      // Not ready or failed: ensure clean state
      autocompleteService.current = null;
      placesService.current = null;
      setShowSuggestions(false);
      setIsLoading(false);
    }

    return () => { cancelled = true; };
  }, [ready, error]);

  const searchPlaces = async (input: string) => {
    if (!ready || !autocompleteService.current || input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    const request = {
      input,
      componentRestrictions: { country: 'in' }, // Restrict to India
      types: ['establishment', 'geocode'],
    };

    autocompleteService.current.getPlacePredictions(
      request,
      (predictions: any[], status: string) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.slice(0, 5));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    searchPlaces(newValue);
  };

  const selectPlace = (place: any) => {
    if (!ready || !placesService.current) return;

    const request = {
      placeId: place.place_id,
      fields: ['formatted_address', 'geometry', 'place_id', 'name']
    };

    placesService.current.getDetails(request, (placeDetails: any, status: string) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
        const selectedPlace: Place = {
          place_id: placeDetails.place_id,
          description: place.description,
          formatted_address: placeDetails.formatted_address,
          geometry: {
            location: {
              lat: placeDetails.geometry.location.lat(),
              lng: placeDetails.geometry.location.lng()
            }
          }
        };
        
        onChange(place.description, selectedPlace);
        onPlaceSelect?.(selectedPlace);
        setShowSuggestions(false);
      }
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return; // Silent fail to avoid noisy UI
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (ready && window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };
          
          geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
            setIsGettingLocation(false);
            if (status === 'OK' && results[0]) {
              const currentPlace: Place = {
                place_id: results[0].place_id,
                description: results[0].formatted_address,
                formatted_address: results[0].formatted_address,
                geometry: {
                  location: { lat: latitude, lng: longitude }
                }
              };
              
              onChange(results[0].formatted_address, currentPlace);
              onPlaceSelect?.(currentPlace);
            } else {
              // Graceful no-op
            }
          });
        } else {
          setIsGettingLocation(false);
        }
      },
      () => {
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        {icon === "pickup" ? (
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-primary z-10" />
        ) : (
          <Navigation2 className="absolute left-3 top-3 w-5 h-5 text-accent z-10" />
        )}
        
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-16 h-12 glass-hover text-base"
        />
        
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {showCurrentLocation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Navigation2 className="w-4 h-4 text-primary" />
              )}
            </Button>
          )}
          
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/20"
              onClick={() => {
                onChange("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-glass-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : (
            suggestions.map((place) => (
              <button
                key={place.place_id}
                className="w-full p-3 text-left hover:bg-accent/20 flex items-center gap-3 transition-colors"
                onClick={() => selectPlace(place)}
              >
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    {place.structured_formatting?.main_text || place.description}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {place.structured_formatting?.secondary_text || place.description}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};