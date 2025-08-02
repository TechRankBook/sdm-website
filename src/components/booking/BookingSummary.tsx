import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Clock, RotateCcw } from "lucide-react";
import { BookingData } from "@/pages/Booking";
import { format } from "date-fns";

interface BookingSummaryProps {
  bookingData: BookingData;
}

export const BookingSummary = ({ bookingData }: BookingSummaryProps) => {
  const formatServiceName = (service: string) => {
    switch (service) {
      case "city_ride": return "City Ride";
      case "airport": return "Airport Taxi";
      case "outstation": return "Outstation";
      case "car_rental": return "Hourly Rental";
      default: return service;
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleString();
  };

  return (
    <Card className="glass-hover p-4 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Trip Summary
      </h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Service</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{formatServiceName(bookingData.serviceType)}</Badge>
            {bookingData.isRoundTrip && (
              <Badge className="bg-gradient-primary text-white">
                <RotateCcw className="w-3 h-3 mr-1" />
                Round Trip
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Vehicle</span>
          <span className="text-foreground font-medium">{bookingData.selectedFare?.type || "Not selected"}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Pickup</span>
            <span className="text-foreground font-medium text-right max-w-48 text-sm">
              {bookingData.pickupLocation}
            </span>
          </div>
          
          {bookingData.dropoffLocation && (
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Drop-off</span>
              <span className="text-foreground font-medium text-right max-w-48 text-sm">
                {bookingData.dropoffLocation}
              </span>
            </div>
          )}
        </div>
        
        {bookingData.scheduledDateTime && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Scheduled
            </span>
            <span className="text-foreground font-medium text-sm">
              {formatDateTime(bookingData.scheduledDateTime)}
            </span>
          </div>
        )}

        {bookingData.returnDateTime && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Return
            </span>
            <span className="text-foreground font-medium text-sm">
              {formatDateTime(bookingData.returnDateTime)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            Passengers
          </span>
          <span className="text-foreground font-medium">{bookingData.passengers}</span>
        </div>

        {bookingData.packageSelection && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Duration
            </span>
            <span className="text-foreground font-medium">{bookingData.packageSelection} hours</span>
          </div>
        )}

        {bookingData.specialInstructions && (
          <div className="pt-2 border-t border-glass-border">
            <span className="text-sm text-muted-foreground">Special Instructions</span>
            <p className="text-foreground text-sm mt-1">{bookingData.specialInstructions}</p>
          </div>
        )}
        
        {bookingData.selectedFare && (
          <div className="border-t border-glass-border pt-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-foreground font-semibold">Total Fare</span>
              <span className="text-primary font-bold text-lg">₹{bookingData.selectedFare.price}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};