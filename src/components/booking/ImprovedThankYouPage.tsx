import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBookingStore, BookingData } from "@/stores/bookingStore";
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Car,
  CreditCard,
  ArrowRight,
  Home,
  AlertTriangle
} from "lucide-react";

interface BookingDetails {
  id: string;
  pickup_address: string;
  dropoff_address?: string;
  vehicle_type?: string;
  scheduled_time?: string;
  fare_amount: number;
  payment_method?: string;
  advance_amount?: number;
  remaining_amount?: number;
}

// Helper function to create a fallback booking from store data
const createFallbackBooking = (bookingId: string, storeData: BookingData): BookingDetails => {
  const totalFare = storeData.selectedFare?.price || 0;
  const advanceAmount = Math.ceil(totalFare * 0.25); // 25% advance
  
  return {
    id: bookingId,
    pickup_address: storeData.pickupLocation || "Unknown location",
    dropoff_address: storeData.dropoffLocation,
    vehicle_type: storeData.vehicleType || storeData.carType,
    scheduled_time: storeData.scheduledDateTime,
    fare_amount: totalFare,
    payment_method: "razorpay",
    advance_amount: advanceAmount,
    remaining_amount: totalFare - advanceAmount
  };
};

export const ImprovedThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualPaidAmount, setActualPaidAmount] = useState(0);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resetBookingData, bookingData } = useBookingStore();

  const bookingId = searchParams.get('booking_id');
  const paymentSuccess = searchParams.get('payment_success');
  
  // Check sessionStorage for booking data immediately
  useEffect(() => {
    try {
      const storedBooking = sessionStorage.getItem('current_booking');
      if (storedBooking && bookingId) {
        const parsedBooking = JSON.parse(storedBooking) as BookingDetails;
        
        // Verify this is the correct booking
        if (parsedBooking.id === bookingId) {
          console.log('Found booking data in sessionStorage');
          setBooking(parsedBooking);
          setActualPaidAmount(parsedBooking.advance_amount || Math.ceil(parsedBooking.fare_amount * 0.25));
          setLoading(false);
          
          // Clear the sessionStorage to avoid using stale data in the future
          sessionStorage.removeItem('current_booking');
        }
      }
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
    }
  }, [bookingId]);

  useEffect(() => {
    // Skip database fetch if we already have booking data from sessionStorage
    if (booking) {
      return;
    }
    
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1000; // 1 second
    let retryTimeout: NodeJS.Timeout;
    
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        console.log(`Attempting to fetch booking (attempt ${retryCount + 1}/${maxRetries + 1})...`);
        
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

        if (error) {
          // If this is a "not found" error and we haven't exceeded max retries
          if (error.code === 'PGRST116' && retryCount < maxRetries) {
            console.log(`Booking not found yet, will retry in ${retryDelay}ms...`);
            retryCount++;
            retryTimeout = setTimeout(fetchBookingDetails, retryDelay);
            return;
          }
          throw error;
        }

        if (bookingData) {
          console.log('Booking data found:', bookingData.id);
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
        
        // Only show error toast if we've exhausted all retries
        if (retryCount >= maxRetries) {
          toast({
            title: "Error",
            description: "Failed to fetch booking details. Please check your trip history.",
            variant: "destructive",
          });
        } else if (paymentSuccess === 'true') {
          // If payment was successful but we can't find the booking yet, retry
          retryCount++;
          console.log(`Will retry in ${retryDelay}ms (attempt ${retryCount}/${maxRetries + 1})...`);
          retryTimeout = setTimeout(fetchBookingDetails, retryDelay);
          return;
        }
      } finally {
        // If we've exhausted all retries and still don't have booking data,
        // but we have a booking ID and payment was successful, use fallback data
        if (retryCount >= maxRetries && !booking && bookingId && paymentSuccess === 'true' && bookingData.selectedFare) {
          console.log('Using fallback booking data from store');
          const fallbackBooking = createFallbackBooking(bookingId, bookingData);
          setBooking(fallbackBooking);
          setActualPaidAmount(fallbackBooking.advance_amount || Math.ceil(fallbackBooking.fare_amount * 0.25));
          setUsingFallbackData(true);
          setLoading(false);
          
          toast({
            title: "Booking Confirmed",
            description: "Your payment was successful. We're showing estimated details while we finalize your booking.",
          });
        } 
        // Only set loading to false if we're not going to retry
        else if (retryCount >= maxRetries || booking) {
          setLoading(false);
        }
      }
    };

    fetchBookingDetails();
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [bookingId, paymentSuccess, toast, booking, bookingData]);

  if (loading) {
    // Show a more informative loading state, especially if payment was successful
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md w-full p-6">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          {paymentSuccess === 'true' ? (
            <>
              <h2 className="text-xl font-bold text-foreground mb-2">Processing Your Booking</h2>
              <p className="text-muted-foreground">
                Your payment was successful! We're finalizing your booking details. This may take a few moments...
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Loading booking details...</p>
          )}
        </div>
      </div>
    );
  }

  // If payment was successful but booking data isn't loaded yet, 
  // continue showing the loading state instead of "Not Found"
  if (!booking && paymentSuccess !== 'true') {
    // Only show "Not Found" if payment wasn't successful
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
            onClick={() => {resetBookingData(); navigate('/booking')}} 
            className="w-full"
          >
            Book New Ride
          </Button>
        </Card>
      </div>
    );
  }
  
  // If payment was successful but booking isn't loaded yet, create a temporary booking
  if (!booking && paymentSuccess === 'true' && bookingId) {
    // Create a temporary booking from store data
    const tempBooking = createFallbackBooking(bookingId, bookingData);
    setBooking(tempBooking);
    setActualPaidAmount(tempBooking.advance_amount || Math.ceil(tempBooking.fare_amount * 0.25));
    setUsingFallbackData(true);
  }

  // Ensure booking exists before accessing properties
  if (!booking) {
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
            onClick={() => {resetBookingData(); navigate('/booking')}} 
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
            Trip ID: {booking.id.slice(-8)}
          </Badge>
        </Card>
        
        {/* Warning banner for fallback data */}
        {usingFallbackData && (
          <Card className="glass p-4 border border-yellow-500/50 bg-yellow-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-500">
                  Showing estimated booking details
                </p>
                <p className="text-xs text-muted-foreground">
                  Your payment was successful, but we're still processing your booking. 
                  Some details may update shortly. Please check your trip history for the most accurate information.
                </p>
              </div>
            </div>
          </Card>
        )}

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
            onClick={() => {resetBookingData(); navigate('/')}}
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