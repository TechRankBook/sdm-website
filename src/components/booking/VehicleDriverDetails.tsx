import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Star, User, Car, Shield } from "lucide-react";

interface VehicleDriverDetailsProps {
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    color: string;
    type?: string;
  } | null;
  driver?: {
    id: string;
    license_number: string;
    rating: number;
    total_rides: number;
  };
  driverUser?: {
    full_name: string;
    phone_no: string;
    profile_picture_url?: string;
  };
}

export function VehicleDriverDetails({ vehicle, driver, driverUser }: VehicleDriverDetailsProps) {
  if (!vehicle && !driver) {
    return (
      <Card className="glass">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            Vehicle and driver will be assigned once booking is confirmed
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Driver Details */}
      {driver && driverUser && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Driver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={driverUser.profile_picture_url} 
                  alt={driverUser.full_name} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {driverUser.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{driverUser.full_name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{driver.rating.toFixed(1)}/5.0</span>
                  <span>•</span>
                  <span>{driver.total_rides} trips</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Shield className="w-4 h-4" />
                  <span>License: {driver.license_number}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Call Driver
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Details */}
      {vehicle && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Your Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.year} • {vehicle.color}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">License Plate</p>
                <p className="font-mono text-lg font-bold">
                  {vehicle.license_plate}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="text-xs">
                {vehicle.type || 'Standard'}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Look for this vehicle
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}