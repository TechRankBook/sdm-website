import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Zap, 
  Car,
  Users,
  Calendar,
  Plane,
  RotateCcw,
  Route
} from "lucide-react";

export const BookingWidget = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedService, setSelectedService] = useState("city");
  const [rideTime, setRideTime] = useState("now");

  const serviceTypes = [
    {
      id: "city",
      name: "City Ride",
      icon: Car,
      price: "₹8/km",
      time: "3 min",
      description: "Quick rides within the city",
      features: ["Electric", "Real-time tracking"]
    },
    {
      id: "airport",
      name: "Airport Taxi",
      icon: Plane,
      price: "₹12/km",
      time: "5 min",
      description: "Direct airport transfers",
      features: ["Luggage space", "Flight tracking"]
    },
    {
      id: "rental",
      name: "Car Rental",
      icon: RotateCcw,
      price: "₹200/hr",
      time: "10 min",
      description: "Hourly car rentals",
      features: ["Self-drive", "Flexible hours"]
    },
    {
      id: "outstation",
      name: "Outstation",
      icon: Route,
      price: "₹15/km",
      time: "15 min",
      description: "Long distance travel",
      features: ["Driver included", "Round trip"]
    },
    {
      id: "share",
      name: "Ride Sharing",
      icon: Users,
      price: "₹4/km",
      time: "8 min",
      description: "Share with other riders",
      features: ["Budget-friendly", "Green travel"]
    }
  ];

  return (
    <div className="glass rounded-2xl p-6 w-full max-w-md mx-auto space-y-6">
      {/* Ride Timing Options */}
      <div className="flex gap-2">
        <Button 
          variant={rideTime === 'now' ? 'default' : 'ghost'} 
          size="sm" 
          className={rideTime === 'now' ? 'bg-gradient-primary' : ''}
          onClick={() => setRideTime('now')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Ride Now
        </Button>
        <Button 
          variant={rideTime === 'later' ? 'default' : 'ghost'} 
          size="sm"
          className={rideTime === 'later' ? 'bg-gradient-primary' : ''}
          onClick={() => setRideTime('later')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule for Later
        </Button>
      </div>

      {/* Location Inputs */}
      <div className="space-y-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-primary" />
          <Input
            placeholder="Pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="pl-10 glass-hover h-12 text-base"
          />
        </div>
        
        <div className="relative">
          <Navigation className="absolute left-3 top-3 w-5 h-5 text-accent" />
          <Input
            placeholder="Where to?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="pl-10 glass-hover h-12 text-base"
          />
        </div>
      </div>

      {/* Service Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Choose your service</h3>
        <div className="space-y-2">
          {serviceTypes.map((service) => (
            <Card
              key={service.id}
              className={`p-4 cursor-pointer transition-all duration-300 ${
                selectedService === service.id
                  ? 'ring-2 ring-primary bg-gradient-surface'
                  : 'glass-hover'
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <div className="flex gap-1 mt-1">
                      {service.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-lg">{service.price}</p>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-3 h-3" />
                    {service.time}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Book Button */}
      <Button 
        className="w-full h-12 bg-gradient-primary text-lg font-semibold micro-bounce"
        disabled={!pickup || !destination}
        onClick={() => {
          // Navigate to booking page with pre-filled data
          const params = new URLSearchParams({
            pickup: pickup,
            destination: destination,
            service: selectedService,
            time: rideTime
          });
          window.location.href = `/booking?${params.toString()}`;
        }}
      >
        <Zap className="w-5 h-5 mr-2" />
        Search Car
      </Button>

      {/* Payment Info */}
      <div className="p-3 glass rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Payment Options</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Minimum 20% upfront payment required. Multiple payment methods accepted.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex justify-around pt-4 border-t border-glass-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">2.5M+</p>
          <p className="text-xs text-muted-foreground">Happy Riders</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">100%</p>
          <p className="text-xs text-muted-foreground">Electric Fleet</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">₹0</p>
          <p className="text-xs text-muted-foreground">Emissions</p>
        </div>
      </div>
    </div>
  );
};