import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Phone, Car, Clock, Navigation, User, AlertCircle } from "lucide-react";
import { LiveMapTracking } from "@/components/booking/LiveMapTracking";
import { VehicleDriverDetails } from "@/components/booking/VehicleDriverDetails";
import { TripSharingModal } from "@/components/booking/TripSharingModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface ActiveBooking {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare_amount: number;
  status: string;
  created_at: string;
  start_time: string;
  vehicle_type: string;
  driver_id: string;
  vehicle_id: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
}

interface Driver {
  id: string;
  license_number: string;
  current_latitude: number;
  current_longitude: number;
  status: string;
  rating: number;
  total_rides: number;
}

interface DriverUser {
  full_name: string;
  phone_no: string;
  profile_picture_url?: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color: string;
  type?: string;
}

const RideTracking = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user } = useAuth();
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [driverUser, setDriverUser] = useState<DriverUser | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [tripSharingOpen, setTripSharingOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    if (user) {
      fetchActiveRide();
    }
  }, [user]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const handleCancelRide = async () => {
    if (!activeBooking || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      // Update booking status to cancelled
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancellation_reason: cancelReason.trim()
        })
        .eq('id', activeBooking.id);

      if (bookingError) throw bookingError;

      // Insert cancellation record
      const { error: cancellationError } = await supabase
        .from('booking_cancellations')
        .insert({
          booking_id: activeBooking.id,
          user_id: user?.id,
          reason: cancelReason.trim()
        });

      if (cancellationError) throw cancellationError;

      toast.success('Ride cancelled successfully');
      setCancelDialogOpen(false);
      setCancelReason('');
      setActiveBooking(null); // Clear active booking
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast.error('Failed to cancel ride');
    }
  };

  const fetchActiveRide = async () => {
    try {
      // Fetch active booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id)
        .in('status', ['accepted', 'started'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (bookingError) {
        if (bookingError.code === 'PGRST116') {
          // No active booking found
          setActiveBooking(null);
          return;
        }
        throw bookingError;
      }

      setActiveBooking(bookingData);

      // Fetch driver details if booking has a driver
      if (bookingData.driver_id) {
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', bookingData.driver_id)
          .single();

        if (driverError) throw driverError;
        setDriver(driverData);

        // Fetch driver user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name, phone_no')
          .eq('id', bookingData.driver_id)
          .single();

        if (userError) throw userError;
        setDriverUser(userData);

        // Fetch vehicle details if booking has a vehicle
        if (bookingData.vehicle_id) {
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', bookingData.vehicle_id)
            .single();

          if (vehicleError) throw vehicleError;
          setVehicle({
            id: vehicleData.id,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            license_plate: vehicleData.license_plate,
            color: vehicleData.color,
            type: 'Standard'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching active ride:', error);
      toast.error('Failed to load ride tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'started':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Ride Tracking</h1>
            <p className="text-muted-foreground">Track your current ride in real-time</p>
          </div>

          {!activeBooking ? (
            <Card className="glass text-center p-8">
              <Navigation className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No active rides</h3>
              <p className="text-muted-foreground mb-4">You don't have any active rides to track</p>
              <Button className="bg-gradient-primary">Book a Ride</Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Ride Status */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Current Ride
                    </span>
                    <Badge className={getStatusColor(activeBooking.status)}>
                      {activeBooking.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Pickup Location</p>
                          <p className="text-sm font-medium">{activeBooking.pickup_address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Destination</p>
                          <p className="text-sm font-medium">{activeBooking.dropoff_address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Booking Time</p>
                          <p className="text-sm font-medium">{formatTime(activeBooking.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Vehicle Type</p>
                          <p className="text-sm font-medium">{activeBooking.vehicle_type || 'Standard'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle & Driver Information */}
              <VehicleDriverDetails 
                vehicle={vehicle}
                driver={driver}
                driverUser={driverUser}
              />

              {/* Live Map Tracking */}
              {activeBooking.pickup_latitude && activeBooking.pickup_longitude && 
               activeBooking.dropoff_latitude && activeBooking.dropoff_longitude && (
                <LiveMapTracking
                  pickup={{
                    lat: activeBooking.pickup_latitude,
                    lng: activeBooking.pickup_longitude,
                    address: activeBooking.pickup_address
                  }}
                  dropoff={{
                    lat: activeBooking.dropoff_latitude,
                    lng: activeBooking.dropoff_longitude,
                    address: activeBooking.dropoff_address
                  }}
                  driverLocation={
                    driver?.current_latitude && driver?.current_longitude
                      ? {
                          lat: driver.current_latitude,
                          lng: driver.current_longitude
                        }
                      : undefined
                  }
                  isActive={activeBooking.status === 'started'}
                  height="400px"
                />
              )}

              {/* Quick Actions */}
              <Card className="glass">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-12"
                      onClick={() => {
                        // Emergency support action
                        window.open('tel:+911234567890', '_self');
                        toast.info('Calling emergency support...');
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Emergency Support
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12"
                      onClick={() => setTripSharingOpen(true)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Share Trip Details
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="h-12"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Cancel Ride
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Ride Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Ride</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this ride? Please provide a reason for cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Please provide a reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelReason('')}>
              Keep Ride
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelRide}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Ride
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trip Sharing Modal */}
      <TripSharingModal
        isOpen={tripSharingOpen}
        onClose={() => setTripSharingOpen(false)}
        booking={activeBooking}
        driver={driverUser}
      />
    </div>
  );
};

export default RideTracking;