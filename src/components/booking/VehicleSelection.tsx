import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, Clock } from "lucide-react";
import { useFareCalculation } from "@/hooks/useFareCalculation";
import { useRentalPackages } from "@/hooks/useRentalPackages";
import { BookingData } from "@/stores/bookingStore";

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

export const VehicleSelection = ({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack, 
  routeData 
}: VehicleSelectionProps) => {
  // Calculate distance and duration multiplier for round trips
  const multiplier = bookingData.isRoundTrip ? 2 : 1;
  
  console.log("🚗 VehicleSelection - bookingData:", bookingData);
  console.log("🗺️ Route Data:", routeData);
  
  // Get fare calculation for all vehicle types
  const sedanFare = useFareCalculation({
    serviceType: bookingData.serviceType,
    vehicleType: "Sedan",
    distanceKm: (routeData?.distanceKm || 0) * multiplier,
    durationMinutes: (routeData?.durationMinutes || 0) * multiplier,
    packageId: bookingData.serviceType === "car_rental" ? bookingData.packageSelection : undefined,
  });

  const suvFare = useFareCalculation({
    serviceType: bookingData.serviceType,
    vehicleType: "SUV",
    distanceKm: (routeData?.distanceKm || 0) * multiplier,
    durationMinutes: (routeData?.durationMinutes || 0) * multiplier,
    packageId: bookingData.serviceType === "car_rental" ? bookingData.packageSelection : undefined,
  });

  const premiumFare = useFareCalculation({
    serviceType: bookingData.serviceType,
    vehicleType: "Premium",
    distanceKm: (routeData?.distanceKm || 0) * multiplier,
    durationMinutes: (routeData?.durationMinutes || 0) * multiplier,
    packageId: bookingData.serviceType === "car_rental" ? bookingData.packageSelection : undefined,
  });

const vehicleTypes = [
  { 
    type: "Sedan", 
    capacity: "4 passengers", 
    estimatedDuration: bookingData.serviceType == "car_rental" ? (routeData?.duration || "N/A") : bookingData.durationMinutes.toFixed(2) + " min",
    estimatedDistance: bookingData.serviceType == "car_rental" ? (routeData?.distance || "N/A") : bookingData.distanceKm.toFixed(2) + " km",
    icon: Car,
    description: "Comfortable and economical",
    disabled: bookingData.packageDetails?.vehicle_type === "SUV" || bookingData.packageDetails?.vehicle_type === "Premium",
    comingSoon: false
  },
  { 
    type: "SUV", 
    capacity: "6 passengers", 
    estimatedDuration: bookingData.serviceType == "car_rental" ? (routeData?.duration || "N/A") : bookingData.durationMinutes.toFixed(2) + " min",
    estimatedDistance: bookingData.serviceType == "car_rental" ? (routeData?.distance || "N/A") : bookingData.distanceKm.toFixed(2) + " km",
    icon: Users,
    description: "Spacious for groups",
    disabled: bookingData.packageDetails?.vehicle_type === "Sedan" || bookingData.packageDetails?.vehicle_type === "Premium",
    comingSoon: false
  },
  { 
    type: "Premium", 
    capacity: "4 passengers", 
    estimatedDuration: bookingData.serviceType == "car_rental" ? (routeData?.duration || "N/A") : bookingData.durationMinutes.toFixed(2) + " min",
    estimatedDistance: bookingData.serviceType == "car_rental" ? (routeData?.distance || "N/A") : bookingData.distanceKm.toFixed(2) + " km",
    icon: Car,
    description: "Luxury experience",
    disabled: true,
    comingSoon: true
  }
];
  const handleVehicleSelection = (vehicleType: string, fareData: any) => {
    updateBookingData({
      carType: vehicleType,
      vehicleType: vehicleType,
      selectedFare: {
        type: vehicleType,
        price: fareData?.totalFare || 0
      },
      distanceKm: routeData?.distanceKm || 0,
      durationMinutes: routeData?.durationMinutes || 0,
      // Ensure passengers count is preserved
      passengers: bookingData.passengers || 1,
      serviceType: bookingData.serviceType
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
          
          const isDisabled = vehicle.disabled || fareCalculation.isLoading || !fareCalculation.fareData;
          
          return (
            <Card
              key={vehicle.type}
              className={`glass-hover p-4 transition-all duration-300 border border-glass-border relative ${
                isDisabled 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'cursor-pointer hover:scale-[1.01] hover:border-primary/30'
              }`}
              onClick={() => !isDisabled && handleVehicleSelection(vehicle.type, fareCalculation.fareData)}
            >
              {vehicle.comingSoon && (
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              )}
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
                        <span>{vehicle.estimatedDistance} • {vehicle.estimatedDuration}</span>
                      </div>
                    </div>
                    {bookingData.isRoundTrip && (
                      <div className="text-xs text-primary font-medium">
                        Round Trip - Double Distance
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {fareCalculation.isLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-muted-foreground">Calculating...</span>
                    </div>
                      ) : fareCalculation.fareData ? (
                        <>
                          <div className="text-2xl font-bold text-primary">
                            ₹{fareCalculation.fareData.totalFare}
                          </div>
                          {bookingData.serviceType === "car_rental" && fareCalculation.fareData.packageDetails ? (
                            <div className="text-xs text-muted-foreground">
                              {fareCalculation.fareData.packageDetails.name}
                            </div>
                          ) : null}
                        </>
                      ) : fareCalculation.error ? (
                    <div className="text-sm text-destructive">
                      Price unavailable
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Select to see price
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