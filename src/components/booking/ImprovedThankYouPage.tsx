import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBookingStore } from "@/stores/bookingStore";
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Car,
  CreditCard,
  ArrowRight,
  Home 
} from "lucide-react";

interface BookingDetails {
  id: string;
  pickup_address: string;
  dropoff_address?: string;
  vehicle_type?: string;
  scheduled_time?: string;
  fare_amount: number;
  payment_method?: string;
}

export const ImprovedThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualPaidAmount, setActualPaidAmount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resetBookingData } = useBookingStore();

  const bookingId = searchParams.get('booking_id');
  const paymentSuccess = searchParams.get('payment_success');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        // Get the latest booking that was just paid
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data: bookingData, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (bookingData) {
          setBooking(bookingData);
          
          // Fetch payment amount
          const { data: payment } = await supabase
            .from('payments')
            .select('amount')
            .eq('booking_id', bookingData.id)
            .eq('status', 'paid')
            .single();

          if (payment) {
            setActualPaidAmount(payment.amount);
          } else {
            // Fallback to 25% if no payment record
            setActualPaidAmount(Math.ceil(bookingData.fare_amount * 0.25));
          }

          if (paymentSuccess === 'true') {
            toast({
              title: "Payment Successful!",
              description: "Your booking has been confirmed. You'll receive SMS updates.",
            });
          }
        }
      } catch (error: any) {
        console.error('Error fetching booking:', error);
        toast({
          title: "Error",
          description: "Failed to fetch booking details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, paymentSuccess, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!bookingId || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive text-2xl">✗</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Booking Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Unable to find your booking details. Please try again.
          </p>
          <Button 
            onClick={() => navigate('/booking')} 
            className="w-full"
          >
            Book New Ride
          </Button>
        </Card>
      </div>
    );
  }

  const remainingAmount = booking.fare_amount - actualPaidAmount;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="glass p-6 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Your ride has been booked successfully. We'll send you SMS updates about your ride.
          </p>
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 mt-4">
            Booking ID: {booking.id.slice(0, 8)}
          </Badge>
        </Card>

        {/* Trip Details */}
        <Card className="glass p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Trip Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">From</p>
                <p className="text-foreground font-medium">{booking.pickup_address}</p>
              </div>
            </div>

            {booking.dropoff_address && (
              <>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="text-foreground font-medium">{booking.dropoff_address}</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Type</p>
                <p className="text-foreground font-medium capitalize">{booking.vehicle_type || 'Standard'}</p>
              </div>
            </div>

            {booking.scheduled_time && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Time</p>
                  <p className="text-foreground font-medium">
                    {new Date(booking.scheduled_time).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Summary */}
        <Card className="glass p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Fare</span>
              <span className="text-foreground font-medium">₹{booking.fare_amount}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-medium">Paid Now</span>
              </div>
              <span className="text-green-500 font-bold">₹{actualPaidAmount}</span>
            </div>
            
            {remainingAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Remaining (Pay after ride)</span>
                <span className="text-foreground">₹{remainingAmount}</span>
              </div>
            )}
            
            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <span className="text-foreground font-medium">Payment Method</span>
                <Badge variant="outline" className="capitalize">
                  {booking.payment_method || 'Card'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="glass p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">What's Next?</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>You'll receive SMS notifications with driver details</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Driver will contact you before pickup</span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Pay remaining ₹{remainingAmount} after ride completion</span>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button 
            onClick={() => {
              resetBookingData();
              navigate('/booking', { replace: true });
            }}
            className="flex-1"
          >
            Book Another Ride
          </Button>
        </div>
      </div>
    </div>
  );
};