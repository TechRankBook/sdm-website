import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car,
  Truck,
  Crown,
  ChevronRight,
  ArrowLeft,
  Zap,
  Shield,
  Users
} from "lucide-react";
import { BookingData } from "@/stores/bookingStore";

interface FareCalculationProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const FareCalculation = ({ bookingData, updateBookingData, onNext, onBack }: FareCalculationProps) => {
  const carTypes = [
    {
      type: "Sedan",
      icon: Car,
      description: "Comfortable 4-seater",
      features: ["AC", "Music System", "GPS"],
      price: 299,
      originalPrice: 350,
      estimatedTime: "5 min",
      capacity: "4 passengers"
    },
    {
      type: "SUV",
      icon: Truck,
      description: "Spacious family vehicle",
      features: ["AC", "Extra Luggage", "Premium Sound"],
      price: 459,
      originalPrice: 520,
      estimatedTime: "7 min",
      capacity: "6 passengers"
    },
    {
      type: "Premium",
      icon: Crown,
      description: "Luxury travel experience",
      features: ["AC", "Leather Seats", "Chauffeur"],
      price: 699,
      originalPrice: 799,
      estimatedTime: "10 min",
      capacity: "4 passengers"
    }
  ];

  const handleCarSelection = (selectedCar: typeof carTypes[0]) => {
    updateBookingData({ 
      selectedFare: { 
        type: selectedCar.type, 
        price: selectedCar.price 
      } 
    });
    onNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="glass rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Choose Your Vehicle</h1>
          <div className="w-[60px]"></div>
        </div>

        {/* Trip Summary */}
        <Card className="glass-hover p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-foreground font-medium text-xs sm:text-sm truncate">
                {bookingData.pickupLocation || "Pickup Location"}
              </span>
            </div>
            <div className="hidden sm:flex flex-1 h-px bg-gradient-to-r from-primary to-accent mx-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-foreground font-medium text-xs sm:text-sm truncate">
                {bookingData.dropoffLocation || bookingData.packageSelection || "Destination"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex justify-center">
            <Badge variant="secondary" className="text-xs">
              {bookingData.passengers} passenger{bookingData.passengers !== 1 ? 's' : ''}
            </Badge>
          </div>
        </Card>

        {/* Vehicle Options */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Vehicles</h2>
          {carTypes.map((car) => (
            <Card
              key={car.type}
              className="glass-hover p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-glow"
              onClick={() => handleCarSelection(car)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  <div className="p-2 sm:p-3 rounded-lg bg-gradient-primary shrink-0">
                    <car.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground">{car.type}</h3>
                      {car.type === "Premium" && (
                        <Badge className="bg-gradient-primary text-white text-xs w-fit">RECOMMENDED</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{car.description}</p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{car.capacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{car.estimatedTime} arrival</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                      {car.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-[10px] sm:text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:space-y-2 shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground line-through">
                        ₹{car.originalPrice}
                      </span>
                      <span className="text-lg sm:text-2xl font-bold text-primary">₹{car.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-1">
                      <Shield className="w-3 h-3" />
                      <span>100% Electric</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-primary micro-bounce text-xs sm:text-sm px-3 sm:px-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCarSelection(car);
                    }}
                  >
                    Select
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="glass-hover p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Payment Information</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            • Minimum 20% advance payment required<br/>
            • Remaining amount to be paid after ride completion<br/>
            • Multiple payment methods accepted (UPI, Card, Wallet)
          </p>
        </Card>
      </Card>
    </div>
  );
};