import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Car,
  CreditCard,
  ArrowRight,
  Home 
} from "lucide-react";

export const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const paymentSuccess = searchParams.get('payment_success');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!paymentSuccess) {
        setLoading(false);
        return;
      }

      try {
        // Get the latest booking for this user that was just paid
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .eq('payment_status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (bookings && bookings.length > 0) {
          setBooking(bookings[0]);
          toast({
            title: "Payment Successful!",
            description: "Your booking has been confirmed. You'll receive SMS updates.",
          });
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
  }, [paymentSuccess, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (!paymentSuccess || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive text-2xl">✗</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Payment Failed</h1>
          <p className="text-muted-foreground mb-6">
            Something went wrong with your payment. Please try again.
          </p>
          <Button 
            onClick={() => window.location.href = '/booking'} 
            className="w-full"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const advanceAmount = Math.ceil(booking.fare_amount * 0.2);
  const remainingAmount = booking.fare_amount - advanceAmount;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="glass p-6 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Your booking has been confirmed. We'll send you SMS updates about your ride.
          </p>
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 mt-4">
            Booking ID: {booking.id.slice(0, 8)}
          </Badge>
        </Card>

        {/* Booking Details */}
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
              <span className="text-green-500 font-bold">₹{advanceAmount}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Remaining (Pay after ride)</span>
              <span className="text-foreground">₹{remainingAmount}</span>
            </div>
            
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
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Pay remaining amount after ride completion</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button 
            onClick={() => window.location.href = '/booking'}
            className="flex-1"
          >
            Book Another Ride
          </Button>
        </div>
      </div>
    </div>
  );
};