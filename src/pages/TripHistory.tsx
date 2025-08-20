import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, MapPin, Clock, Car, Star, IndianRupee } from "lucide-react";
import { TripDetailsModal } from "@/components/trip/TripDetailsModal";
import { ReviewModal } from "@/components/review/ReviewModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface Booking {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  start_time: string;
  end_time: string;
  vehicle_type: string;
  driver_id: string;
  driver?: {
    full_name: string;
  };
}

const TripHistory = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    bookingId: string;
    driverId: string;
    driverName: string;
  }>({
    isOpen: false,
    bookingId: "",
    driverId: "",
    driverName: ""
  });

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancelBooking = async () => {
    if (!cancelBookingId || !cancelReason.trim()) {
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
        .eq('id', cancelBookingId);

      if (bookingError) throw bookingError;

      // Insert cancellation record
      const { error: cancellationError } = await supabase
        .from('booking_cancellations')
        .insert({
          booking_id: cancelBookingId,
          user_id: user?.id,
          reason: cancelReason.trim()
        });

      if (cancellationError) throw cancellationError;

      toast.success('Booking cancelled successfully');
      setCancelDialogOpen(false);
      setCancelBookingId(null);
      setCancelReason('');
      fetchTripHistory(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    if (user) {
      fetchTripHistory();
    }
  }, [user]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const fetchTripHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // For each booking, fetch driver details if driver_id exists
      const bookingsWithDrivers = await Promise.all(
        (data || []).map(async (booking) => {
          if (booking.driver_id) {
            const { data: driverData } = await supabase
              .from('users')
              .select('full_name')
              .eq('id', booking.driver_id)
              .single();
            
            return {
              ...booking,
              driver: driverData
            };
          }
          return booking;
        })
      );
      
      setBookings(bookingsWithDrivers);
    } catch (error) {
      console.error('Error fetching trip history:', error);
      toast.error('Failed to load trip history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'started':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsDetailsModalOpen(true);
  };

  const handleRateTrip = (booking: Booking) => {
    if (!booking.driver_id || !booking.driver?.full_name) {
      toast.error('Driver information not available');
      return;
    }
    
    setReviewModalData({
      isOpen: true,
      bookingId: booking.id,
      driverId: booking.driver_id,
      driverName: booking.driver.full_name
    });
  };

  const handleReviewSubmitted = () => {
    // Optionally refresh the trip history to update UI
    fetchTripHistory();
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
            <h1 className="text-4xl font-bold text-foreground mb-4">Trip History</h1>
            <p className="text-muted-foreground">View all your past and current bookings</p>
          </div>

          {bookings.length === 0 ? (
            <Card className="glass text-center p-8">
              <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-4">Book your first ride to see your trip history</p>
              <Button className="bg-gradient-primary">Book a Ride</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="glass">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {booking.payment_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(booking.created_at)}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">Pickup</p>
                            <p className="text-sm font-medium">{booking.pickup_address || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">Dropoff</p>
                            <p className="text-sm font-medium">{booking.dropoff_address || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-primary" />
                          <span className="text-sm">{booking.vehicle_type || 'Standard'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">₹{booking.fare_amount}</span>
                        </div>
                        {booking.start_time && booking.end_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm">
                              {Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60))} mins
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="text-md text-bold">
                        Trip ID: {booking.id.slice(-6)}
                      </div>
                      <div className="flex gap-2">
                        {(booking.status === 'pending' || booking.status === 'accepted') && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setCancelBookingId(booking.id);
                              setCancelDialogOpen(true);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                        {booking.status === 'completed' && booking.driver_id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRateTrip(booking)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Rate Trip
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(booking.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedBookingId && (
        <TripDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedBookingId(null);
          }}
          bookingId={selectedBookingId}
        />
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalData.isOpen}
        onClose={() => setReviewModalData(prev => ({ ...prev, isOpen: false }))}
        bookingId={reviewModalData.bookingId}
        driverId={reviewModalData.driverId}
        driverName={reviewModalData.driverName}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Cancel Booking Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? Please provide a reason for cancellation.
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
            <AlertDialogCancel onClick={() => {
              setCancelReason('');
              setCancelBookingId(null);
            }}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TripHistory;