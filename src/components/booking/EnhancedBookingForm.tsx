import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { GooglePlacesInput } from "./GooglePlacesInput";
import { GoogleMaps } from "./GoogleMaps";
import { useFareCalculation } from "@/hooks/useFareCalculation";
import { 
  Clock, 
  Car,
  Users,
  Calendar,
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
  Navigation2
} from "lucide-react";
import { BookingData } from "@/pages/Booking";

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
  const [hours, setHours] = useState("");
  const [tripType, setTripType] = useState("oneway");
  
  // Location coordinates
  const [pickupCoords, setPickupCoords] = useState<LocationData | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<LocationData | null>(null);
  const [routeData, setRouteData] = useState<{
    distance: string;
    duration: string;
    distanceKm: number;
    durationMinutes: number;
  } | null>(null);

  // Modal states
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const serviceTypes = [
    { id: "city_ride", name: "CityRide", icon: Car },
    { id: "airport", name: "Airport Taxi", icon: Plane },
    { id: "outstation", name: "Outstation", icon: Route },
    { id: "car_rental", name: "Hourly Rentals", icon: RotateCcw }
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
    setPickupCoords({
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.description
    });
  };

  const handleDropoffSelect = (place: any) => {
    setDropoffCoords({
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.description
    });
  };

  const handleRouteUpdate = (distance: string, duration: string, distanceValue: number, durationValue: number) => {
    setRouteData({
      distance,
      duration,
      distanceKm: distanceValue / 1000, // Convert meters to km
      durationMinutes: durationValue / 60 // Convert seconds to minutes
    });
  };

  const handleVehicleSelection = (vehicleType: string, fareData: any) => {
    updateBookingData({
      serviceType,
      pickupLocation,
      dropoffLocation: serviceType === "car_rental" ? undefined : dropoffLocation,
      scheduledDateTime,
      passengers,
      packageSelection: serviceType === "car_rental" ? hours : undefined,
      carType: vehicleType,
      selectedFare: {
        type: vehicleType,
        price: fareData?.totalFare || 0
      }
    });
    onNext();
  };

  const formatDateTime = (datetime: string) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  const canAddStops = serviceType !== "car_rental";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Booking Form */}
      <Card className="glass rounded-2xl p-6">
        {/* Service Type Selection */}
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
                    onClick={() => setTripType("oneway")}
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
                    onClick={() => setTripType("roundtrip")}
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
                    onClick={() => setTripType("pickup")}
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
                    onClick={() => setTripType("drop")}
                  >
                    Drop To Airport
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Location Inputs */}
        <div className="space-y-4 mb-6">
          <GooglePlacesInput
            placeholder="Pick-up location"
            value={pickupLocation}
            onChange={(value) => setPickupLocation(value)}
            onPlaceSelect={handlePickupSelect}
            icon="pickup"
            showCurrentLocation={true}
          />

          {serviceType === "car_rental" ? (
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-5 h-5 text-accent z-10" />
              <Button
                variant="outline"
                className="w-full h-12 justify-start pl-10 glass-hover"
                onClick={() => setShowHoursModal(true)}
              >
                {hours ? `${hours} hours` : "Select hours"}
              </Button>
            </div>
          ) : (
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
          )}
        </div>

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

        {/* Show Map and Route */}
        {(pickupCoords || dropoffCoords) && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-2">Route Preview</h3>
            <GoogleMaps
              pickup={pickupCoords ? {
                lat: pickupCoords.lat,
                lng: pickupCoords.lng,
                address: pickupCoords.address
              } : undefined}
              dropoff={dropoffCoords ? {
                lat: dropoffCoords.lat,
                lng: dropoffCoords.lng,
                address: dropoffCoords.address
              } : undefined}
              height="250px"
              onRouteUpdate={handleRouteUpdate}
            />
            {routeData && (
              <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <span>Distance: {routeData.distance}</span>
                <span>Duration: {routeData.duration}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Vehicle Selection with Fare Display */}
      {pickupLocation && (serviceType === "car_rental" ? hours : dropoffLocation) && (
        <Card className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Choose Your Vehicle</h2>
          
          <div className="space-y-4">
            {vehicleTypes.map((vehicle) => {
              const fareCalculation = vehicle.type === "Sedan" ? sedanFare : 
                                   vehicle.type === "SUV" ? suvFare : premiumFare;
              
              return (
                <Card
                  key={vehicle.type}
                  className="glass-hover p-4 cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                  onClick={() => handleVehicleSelection(vehicle.type, fareCalculation.fareData)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-3 rounded-lg bg-gradient-primary">
                        <Car className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">{vehicle.type}</h3>
                        <p className="text-sm text-muted-foreground">{vehicle.capacity}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{vehicle.estimatedTime} arrival</span>
                          {fareCalculation.fareData && (
                            <span>• {fareCalculation.fareData.distance}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {fareCalculation.isLoading ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : fareCalculation.fareData ? (
                        <>
                          <div className="text-2xl font-bold text-primary">
                            ₹{fareCalculation.fareData.totalFare}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {fareCalculation.fareData.estimatedTime}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Calculating...
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

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
                  onClick={() => setPassengers(passengers + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHoursModal} onOpenChange={setShowHoursModal}>
        <DialogContent className="glass rounded-2xl border-glass-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Select Hours</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {["2", "4", "6", "8", "10", "12"].map((hour) => (
              <Button
                key={hour}
                variant={hours === hour ? "default" : "outline"}
                className={cn(
                  "h-12",
                  hours === hour ? "bg-gradient-primary" : "glass"
                )}
                onClick={() => {
                  setHours(hour);
                  setShowHoursModal(false);
                }}
              >
                {hour} Hours
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};