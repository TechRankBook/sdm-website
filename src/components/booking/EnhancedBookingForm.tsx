import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { GooglePlacesInput } from "./GooglePlacesInput";
import { GoogleMaps } from "./GoogleMaps";
import { useFareCalculation } from "@/hooks/useFareCalculation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
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
  TimerReset
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
  const [hours, setHours] = useState(bookingData.packageSelection || "");
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
  const [specialInstructions, setSpecialInstructions] = useState(bookingData.specialInstructions || "");
  
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
    setHours(bookingData.packageSelection || "");
    setTripType(bookingData.tripType || "oneway");
    setIsRoundTrip(bookingData.isRoundTrip || false);
    setSpecialInstructions(bookingData.specialInstructions || "");
    
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
  const [showHoursModal, setShowHoursModal] = useState(false);
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

  const isFormValid = useCallback(() => {
    // Remove excessive logging that was causing performance issues
    const hasPickup = pickupLocation.trim() !== "";
    const hasDestination = serviceType === "car_rental" ? hours !== "" : dropoffLocation.trim() !== "";
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

      console.log("✅ Form validation passed - preparing data...");

      const dateTime = selectedDate && selectedTime 
        ? new Date(`${selectedDate.toISOString().split('T')[0]}T${selectedTime}`).toISOString()
        : "";
      
      const returnDateTime = isRoundTrip && returnDate && returnTime
        ? new Date(`${returnDate.toISOString().split('T')[0]}T${returnTime}`).toISOString()
        : "";

      const bookingDataToUpdate = {
        serviceType,
        pickupLocation,
        dropoffLocation: serviceType === "car_rental" ? undefined : dropoffLocation,
        scheduledDateTime: dateTime,
        returnDateTime,
        passengers,
        packageSelection: serviceType === "car_rental" ? hours : undefined,
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
      
    updateBookingData({
      serviceType,
      pickupLocation,
      dropoffLocation: serviceType === "car_rental" ? undefined : dropoffLocation,
      scheduledDateTime: dateTime,
      passengers,
      packageSelection: serviceType === "car_rental" ? hours : undefined,
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

            {/* Date & Time Selection */}
            <div className="grid grid-cols-2 gap-3">
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
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
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
                    ].map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "text-sm",
                          selectedTime === time ? "bg-gradient-primary" : ""
                        )}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Return Date & Time for Round Trip Outstation */}
            {serviceType === "outstation" && isRoundTrip && (
              <div className="grid grid-cols-2 gap-3 mt-4">
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

          {/* Special Instructions */}
          {/* <div className="mb-6">
            <Label htmlFor="instructions" className="text-sm font-medium text-foreground">
              Special Instructions (Optional)
            </Label>
            <textarea
              id="instructions"
              placeholder="Add any special requests or instructions..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full mt-2 p-3 h-20 rounded-lg glass border border-glass-border text-foreground placeholder-muted-foreground resize-none"
            />
          </div> */}
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
    </>
  );
};