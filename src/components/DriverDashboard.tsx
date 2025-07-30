import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  MapPin, 
  Clock, 
  Zap, 
  Battery,
  DollarSign,
  Star,
  Navigation,
  Phone,
  MessageCircle
} from "lucide-react";

export const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [currentRide, setCurrentRide] = useState({
    id: "SDM-2025-001",
    passenger: "Raj Kumar",
    pickup: "MG Road Metro Station",
    destination: "Bangalore International Airport",
    distance: "42 km",
    fare: "₹680",
    eta: "45 min",
    rating: 4.8
  });

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Driver Status */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Driver Mode</h2>
              <Badge 
                variant={isOnline ? "default" : "secondary"}
                className={isOnline ? "bg-green-500" : ""}
              >
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => setIsOnline(!isOnline)}
            variant={isOnline ? "destructive" : "default"}
            className="micro-bounce"
          >
            {isOnline ? "Go Offline" : "Go Online"}
          </Button>
        </div>

        {/* Vehicle Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 glass rounded-lg">
            <Battery className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-foreground">92%</p>
            <p className="text-xs text-muted-foreground">Battery</p>
          </div>
          <div className="text-center p-3 glass rounded-lg">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">₹2,450</p>
            <p className="text-xs text-muted-foreground">Today's Earnings</p>
          </div>
          <div className="text-center p-3 glass rounded-lg">
            <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold text-foreground">4.9</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>
      </Card>

      {/* Current Ride */}
      {isOnline && currentRide && (
        <Card className="glass p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Current Ride</h3>
            <Badge variant="default" className="bg-gradient-primary">
              In Progress
            </Badge>
          </div>

          {/* Passenger Info */}
          <div className="flex items-center gap-3 mb-4 p-3 glass rounded-lg">
            <div className="p-2 rounded-full bg-gradient-secondary">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{currentRide.passenger}</h4>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">{currentRide.rating}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="micro-bounce">
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="micro-bounce">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-medium text-foreground">{currentRide.pickup}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-accent mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium text-foreground">{currentRide.destination}</p>
              </div>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-glass-border">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{currentRide.distance}</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-accent">{currentRide.eta}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                ETA
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{currentRide.fare}</p>
              <p className="text-xs text-muted-foreground">Fare</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              className="flex-1 micro-bounce"
            >
              Navigate
            </Button>
            <Button 
              className="flex-1 bg-gradient-primary micro-bounce"
            >
              <Zap className="w-4 h-4 mr-2" />
              Complete Ride
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" className="justify-start glass-hover h-auto p-4">
            <div className="text-left">
              <Car className="w-5 h-5 mb-2 text-primary" />
              <p className="font-medium">Trip History</p>
              <p className="text-xs text-muted-foreground">View past rides</p>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start glass-hover h-auto p-4">
            <div className="text-left">
              <DollarSign className="w-5 h-5 mb-2 text-accent" />
              <p className="font-medium">Earnings</p>
              <p className="text-xs text-muted-foreground">Track income</p>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start glass-hover h-auto p-4">
            <div className="text-left">
              <Battery className="w-5 h-5 mb-2 text-green-500" />
              <p className="font-medium">Charging</p>
              <p className="text-xs text-muted-foreground">Find stations</p>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start glass-hover h-auto p-4">
            <div className="text-left">
              <Star className="w-5 h-5 mb-2 text-yellow-500" />
              <p className="font-medium">Feedback</p>
              <p className="text-xs text-muted-foreground">Rate passengers</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};