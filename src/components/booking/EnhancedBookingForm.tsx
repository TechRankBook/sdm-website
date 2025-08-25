import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { GooglePlacesInput } from "./GooglePlacesInput";
import { GoogleMaps } from "./GoogleMaps";
import { useFareCalculation } from "@/hooks/useFareCalculation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useRentalPackages } from "@/hooks/useRentalPackages";
import { useGoogleMapsLoader } from "@/hooks/useGoogleMapsApi";
import { 
  Clock, 
  Car,
  Users,
  Calendar as CalendarIcon,
  Plane,
  RotateCcw,
  Route,
  ChevronRight,
  Plus,
  X,
  Minus,
  Luggage,
  Zap,
  MapPin,
  Navigation2,
  TimerReset,
  PawPrint,
  MessageSquare
} from "lucide-react";
import { BookingData } from "@/stores/bookingStore";

interface BookingFormProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export const EnhancedBookingForm = ({ bookingData, updateBookingData, onNext }: BookingFormProps) => {
  const [serviceType, setServiceType] = useState(bookingData.serviceType);
  const [pickupLocation, setPickupLocation] = useState(bookingData.pickupLocation);
  const [dropoffLocation, setDropoffLocation] = useState(bookingData.dropoffLocation || "");
  const [scheduledDateTime, setScheduledDateTime] = useState(bookingData.scheduledDateTime || "");
  const [passengers, setPassengers] = useState(bookingData.passengers || 2);
  const [vehicleType, setVehicleType] = useState(bookingData.vehicleType || "All");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [hours, setHours] = useState(bookingData.packageSelection || ""); // Keep for backward compatibility
  const [tripType, setTripType] = useState(bookingData.tripType || "oneway");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (bookingData.scheduledDateTime) {
      return new Date(bookingData.scheduledDateTime);
    }
    return undefined;
  });
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (bookingData.scheduledDateTime) {
      const date = new Date(bookingData.scheduledDateTime);
      return date.toTimeString().slice(0, 5);
    }
    return "";
  });
  const [isRoundTrip, setIsRoundTrip] = useState(bookingData.isRoundTrip || false);
  const [returnDate, setReturnDate] = useState<Date>(() => {
    if (bookingData.returnDateTime) {
      return new Date(bookingData.returnDateTime);
    }
    return undefined;
  });
  const [returnTime, setReturnTime] = useState<string>(() => {
    if (bookingData.returnDateTime) {
      const date = new Date(bookingData.returnDateTime);
      return date.toTimeString().slice(0, 5);
    }
    return "";
  });
  const [luggageCount, setLuggageCount] = useState(0);
  const [hasPet, setHasPet] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState(bookingData.specialInstructions || "");
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
  const [preferSharing, setPreferSharing] = useState(false);
  const [selectedAirportTerminal, setSelectedAirportTerminal] = useState("");
  const [pickupTerminal, setPickupTerminal] = useState("");
  const [dropoffTerminal, setDropoffTerminal] = useState("");
  const [pickupLocationError, setPickupLocationError] = useState("");
  const [dropoffLocationError, setDropoffLocationError] = useState("");
  const [dateTimeError, setDateTimeError] = useState("");

  // Get rental packages for car rental service
  const { packages, isLoading: packagesLoading } = useRentalPackages({
    vehicleType: vehicleType === "All" ? undefined : vehicleType
  });

  const airportTerminals = {
    "terminal1": {
      name: "Terminal 1 – Kempegowda International Airport",
      address: "Terminal 1, Kempegowda International Airport, Devanahalli, Bengaluru, Karnataka 560300, India",
      coordinates: { lat: 13.1986, lng: 77.7066 }
    },
    "terminal2": {
      name: "Terminal 2 – Kempegowda International Airport", 
      address: "Terminal 2, Kempegowda International Airport, Devanahalli, Bengaluru, Karnataka 560300, India",
      coordinates: { lat: 13.1979, lng: 77.7064 }
    }
  };
  
  // Location coordinates
  const [pickupCoords, setPickupCoords] = useState<LocationData | null>(() => {
    if (bookingData.pickupLatitude && bookingData.pickupLongitude) {
      return {
        lat: bookingData.pickupLatitude,
        lng: bookingData.pickupLongitude,
        address: bookingData.pickupLocation
      };
    }
    return null;
  });
  const [dropoffCoords, setDropoffCoords] = useState<LocationData | null>(() => {
    if (bookingData.dropoffLatitude && bookingData.dropoffLongitude) {
      return {
        lat: bookingData.dropoffLatitude,
        lng: bookingData.dropoffLongitude,
        address: bookingData.dropoffLocation || ""
      };
    }
    return null;
  });
  const [activeMarker, setActiveMarker] = useState<'pickup' | 'dropoff'>('pickup');
  const mapsLoader = useGoogleMapsLoader();

  const handlePickupChangeFromMap = (loc: LocationData) => {
    setPickupCoords(loc);
    if (loc.address) setPickupLocation(loc.address);
  };

  const handleDropoffChangeFromMap = (loc: LocationData) => {
    setDropoffCoords(loc);
    if (loc.address) setDropoffLocation(loc.address);
  };

  const [routeData, setRouteData] = useState<{
    distance: string;
    duration: string;
    distanceKm: number;
    durationMinutes: number;
  } | null>(() => {
    if (bookingData.distanceKm && bookingData.durationMinutes) {
      return {
        distance: `${bookingData.distanceKm.toFixed(1)} km`,
        duration: `${Math.round(bookingData.durationMinutes)} min`,
        distanceKm: bookingData.distanceKm,
        durationMinutes: bookingData.durationMinutes
      };
    }
    return null;
  });

  // Sync local state with booking data whenever it changes
  useEffect(() => {
    setServiceType(bookingData.serviceType);
    setPickupLocation(bookingData.pickupLocation);
    setDropoffLocation(bookingData.dropoffLocation || "");
    setPassengers(bookingData.passengers || 2);
    setPackageDetails(null);
    setHours(bookingData.packageSelection || "");
    setTripType(bookingData.tripType || "oneway");
    setIsRoundTrip(bookingData.isRoundTrip || false);
    // Parse existing special instructions
    if (bookingData.specialInstructions) {
      const instructions = bookingData.specialInstructions;
      
      // Extract luggage count
      const luggageMatch = instructions.match(/(\d+) luggage item/);
      if (luggageMatch) {
        setLuggageCount(parseInt(luggageMatch[1]));
      }
      
      // Check for pet
      setHasPet(instructions.includes("Traveling with pet"));
      
      // Extract additional instructions
      let additionalText = instructions;
      additionalText = additionalText.replace(/\d+ luggage item(s)?(,\s*)?/, "");
      additionalText = additionalText.replace(/Traveling with pet(,\s*)?/, "");
      setAdditionalInstructions(additionalText.trim());
      
      setSpecialInstructions(bookingData.specialInstructions);
      
      // Show special instructions section if there are any
      setShowSpecialInstructions(true);
    } else {
      setLuggageCount(0);
      setHasPet(false);
      setAdditionalInstructions("");
      setSpecialInstructions("");
      setShowSpecialInstructions(false);
    }
    
    // Set dates and times
    if (bookingData.scheduledDateTime) {
      const scheduledDate = new Date(bookingData.scheduledDateTime);
      setSelectedDate(scheduledDate);
      setSelectedTime(scheduledDate.toTimeString().slice(0, 5));
    }
    
    if (bookingData.returnDateTime) {
      const returnDate = new Date(bookingData.returnDateTime);
      setReturnDate(returnDate);
      setReturnTime(returnDate.toTimeString().slice(0, 5));
    }
    
    // Set coordinates
    if (bookingData.pickupLatitude && bookingData.pickupLongitude) {
      setPickupCoords({
        lat: bookingData.pickupLatitude,
        lng: bookingData.pickupLongitude,
        address: bookingData.pickupLocation
      });
    }
    
    if (bookingData.dropoffLatitude && bookingData.dropoffLongitude) {
      setDropoffCoords({
        lat: bookingData.dropoffLatitude,
        lng: bookingData.dropoffLongitude,
        address: bookingData.dropoffLocation || ""
      });
    }
    
    // Set route data
    if (bookingData.distanceKm && bookingData.durationMinutes) {
      setRouteData({
        distance: `${bookingData.distanceKm.toFixed(1)} km`,
        duration: `${Math.round(bookingData.durationMinutes)} min`,
        distanceKm: bookingData.distanceKm,
        durationMinutes: bookingData.durationMinutes
      });
    }
  }, [bookingData]);

  // Modal states
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const serviceTypes = [
    { id: "city_ride", name: "Requested Ride", icon: Car },
    { id: "airport", name: "Airport Taxi", icon: Plane },
    { id: "outstation", name: "Outstation", icon: Route },
    { id: "car_rental", name: "Hourly Rentals", icon: TimerReset }
  ];

  const vehicleTypes = [
    { type: "Sedan", capacity: "4 passengers", estimatedTime: "5 min" },
    { type: "SUV", capacity: "6 passengers", estimatedTime: "7 min" },
    { type: "Premium", capacity: "4 passengers", estimatedTime: "10 min" }
  ];

  // Get fare calculation for all vehicle types
  const sedanFare = useFareCalculation({
    serviceType,
    vehicleType: "Sedan",
    distanceKm: routeData?.distanceKm || 0,
    durationMinutes: routeData?.durationMinutes || 0,
  });

  const suvFare = useFareCalculation({
    serviceType,
    vehicleType: "SUV",
    distanceKm: routeData?.distanceKm || 0,
    durationMinutes: routeData?.durationMinutes || 0,
  });

  const premiumFare = useFareCalculation({
    serviceType,
    vehicleType: "Premium",
    distanceKm: routeData?.distanceKm || 0,
    durationMinutes: routeData?.durationMinutes || 0,
  });

  const handlePickupSelect = (place: any) => {
    // Validate location radius for Mysore/Bangalore
    const lat = place.geometry.location.lat;
    const lng = place.geometry.location.lng;
    
    const isWithinRadius = validateLocationRadius(lat, lng);
    if (!isWithinRadius) {
      setPickupLocationError("❌ We're currently unavailable in this location. Please select a location near Mysore or Bangalore.");
      return;
    } else {
      setPickupLocationError("");
    }
    
    setPickupCoords({
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.description
    });
  };

  const handlePickupTerminalSelect = (terminal: string) => {
    setPickupTerminal(terminal);
    const terminalData = airportTerminals[terminal as keyof typeof airportTerminals];
    setPickupLocation(terminalData.address);
    setPickupCoords({
      lat: terminalData.coordinates.lat,
      lng: terminalData.coordinates.lng,
      address: terminalData.address
    });
    setPickupLocationError("");
  };

  const handleDropoffTerminalSelect = (terminal: string) => {
    setDropoffTerminal(terminal);
    const terminalData = airportTerminals[terminal as keyof typeof airportTerminals];
    setDropoffLocation(terminalData.address);
    setDropoffCoords({
      lat: terminalData.coordinates.lat,
      lng: terminalData.coordinates.lng,
      address: terminalData.address
    });
    setDropoffLocationError("");
  };

  const handleDropoffSelect = (place: any) => {
    // Validate location radius for Mysore/Bangalore
    const lat = place.geometry.location.lat;
    const lng = place.geometry.location.lng;
    
    const isWithinRadius = validateLocationRadius(lat, lng);
    if (!isWithinRadius) {
      setDropoffLocationError("❌ We're currently unavailable in this location. Please select a location near Mysore or Bangalore.");
      return;
    } else {
      setDropoffLocationError("");
    }
    
    setDropoffCoords({
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.description
    });
  };

  // Function to validate location radius (within 50km of Mysore or Bangalore)
  const validateLocationRadius = (lat: number, lng: number) => {
    const mysoreCoords = { lat: 12.2958, lng: 76.6394 }; // Mysore coordinates
    const bangaloreCoords = { lat: 12.9716, lng: 77.5946 }; // Bangalore coordinates
    
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    
    const distanceFromMysore = calculateDistance(lat, lng, mysoreCoords.lat, mysoreCoords.lng);
    const distanceFromBangalore = calculateDistance(lat, lng, bangaloreCoords.lat, bangaloreCoords.lng);
    
    return distanceFromMysore <= 50 || distanceFromBangalore <= 50;
  };

  const handleRouteUpdate = (distance: string, duration: string, distanceValue: number, durationValue: number) => {
    setRouteData({
      distance,
      duration,
      distanceKm: distanceValue / 1000, // Convert meters to km
      durationMinutes: durationValue / 60 // Convert seconds to minutes
    });
  };

  const isFormValid = useCallback(() => {
    // Remove excessive logging that was causing performance issues
    const hasPickup = pickupLocation.trim() !== "";
    const hasDestination = serviceType === "car_rental" ? selectedPackage !== "" : dropoffLocation.trim() !== "";
    const hasDateTime = selectedDate && selectedTime;
    const hasValidReturn = !isRoundTrip || serviceType !== "outstation" || (returnDate && returnTime);
    
    return hasPickup && hasDestination && hasDateTime && hasValidReturn;
  }, [pickupLocation, serviceType, hours, dropoffLocation, selectedDate, selectedTime, isRoundTrip, returnDate, returnTime]);

  const handleSearchCars = useCallback(() => {
    console.log("🚗 Search Cars clicked! Starting submission...");
    
    try {
      if (!isFormValid()) {
        console.log("❌ Form validation failed");
        return;
      }

      // Validate 6-hour advance booking rule
      if (selectedDate && selectedTime) {
        const now = new Date();
        const selectedDateTime = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':').map(Number);
        selectedDateTime.setHours(hours, minutes, 0, 0);
        
        const timeDiff = selectedDateTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff < 6) {
          setDateTimeError("❌ You must book at least 6 hours in advance.");
          return;
        } else {
          setDateTimeError("");
        }
      }

      console.log("✅ Form validation passed - preparing data...");

      // Create datetime in local timezone to prevent date shifting
      const dateTime = selectedDate && selectedTime 
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}T${selectedTime}:00`
        : "";
      
      const returnDateTime = isRoundTrip && returnDate && returnTime
        ? `${returnDate.getFullYear()}-${String(returnDate.getMonth() + 1).padStart(2, '0')}-${String(returnDate.getDate()).padStart(2, '0')}T${returnTime}:00`
        : "";

      // Make sure special instructions are up to date
      updateSpecialInstructions();
      
      const bookingDataToUpdate = {
        serviceType,
        pickupLocation,
        dropoffLocation: serviceType === "car_rental" ? undefined : dropoffLocation,
        scheduledDateTime: dateTime,
        returnDateTime,
        passengers,
        packageSelection: serviceType === "car_rental" ? selectedPackage : undefined,
        isRoundTrip,
        tripType,
        specialInstructions,
        pickupLatitude: pickupCoords?.lat,
        pickupLongitude: pickupCoords?.lng,
        dropoffLatitude: dropoffCoords?.lat,
        dropoffLongitude: dropoffCoords?.lng,
        distanceKm: routeData?.distanceKm || 0,
        durationMinutes: routeData?.durationMinutes || 0
      };

      console.log("📦 Updating booking data:", bookingDataToUpdate);
      
      updateBookingData(bookingDataToUpdate);

      console.log("➡️ Calling onNext() to proceed...");
      onNext();
      
      console.log("✅ Navigation completed successfully!");
      
    } catch (error) {
      console.error("💥 Error in handleSearchCars:", error);
    }
  }, [
    isFormValid, selectedDate, selectedTime, isRoundTrip, returnDate, returnTime,
    serviceType, pickupLocation, dropoffLocation, passengers, hours, tripType,
    specialInstructions, pickupCoords, dropoffCoords, routeData, updateBookingData, onNext
  ]);

  const handleVehicleSelection = (vehicleType: string, fareData: any) => {
    const dateTime = selectedDate && selectedTime 
      ? `${format(selectedDate, "yyyy-MM-dd")} ${selectedTime}`
      : "";
    
    const returnDateTime = returnDate && returnTime && isRoundTrip
      ? `${format(returnDate, "yyyy-MM-dd")} ${returnTime}`
      : "";
      
    // Make sure special instructions are up to date
    updateSpecialInstructions();
    
    updateBookingData({
      serviceType,
      pickupLocation,
      dropoffLocation: serviceType === "car_rental" ? undefined : dropoffLocation,
      scheduledDateTime: dateTime,
      passengers,
      packageSelection: serviceType === "car_rental" ? selectedPackage : undefined,
      carType: vehicleType,
      selectedFare: {
        type: vehicleType,
        price: fareData?.totalFare || 0
      },
      isRoundTrip,
      returnDateTime,
      tripType,
      specialInstructions
    });
    onNext();
  };

  const formatDateTime = (datetime: string) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  const canAddStops = serviceType !== "car_rental";
  
  // Function to update special instructions
  const updateSpecialInstructions = () => {
    // If special instructions section is hidden, clear the instructions
    if (!showSpecialInstructions) {
      setSpecialInstructions("");
      return "";
    }
    
    const parts = [];
    
    if (luggageCount > 0) {
      parts.push(`${luggageCount} luggage item${luggageCount !== 1 ? 's' : ''}`);
    }
    
    if (hasPet) {
      parts.push("Traveling with pet");
    }
    
    if (preferSharing && serviceType === "airport") {
      parts.push("Preferred sharing for cost-effective travel");
    }
    
    if (selectedAirportTerminal) {
      parts.push(`Terminal: ${selectedAirportTerminal}`);
    }
    
    if (additionalInstructions.trim()) {
      parts.push(additionalInstructions.trim());
    }
    
    const combined = parts.join(", ");
    setSpecialInstructions(combined);
    return combined;
  };
  
  // Update special instructions whenever any of the fields change
  useEffect(() => {
    updateSpecialInstructions();
  }, [luggageCount, hasPet, additionalInstructions, showSpecialInstructions, preferSharing, selectedAirportTerminal]);

  return (
    <>
      {/* Booking Form */}
      <Card className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Book Your Ride</h2>
            <div className="flex gap-2 p-1 glass rounded-lg overflow-x-auto scrollbar-hide">
              {serviceTypes.map((service) => (
                <Button
                  key={service.id}
                  variant={serviceType === service.id ? "default" : "ghost"}
                  className={cn(
                    "h-auto py-3 px-2 flex flex-col gap-2 text-xs transition-all duration-200 flex-shrink-0 min-w-[80px]",
                    serviceType === service.id 
                      ? "bg-gradient-primary text-white shadow-glow" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                  )}
                  onClick={() => {
                    setServiceType(service.id);
                    if (service.id === "car_rental") {
                      setDropoffLocation("");
                      setDropoffCoords(null);
                    } else {
                      setHours("");
                    }
                  }}
                >
                  <service.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-center leading-tight text-[10px] sm:text-xs whitespace-nowrap">{service.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Trip Type for Outstation and Airport */}
          {(serviceType === "outstation" || serviceType === "airport") && (
            <div className="mb-6">
              <div className="flex gap-2 p-1 glass rounded-lg">
                {serviceType === "outstation" ? (
                  <>
                    <Button
                      variant={tripType === "oneway" ? "default" : "ghost"}
                      className={cn(
                        "flex-1 text-sm",
                        tripType === "oneway" 
                          ? "bg-gradient-primary text-white" 
                          : "text-muted-foreground"
                      )}
                      onClick={() => {
                        setTripType("oneway");
                        setIsRoundTrip(false);
                      }}
                    >
                      One way
                    </Button>
                    <Button
                      variant={tripType === "roundtrip" ? "default" : "ghost"}
                      className={cn(
                        "flex-1 text-sm",
                        tripType === "roundtrip" 
                          ? "bg-gradient-primary text-white" 
                          : "text-muted-foreground"
                      )}
                      onClick={() => {
                        setTripType("roundtrip");
                        setIsRoundTrip(true);
                      }}
                    >
                      Round Trip
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant={tripType === "pickup" ? "default" : "ghost"}
                      className={cn(
                        "flex-1 text-xs sm:text-sm",
                        tripType === "pickup" 
                          ? "bg-gradient-primary text-white" 
                          : "text-muted-foreground"
                      )}
                      onClick={() => {
                        setTripType("pickup");
                        setIsRoundTrip(false);
                      }}
                    >
                      Pick-up From Airport
                    </Button>
                    <Button
                      variant={tripType === "drop" ? "default" : "ghost"}
                      className={cn(
                        "flex-1 text-xs sm:text-sm",
                        tripType === "drop" 
                          ? "bg-gradient-primary text-white" 
                          : "text-muted-foreground"
                      )}
                      onClick={() => {
                        setTripType("drop");
                        setIsRoundTrip(false);
                      }}
                    >
                      Drop To Airport
                    </Button>
                  </>
                )}
              </div>

              {/* Round Trip Checkbox for Airport */}
              {serviceType === "airport" && (
                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox
                    id="roundTrip"
                    checked={isRoundTrip}
                    onCheckedChange={(checked) => setIsRoundTrip(checked as boolean)}
                  />
                  <Label htmlFor="roundTrip" className="text-sm">Round Trip</Label>
                </div>
              )}
            </div>
          )}

          {/* Location Inputs */}
          <div className="space-y-4 mb-6">
            {serviceType === "airport" && tripType === "pickup" ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Pickup Terminal</Label>
                <div className="space-y-2">
                  {Object.entries(airportTerminals).map(([key, terminal]) => (
                    <div
                      key={key}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all",
                        pickupTerminal === key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => handlePickupTerminalSelect(key)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 border-2 rounded-full",
                          pickupTerminal === key
                            ? "border-primary bg-primary"
                            : "border-border"
                        )} />
                        <span className="font-medium">{terminal.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {pickupLocationError && (
                  <p className="text-xs text-destructive mt-1 px-1">
                    {pickupLocationError}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <GooglePlacesInput
                  placeholder="Pick-up location"
                  value={pickupLocation}
                  onChange={(value) => setPickupLocation(value)}
                  onPlaceSelect={handlePickupSelect}
                  icon="pickup"
                  showCurrentLocation={true}
                />
                {pickupLocationError && (
                  <p className="text-xs text-destructive mt-1 px-1">
                    {pickupLocationError}
                  </p>
                )}
              </div>
            )}

            {serviceType === "car_rental" ? (
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-accent z-10" />
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start pl-10 glass-hover"
                  onClick={() => setShowPackageModal(true)}
                >
                  {packageDetails ? `${packageDetails.name}` : "Select Package"}
                </Button>
              </div>
            ) : (
              <div>
                {serviceType === "airport" && tripType === "drop" ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Drop Terminal</Label>
                    <div className="space-y-2">
                      {Object.entries(airportTerminals).map(([key, terminal]) => (
                        <div
                          key={key}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-all",
                            dropoffTerminal === key
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => handleDropoffTerminalSelect(key)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-4 h-4 border-2 rounded-full",
                              dropoffTerminal === key
                                ? "border-primary bg-primary"
                                : "border-border"
                            )} />
                            <span className="font-medium">
                              {key === "terminal1" ? "Terminal 1" : "Terminal 2"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {dropoffLocationError && (
                      <p className="text-xs text-destructive mt-1 px-1">
                        {dropoffLocationError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <GooglePlacesInput
                      placeholder={
                        serviceType === "airport" && tripType === "drop" 
                          ? "KIA (BLR)" 
                          : "Drop-off location"
                      }
                      value={dropoffLocation}
                      onChange={(value) => setDropoffLocation(value)}
                      onPlaceSelect={handleDropoffSelect}
                      icon="dropoff"
                    />
                    {dropoffLocationError && (
                      <p className="text-xs text-destructive mt-1 px-1">
                        {dropoffLocationError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Pickup Location Error */}
            {pickupLocationError && (
              <p className="text-destructive text-sm mt-1">{pickupLocationError}</p>
            )}

            {/* Date & Time Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 justify-start glass-hover"
                  >
                    <CalendarIcon className="w-5 h-5 mr-3 text-primary" />
                    {selectedDate ? format(selectedDate, "MMM dd") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setDateTimeError(""); // Clear error when date changes
                    }}
                    disabled={(date) => {
                      const now = new Date();
                      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      return date < today;
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 justify-start glass-hover"
                  >
                    <Clock className="w-5 h-5 mr-3 text-accent" />
                    {selectedTime || "Select Time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                  <div className="grid grid-cols-3 gap-1 p-4 max-h-60 overflow-y-auto">
                    {[
                      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
                      "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
                      ].map((time) => {
                        // Check if time slot is within 6 hours for today
                        const isDisabled = selectedDate && selectedTime !== time ? (() => {
                          const now = new Date();
                          const selectedDateTime = new Date(selectedDate);
                          const isToday = selectedDateTime.toDateString() === now.toDateString();
                          
                          if (isToday) {
                            const [hours, minutes] = time.split(':').map(Number);
                            const timeSlot = new Date(selectedDateTime);
                            timeSlot.setHours(hours, minutes, 0, 0);
                            
                            const timeDiff = timeSlot.getTime() - now.getTime();
                            const hoursDiff = timeDiff / (1000 * 60 * 60);
                            
                            return hoursDiff < 6;
                          }
                          return false;
                        })() : false;

                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "text-sm",
                              selectedTime === time ? "bg-gradient-primary" : "",
                              isDisabled ? "opacity-50 cursor-not-allowed" : ""
                            )}
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedTime(time);
                              setDateTimeError(""); // Clear error when time changes
                            }}
                          >
                            {time}
                          </Button>
                        );
                      })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Return Date & Time for Round Trip Outstation */}
            {serviceType === "outstation" && isRoundTrip && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 justify-start glass-hover"
                    >
                      <CalendarIcon className="w-5 h-5 mr-3 text-primary" />
                      {returnDate ? format(returnDate, "MMM dd") : "Return Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      disabled={(date) => date < new Date() || (selectedDate && date <= selectedDate)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 justify-start glass-hover"
                    >
                      <Clock className="w-5 h-5 mr-3 text-accent" />
                      {returnTime || "Return Time"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <div className="grid grid-cols-3 gap-1 p-4 max-h-60 overflow-y-auto">
                      {[
                        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                        "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
                        "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
                      ].map((time) => (
                        <Button
                          key={time}
                          variant={returnTime === time ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "text-sm",
                            returnTime === time ? "bg-gradient-primary" : ""
                          )}
                          onClick={() => setReturnTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            {/* Date Time Error Message */}
            {dateTimeError && (
              <p className="text-destructive text-sm mt-2">{dateTimeError}</p>
            )}
          </div>

          {/* Map Picker */}
          {mapsLoader.ready && !mapsLoader.error && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Select on Map</h3>
                <div className="p-1 rounded-lg glass inline-flex gap-1">
                  <Button
                    size="sm"
                    variant={activeMarker === 'pickup' ? 'default' : 'ghost'}
                    className={cn(activeMarker === 'pickup' ? 'bg-gradient-primary text-white' : 'text-muted-foreground')}
                    onClick={() => setActiveMarker('pickup')}
                  >
                    <MapPin className="w-4 h-4 mr-1 text-green-500" /> Pickup
                  </Button>
                  <Button
                    size="sm"
                    variant={activeMarker === 'dropoff' ? 'default' : 'ghost'}
                    className={cn(activeMarker === 'dropoff' ? 'bg-gradient-primary text-white' : 'text-muted-foreground')}
                    onClick={() => setActiveMarker('dropoff')}
                  >
                    <MapPin className="w-4 h-4 mr-1 text-red-500" /> Dropoff
                  </Button>
                </div>
              </div>
              <GoogleMaps
                pickup={pickupCoords || undefined}
                dropoff={serviceType === 'car_rental' ? undefined : (dropoffCoords || undefined)}
                height="320px"
                onRouteUpdate={handleRouteUpdate}
                interactive={true}
                activeMarker={activeMarker}
                onPickupChange={handlePickupChangeFromMap}
                onDropoffChange={handleDropoffChangeFromMap}
              />
            </div>
          )}

          {/* Guest Selection */}
          <div className="mb-6">
            <Button
              variant="outline"
              className="w-full h-12 glass-hover justify-between"
              onClick={() => setShowGuestModal(true)}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>{passengers} Guest{passengers !== 1 ? 's' : ''}</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Special Instructions Toggle */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox 
                id="show-special-instructions" 
                checked={showSpecialInstructions}
                onCheckedChange={(checked) => {
                  setShowSpecialInstructions(checked === true);
                  if (checked === false) {
                    // Clear special instructions when hiding the section
                    setLuggageCount(0);
                    setHasPet(false);
                    setAdditionalInstructions("");
                    setSpecialInstructions("");
                  }
                }}
              />
              <Label 
                htmlFor="show-special-instructions" 
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Add Special Instructions
              </Label>
            </div>
            
            {/* Collapsible Special Instructions Section */}
            {showSpecialInstructions && (
              <div className="mt-4 p-4 rounded-lg glass-hover border border-glass-border animate-in fade-in-50 duration-300">
                {/* Luggage Counter */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg glass-hover">
                  <div className="flex items-center gap-2">
                    <Luggage className="w-5 h-5 text-primary" />
                    <span className="text-sm">Luggage Items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        const newCount = Math.max(0, luggageCount - 1);
                        setLuggageCount(newCount);
                        setTimeout(updateSpecialInstructions, 0);
                      }}
                      disabled={luggageCount === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{luggageCount}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        const newCount = Math.min(3, luggageCount + 1);
                        setLuggageCount(newCount);
                        setTimeout(updateSpecialInstructions, 0);
                      }}
                      disabled={luggageCount === 3}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Pet Toggle */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg glass-hover">
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-5 h-5 text-primary" />
                    <span className="text-sm">Traveling with Pet</span>
                  </div>
                  <Switch 
                    checked={hasPet} 
                    onCheckedChange={(checked) => {
                      setHasPet(checked);
                      setTimeout(updateSpecialInstructions, 0);
                    }}
                  />
                </div>
                
                {/* Cost Sharing Option - Only for Airport Taxi */}
                {serviceType === "airport" && (
                  <div className="flex items-center justify-between mb-4 p-3 rounded-lg glass-hover">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <span className="text-sm">Preferred Sharing for Cost-Effective Travel</span>
                        <div className="text-xs text-muted-foreground">💡 Travel to the airport with shared rides and save up to 60%. T&C apply.</div>
                      </div>
                    </div>
                    <Switch 
                      checked={preferSharing} 
                      onCheckedChange={(checked) => {
                        setPreferSharing(checked);
                        setTimeout(updateSpecialInstructions, 0);
                      }}
                    />
                  </div>
                )}

                {/* Airport Terminal Selection for Pickup */}
                {serviceType === "airport" && tripType === "pickup" && (
                  <div className="mb-4">
                    <Label className="text-sm mb-2 block">Select Terminal</Label>
                    <select 
                      className="w-full p-3 rounded-lg glass border border-glass-border text-foreground bg-background"
                      value={selectedAirportTerminal}
                      onChange={(e) => {
                        setSelectedAirportTerminal(e.target.value);
                        setTimeout(updateSpecialInstructions, 0);
                      }}
                    >
                      <option value="">Select Terminal</option>
                      <option value="Terminal 1">Kempegowda International Airport – Terminal 1</option>
                      <option value="Terminal 2">Kempegowda International Airport – Terminal 2</option>
                    </select>
                  </div>
                )}

                {/* Additional Instructions */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <Label htmlFor="additionalInstructions" className="text-sm">
                      Additional Requirements
                    </Label>
                  </div>
                  <textarea
                    id="additionalInstructions"
                    placeholder="Any other special requests or requirements..."
                    value={additionalInstructions}
                    onChange={(e) => {
                      setAdditionalInstructions(e.target.value);
                      setTimeout(updateSpecialInstructions, 0);
                    }}
                    className="w-full p-3 h-20 rounded-lg glass border border-glass-border text-foreground placeholder-muted-foreground resize-none"
                  />
                </div>
                
                {/* Preview of combined instructions */}
                {(luggageCount > 0 || hasPet || preferSharing || selectedAirportTerminal || additionalInstructions.trim()) && (
                  <div className="mt-3 text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                    <span className="font-medium">Will be saved as: </span>
                    {luggageCount > 0 && <span>{luggageCount} luggage item{luggageCount !== 1 ? 's' : ''}</span>}
                    {luggageCount > 0 && (hasPet || preferSharing || selectedAirportTerminal || additionalInstructions.trim()) && <span>, </span>}
                    {hasPet && <span>Traveling with pet</span>}
                    {hasPet && (preferSharing || selectedAirportTerminal || additionalInstructions.trim()) && <span>, </span>}
                    {preferSharing && <span>Preferred sharing for cost-effective travel</span>}
                    {preferSharing && (selectedAirportTerminal || additionalInstructions.trim()) && <span>, </span>}
                    {selectedAirportTerminal && <span>Terminal: {selectedAirportTerminal}</span>}
                    {selectedAirportTerminal && additionalInstructions.trim() && <span>, </span>}
                    {additionalInstructions.trim() && <span>{additionalInstructions}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Search Car Button */}
          <div className="mt-6">
            <Button 
              onClick={handleSearchCars}
              disabled={!isFormValid()}
              className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
                isFormValid() 
                  ? 'bg-gradient-primary hover:scale-[1.02] micro-bounce' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isFormValid() ? "Search Cars" : "Please fill all required fields"}
            </Button>
          </div>
        </Card>

      {/* Modals */}
      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent className="glass rounded-2xl border-glass-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Guest Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-foreground">Passengers</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 glass"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-foreground">{passengers}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 glass"
                  onClick={() => setPassengers(Math.min(6, passengers + 1))}
                  disabled={passengers >= 6}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Select the number of guests for your ride (Maximum 6 passengers)
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPackageModal} onOpenChange={setShowPackageModal}>
        <DialogContent className="glass rounded-2xl border-glass-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Select Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
            {packagesLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : packages.length > 0 ? (
              packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 glass-hover",
                    selectedPackage === pkg.id ? "border-primary bg-primary/5" : "border-glass-border"
                  )}
                  onClick={() => {
                    setSelectedPackage(pkg.id);
                    setPackageDetails(pkg);
                    setShowPackageModal(false);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pkg.duration_hours} hours • {pkg.included_kilometers}km included
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Extra: ₹{pkg.extra_hour_rate}/hr • ₹{pkg.extra_km_rate}/km
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">₹{pkg.base_price}</div>
                      <div className="text-xs text-muted-foreground">{pkg.vehicle_type}</div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No packages available for {vehicleType === "All" ? "selected vehicle type" : vehicleType}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
     </>
   );
 };