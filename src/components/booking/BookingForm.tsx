import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { 
  MapPin, 
  Navigation, 
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
  Menu,
  Minus,
  Luggage,
  Zap
} from "lucide-react";
import { BookingData } from "@/pages/Booking";

interface BookingFormProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export const BookingForm = ({ bookingData, updateBookingData, onNext }: BookingFormProps) => {
  const [serviceType, setServiceType] = useState(bookingData.serviceType);
  const [pickupLocation, setPickupLocation] = useState(bookingData.pickupLocation);
  const [dropoffLocation, setDropoffLocation] = useState(bookingData.dropoffLocation || "");
  const [scheduledDateTime, setScheduledDateTime] = useState(bookingData.scheduledDateTime || "");
  const [returnDateTime, setReturnDateTime] = useState("");
  const [passengers, setPassengers] = useState(bookingData.passengers || 2);
  const [suitcases, setSuitcases] = useState(2);
  const [hours, setHours] = useState("");
  const [terminal, setTerminal] = useState("");
  const [flightNo, setFlightNo] = useState("");
  const [tripType, setTripType] = useState("oneway");
  const [additionalStops, setAdditionalStops] = useState<string[]>([]);

  // Modal states
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReturnScheduleModal, setShowReturnScheduleModal] = useState(false);

  // Schedule modal states
  const [selectedDate, setSelectedDate] = useState("today");
  const [selectedTime, setSelectedTime] = useState({hour: 11, minute: 40});

  const serviceTypes = [
    { id: "city", name: "CityRide", icon: Car },
    { id: "airport", name: "Airport Taxi", icon: Plane },
    { id: "outstation", name: "Outstation", icon: Route },
    { id: "sharing", name: "Sharing", icon: Users },
    { id: "hourly", name: "Hourly Rentals", icon: RotateCcw }
  ];

  const canAddStops = serviceType !== "hourly";

  const addStop = () => {
    setAdditionalStops([...additionalStops, ""]);
  };

  const removeAdditionalStop = (index: number) => {
    setAdditionalStops(additionalStops.filter((_, i) => i !== index));
  };

  const updateAdditionalStop = (index: number, value: string) => {
    const newStops = [...additionalStops];
    newStops[index] = value;
    setAdditionalStops(newStops);
  };

  const formatDateTime = (datetime: string) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  const handleSubmit = () => {
    // Validation
    if (!pickupLocation.trim()) {
      alert("Please enter pickup location");
      return;
    }

    if (serviceType !== "hourly" && !dropoffLocation.trim()) {
      alert("Please enter drop-off location");
      return;
    }

    if (serviceType === "hourly" && !hours) {
      alert("Please select hours");
      return;
    }

    // Update booking data
    updateBookingData({
      serviceType,
      pickupLocation,
      dropoffLocation: serviceType === "hourly" ? undefined : dropoffLocation,
      scheduledDateTime,
      passengers,
      packageSelection: serviceType === "hourly" ? hours : undefined
    });

    onNext();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
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
                  // Reset form when service type changes
                  if (service.id === "hourly") {
                    setDropoffLocation("");
                  } else {
                    setHours("");
                  }
                  setTripType("oneway");
                  setTerminal("");
                  setFlightNo("");
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
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-primary z-10" />
            <Input
              placeholder="Pick-up location"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="pl-10 pr-10 h-12 glass-hover text-base"
            />
            {pickupLocation && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-destructive/20"
                onClick={() => setPickupLocation("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-10 top-2 h-8 w-8 p-0"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          {/* Add Stop Functionality */}
          {canAddStops && (
            <>
              {additionalStops.map((stop, index) => (
                <div key={index} className="relative">
                  <Plus className="absolute left-3 top-3 w-5 h-5 text-accent z-10" />
                  <Input
                    placeholder="Add stop"
                    value={stop}
                    onChange={(e) => updateAdditionalStop(index, e.target.value)}
                    className="pl-10 pr-10 h-12 glass-hover text-base"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-destructive/20"
                    onClick={() => removeAdditionalStop(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                className="w-full h-12 border-dashed border-2 glass-hover"
                onClick={addStop}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
            </>
          )}

          {/* Dropoff Location or Hours for Hourly */}
          {serviceType === "hourly" ? (
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-5 h-5 text-accent z-10" />
              <Input
                placeholder="Select hours"
                value={hours ? `${hours} hours` : ""}
                readOnly
                onClick={() => setShowHoursModal(true)}
                className="pl-10 h-12 glass-hover cursor-pointer text-base"
              />
            </div>
          ) : (
            <div className="relative">
              <Navigation className="absolute left-3 top-3 w-5 h-5 text-accent z-10" />
              <Input
                placeholder={
                  serviceType === "airport" && tripType === "drop" 
                    ? "KIA (BLR)" 
                    : "Drop-off location"
                }
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className="pl-10 pr-10 h-12 glass-hover text-base"
                readOnly={serviceType === "airport" && tripType === "drop"}
              />
              {dropoffLocation && serviceType !== "airport" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-destructive/20"
                  onClick={() => setDropoffLocation("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-10 top-2 h-8 w-8 p-0"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Airport Terminal and Flight Info */}
        {serviceType === "airport" && tripType === "drop" && (
          <div className="mb-6 space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Terminal</Label>
              <div className="flex gap-2">
                <Button
                  variant={terminal === "T1" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    terminal === "T1" ? "bg-gradient-primary" : ""
                  )}
                  onClick={() => setTerminal("T1")}
                >
                  T1
                </Button>
                <Button
                  variant={terminal === "T2" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    terminal === "T2" ? "bg-gradient-primary" : ""
                  )}
                  onClick={() => setTerminal("T2")}
                >
                  T2
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Plane className="absolute left-3 top-3 w-5 h-5 text-primary z-10" />
              <Input
                placeholder="Flight No. (Optional)"
                value={flightNo}
                onChange={(e) => setFlightNo(e.target.value)}
                className="pl-10 h-12 glass-hover text-base"
              />
            </div>
          </div>
        )}

        {/* Scheduled Date and Time */}
        <div className="mb-6">
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-primary z-10" />
            <Input
              placeholder="Scheduled date and time"
              value={scheduledDateTime ? formatDateTime(scheduledDateTime) : ""}
              readOnly
              onClick={() => setShowScheduleModal(true)}
              className="pl-10 h-12 glass-hover cursor-pointer text-base"
            />
          </div>
        </div>

        {/* Return Time for Round Trip */}
        {serviceType === "outstation" && tripType === "roundtrip" && (
          <div className="mb-6">
            <Label className="text-sm font-medium text-foreground mb-2 block">Drop off time</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-accent z-10" />
              <Input
                placeholder="Return date and time"
                value={returnDateTime ? formatDateTime(returnDateTime) : ""}
                readOnly
                onClick={() => setShowReturnScheduleModal(true)}
                className="pl-10 h-12 glass-hover cursor-pointer text-base"
              />
            </div>
          </div>
        )}

        {/* Guest Selection */}
        <div className="mb-8">
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

        {/* Check Fare Button */}
        <Button
          onClick={handleSubmit}
          className="w-full h-12 bg-gradient-primary text-lg font-semibold micro-bounce"
        >
          <Zap className="w-5 h-5 mr-2" />
          Check Fare
        </Button>
      </Card>

      {/* Guest Info Modal */}
      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent className="glass rounded-2xl border-glass-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center justify-between">
              Guest Info
              <Button variant="ghost" size="sm" onClick={() => setShowGuestModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Luggage className="w-5 h-5 text-primary" />
                <span className="text-foreground">Suitcases</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 glass"
                  onClick={() => setSuitcases(Math.max(0, suitcases - 1))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-foreground">{suitcases}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 glass"
                  onClick={() => setSuitcases(suitcases + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Our EVs seat 4 passengers. Fits around 4 large suitcases. Sharing this helps us send the right car.
            </p>

            <Button 
              className="w-full bg-gradient-primary"
              onClick={() => setShowGuestModal(false)}
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hours Selection Modal */}
      <Dialog open={showHoursModal} onOpenChange={setShowHoursModal}>
        <DialogContent className="glass rounded-2xl border-glass-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center justify-between">
              Select Hours
              <Button variant="ghost" size="sm" onClick={() => setShowHoursModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[2, 3, 4, 5, 6, 8, 10, 12].map((hour) => (
                  <Button
                    key={hour}
                    variant={hours === hour.toString() ? "default" : "outline"}
                    className={cn(
                      "w-16 h-12",
                      hours === hour.toString() ? "bg-gradient-primary" : "glass"
                    )}
                    onClick={() => setHours(hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <p className="text-lg font-semibold text-foreground">Hours</p>
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-primary"
            onClick={() => setShowHoursModal(false)}
            disabled={!hours}
          >
            Book For {hours} Hours
          </Button>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="glass rounded-2xl border-glass-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center justify-between">
              Schedule Ride
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-foreground mb-4">Select date</h4>
              <div className="flex gap-2">
                <Button
                  variant={selectedDate === "today" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    selectedDate === "today" ? "bg-gradient-primary" : "glass"
                  )}
                  onClick={() => setSelectedDate("today")}
                >
                  Today
                </Button>
                <Button
                  variant={selectedDate === "tomorrow" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    selectedDate === "tomorrow" ? "bg-gradient-primary" : "glass"
                  )}
                  onClick={() => setSelectedDate("tomorrow")}
                >
                  Tomorrow
                </Button>
                <Button
                  variant={selectedDate === "select" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    selectedDate === "select" ? "bg-gradient-primary" : "glass"
                  )}
                  onClick={() => setSelectedDate("select")}
                >
                  Select Date
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-4">Select time</h4>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="space-y-2">
                    {[9, 10, 11, 12, 13, 14, 15, 16].map((hour) => (
                      <Button
                        key={hour}
                        variant={selectedTime.hour === hour ? "default" : "ghost"}
                        className={cn(
                          "w-12 h-8 text-sm",
                          selectedTime.hour === hour ? "bg-gradient-primary" : "text-muted-foreground"
                        )}
                        onClick={() => setSelectedTime({...selectedTime, hour})}
                      >
                        {hour.toString().padStart(2, '0')}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Hour</p>
                </div>
                <div className="text-center">
                  <div className="space-y-2">
                    {[0, 15, 30, 45].map((minute) => (
                      <Button
                        key={minute}
                        variant={selectedTime.minute === minute ? "default" : "ghost"}
                        className={cn(
                          "w-12 h-8 text-sm",
                          selectedTime.minute === minute ? "bg-gradient-primary" : "text-muted-foreground"
                        )}
                        onClick={() => setSelectedTime({...selectedTime, minute})}
                      >
                        {minute.toString().padStart(2, '0')}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Minute</p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-primary"
              onClick={() => {
                const timeString = `${selectedTime.hour.toString().padStart(2, '0')}:${selectedTime.minute.toString().padStart(2, '0')}`;
                setScheduledDateTime(timeString);
                setShowScheduleModal(false);
              }}
            >
              Confirm Schedule
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              We recommend booking at least 12 hrs in advance.<br />
              Last-minute bookings are subject to availability.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};