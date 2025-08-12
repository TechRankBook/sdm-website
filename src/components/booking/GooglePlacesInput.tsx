import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlacesApi } from "@/hooks/usePlacesApi";

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


export const GooglePlacesInput = ({
  placeholder,
  value,
  onChange,
  onPlaceSelect,
  icon = "pickup",
  className,
  showCurrentLocation = false
}: GooglePlacesInputProps) => {
  const places = usePlacesApi();
  const [sessionToken, setSessionToken] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // No script initialization needed for REST-based Places API; we keep UI minimal and resilient


  const searchPlaces = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await places.autocomplete(input, sessionToken);
      if (res) {
        setSessionToken(res.sessiontoken);
        setSuggestions((res.predictions || []).slice(0, 5));
        setShowSuggestions((res.predictions || []).length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    searchPlaces(newValue);
  };

  const selectPlace = async (place: any) => {
    try {
      const details = await places.placeDetails(place.place_id, sessionToken);
      if (details) {
        const selectedPlace: Place = {
          place_id: details.place_id,
          description: place.description,
          formatted_address: details.formatted_address,
          geometry: {
            location: {
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
            },
          },
        };
        onChange(place.description, selectedPlace);
        onPlaceSelect?.(selectedPlace);
        setShowSuggestions(false);
      }
    } catch {
      // silent fail
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await places.reverseGeocode(latitude, longitude);
          setIsGettingLocation(false);
          if (result) {
            const currentPlace: Place = {
              place_id: result.place_id || `${latitude},${longitude}`,
              description: result.formatted_address,
              formatted_address: result.formatted_address,
              geometry: { location: { lat: latitude, lng: longitude } },
            };
            onChange(result.formatted_address, currentPlace);
            onPlaceSelect?.(currentPlace);
          }
        } catch {
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
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-glass-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((place: any) => (
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
          ))}
        </div>
      )}
    </div>
  );
};