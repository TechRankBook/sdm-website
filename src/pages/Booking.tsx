import { useEffect } from "react";
import { EnhancedBookingForm } from "@/components/booking/EnhancedBookingForm";
import { VehicleSelection } from "@/components/booking/VehicleSelection";
import { PaymentPage } from "@/components/booking/PaymentPage";
import { ThankYouPage } from "@/components/booking/ThankYouPage";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useBookingStore, type BookingData } from "@/stores/bookingStore";

export type { BookingData };

const Booking = () => {
  const { 
    bookingData, 
    currentStep, 
    setBookingData, 
    setCurrentStep, 
    nextStep, 
    prevStep 
  } = useBookingStore();
  
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Handle pre-filled data from home page
    const pickup = searchParams.get('pickup');
    const destination = searchParams.get('destination');
    const service = searchParams.get('service');
    const time = searchParams.get('time');

    if (pickup || destination || service) {
      setBookingData({
        pickupLocation: pickup || "",
        dropoffLocation: destination || "",
        serviceType: service === "city" ? "city_ride" : 
                   service === "airport" ? "airport" :
                   service === "rental" ? "car_rental" :
                   service === "outstation" ? "outstation" : bookingData.serviceType
      });
    }

    // Handle Stripe payment success/cancel
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true' && sessionId) {
      toast({
        title: "Payment Successful! 🎉",
        description: "Your booking has been confirmed. You'll receive driver details shortly.",
      });
      setCurrentStep(3); // Go to thank you page
    } else if (canceled === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again.",
        variant: "destructive",
      });
      setCurrentStep(2); // Go back to payment page
    }
  }, [searchParams, toast]);

  const updateBookingData = setBookingData;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full max-w-lg mx-auto">
            <EnhancedBookingForm
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={nextStep}
            />
          </div>
        );
      case 2:
        return (
          <div className="w-full max-w-lg mx-auto">
            <VehicleSelection
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={nextStep}
              onBack={prevStep}
              routeData={null}
            />
          </div>
        );
      case 3:
        return (
          <PaymentPage
            bookingData={bookingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return <ThankYouPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Step Indication */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentStep === 1 ? "Book Your Ride" : 
             currentStep === 2 ? "Choose Your Vehicle" : 
             currentStep === 3 ? "Secure Payment" : 
             "Booking Confirmed"}
          </h1>
          <p className="text-muted-foreground">
            {currentStep === 1 ? "Enter your trip details and see available options" : 
             currentStep === 2 ? "Select the perfect vehicle for your journey" :
             currentStep === 3 ? "Complete your payment to confirm your booking" : 
             "Thank you for choosing SDM E-Mobility"}
          </p>
        </div>

        {/* Step Content */}
        <div className="flex justify-center">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Booking;