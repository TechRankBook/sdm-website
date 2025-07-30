import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, Clock } from "lucide-react";
import { useFareCalculation } from "@/hooks/useFareCalculation";
import { BookingData } from "@/pages/Booking";

interface VehicleSelectionProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  routeData?: {
    distance: string;
    duration: string;
    distanceKm: number;
    durationMinutes: number;
  } | null;
}

const vehicleTypes = [
  { 
    type: "Sedan", 
    capacity: "4 passengers", 
    estimatedTime: "5 min",
    icon: Car,
    description: "Comfortable and economical"
  },
  { 
    type: "SUV", 
    capacity: "6 passengers", 
    estimatedTime: "7 min",
    icon: Users,
    description: "Spacious for groups"
  },
  { 
    type: "Premium", 
    capacity: "4 passengers", 
    estimatedTime: "10 min",
    icon: Car,
    description: "Luxury experience"
  }
];

export const VehicleSelection = ({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack, 
  routeData 
}: VehicleSelectionProps) => {
  // Get fare calculation for all vehicle types
  const sedanFare = useFareCalculation({
    serviceType: bookingData.serviceType,
    vehicleType: "Sedan",
    distanceKm: routeData?.distanceKm || 0,
    durationMinutes: routeData?.durationMinutes || 0,
  });

  const suvFare = useFareCalculation({
    serviceType: bookingData.serviceType,
    vehicleType: "SUV",
    distanceKm: routeData?.distanceKm || 0,
    durationMinutes: routeData?.durationMinutes || 0,
  });

  const premiumFare = useFareCalculation({
    serviceType: bookingData.serviceType,
    vehicleType: "Premium",
    distanceKm: routeData?.distanceKm || 0,
    durationMinutes: routeData?.durationMinutes || 0,
  });

  const handleVehicleSelection = (vehicleType: string, fareData: any) => {
    updateBookingData({
      carType: vehicleType,
      selectedFare: {
        type: vehicleType,
        price: fareData?.totalFare || 0
      }
    });
    onNext();
  };

  return (
    <>
      <Card className="glass rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Vehicle</h2>
        <p className="text-muted-foreground">Select the perfect ride for your journey</p>
      </div>

      <div className="space-y-4 mb-6">
        {vehicleTypes.map((vehicle) => {
          const fareCalculation = vehicle.type === "Sedan" ? sedanFare : 
                                 vehicle.type === "SUV" ? suvFare : premiumFare;
          
          return (
            <Card
              key={vehicle.type}
              className="glass-hover p-4 cursor-pointer transition-all duration-300 hover:scale-[1.01] border border-glass-border hover:border-primary/30"
              onClick={() => handleVehicleSelection(vehicle.type, fareCalculation.fareData)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 rounded-xl bg-gradient-primary">
                    <vehicle.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">{vehicle.type}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{vehicle.capacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{vehicle.estimatedTime} arrival</span>
                      </div>
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
                      {routeData && (
                        <div className="text-xs text-muted-foreground">
                          {routeData.distance} • {routeData.duration}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Price unavailable
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
      </div>
      </Card>
    </>
  );
};