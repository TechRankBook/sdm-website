import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  CreditCard,
  Smartphone,
  Wallet,
  Zap,
  Shield,
  CheckCircle
} from "lucide-react";
import { BookingData } from "@/stores/bookingStore";
import { BookingSummary } from "./BookingSummary";

interface PaymentPageProps {
  bookingData: BookingData;
  onNext: () => void;
  onBack: () => void;
}

export const PaymentPage = ({ bookingData, onNext, onBack }: PaymentPageProps) => {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalFare = bookingData.selectedFare?.price || 0;
  const advancePayment = Math.ceil(totalFare * 0.2);
  const remainingAmount = totalFare - advancePayment;

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      icon: Smartphone,
      description: "PhonePe, GooglePay, Paytm"
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, RuPay"
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      icon: Wallet,
      description: "Paytm, Mobikwik, Amazon Pay"
    }
  ];

  const { toast } = useToast();

  const handlePayment = async () => {
    if (!bookingData.selectedFare) {
      toast({
        title: "Error",
        description: "No fare selected. Please go back and select a vehicle.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please login to continue booking');
      }

      // Get service type ID
      const { data: serviceType } = await supabase
        .from('service_types')
        .select('id')
        .eq('name', bookingData.serviceType)
        .single();

      // Create booking in database first
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          pickup_address: bookingData.pickupLocation,
          dropoff_address: bookingData.dropoffLocation,
          pickup_latitude: bookingData.pickupLatitude,
          pickup_longitude: bookingData.pickupLongitude,
          dropoff_latitude: bookingData.dropoffLatitude,
          dropoff_longitude: bookingData.dropoffLongitude,
          fare_amount: bookingData.selectedFare.price,
          status: 'pending',
          payment_status: 'pending',
          scheduled_time: bookingData.scheduledDateTime || null,
          service_type_id: serviceType?.id || null,
          is_scheduled: bookingData.scheduledDateTime ? true : false,
          is_round_trip: bookingData.isRoundTrip || false,
          return_scheduled_time: bookingData.returnDateTime || null,
          trip_type: bookingData.tripType,
          vehicle_type: bookingData.carType || bookingData.vehicleType,
          special_instructions: bookingData.specialInstructions,
          package_hours: bookingData.packageSelection ? parseInt(bookingData.packageSelection) : null,
          distance_km: bookingData.distanceKm,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      console.log('Booking created:', booking);

      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          bookingData,
          bookingId: booking.id,
          paymentMethod: paymentMethod,
        },
      });

      console.log('Stripe session response:', { data, error });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url; // Use location.href instead of window.open for better UX
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error?.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
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
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Payment</h1>
          <div className="w-[60px]"></div>
        </div>

        {/* Booking Summary */}
        <BookingSummary bookingData={bookingData} />

        {/* Payment Breakdown */}
        <Card className="glass-hover p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Breakdown</h2>
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">Advance Payment (20%)</span>
                <Badge className="bg-gradient-primary text-white text-xs">PAY NOW</Badge>
              </div>
              <span className="text-primary font-bold text-lg">₹{advancePayment}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining Amount</span>
              <span className="text-muted-foreground">₹{remainingAmount}</span>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Remaining amount will be collected after ride completion
            </p>
          </div>
        </Card>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Select Payment Method</h2>
          
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="glass-hover p-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      <method.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </Label>
                </div>
              </Card>
            ))}
          </RadioGroup>
        </div>

        {/* Payment Details Form */}
        {paymentMethod === "card" && (
          <Card className="glass-hover p-4 mb-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="glass-hover mt-1 h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry" className="text-sm">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    className="glass-hover mt-1 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-sm">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    className="glass-hover mt-1 h-10"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {paymentMethod === "upi" && (
          <Card className="glass-hover p-4 mb-6">
            <div>
              <Label htmlFor="upiId" className="text-sm">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="username@paytm"
                className="glass-hover mt-1 h-10"
              />
            </div>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="glass-hover p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Secure Payment</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your payment information is encrypted and secure. We use industry-standard security measures.
          </p>
        </Card>

        {/* Confirm Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full h-12 bg-gradient-primary text-lg font-semibold micro-bounce"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Pay ₹{advancePayment} Now
            </div>
          )}
        </Button>
      </Card>
    </div>
  );
};