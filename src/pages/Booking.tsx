import { useEffect } from "react";
import { Header } from "@/components/Header";
import { useState } from "react";
import { EnhancedBookingForm } from "@/components/booking/EnhancedBookingForm";
import { VehicleSelection } from "@/components/booking/VehicleSelection";
import { RazorpayPaymentPage } from "@/components/booking/RazorpayPaymentPage";
import { ThankYouPage } from "@/components/booking/ThankYouPage";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useBookingStore, type BookingData } from "@/stores/bookingStore";

export type { BookingData };

const Booking = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
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
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    // Check if user came from home page with saved booking data
    // If booking data exists and we're on step 1, move to step 2 (vehicle selection)
    if (bookingData.pickupLocation && bookingData.dropoffLocation && currentStep === 1) {
      setCurrentStep(2);
    }

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

    // Handle payment success/cancel from URL params
    const paymentSuccess = searchParams.get('payment_success');
    const paymentCanceled = searchParams.get('payment_canceled');

    if (paymentSuccess === 'true') {
      // Redirect to thank you page
      setCurrentStep(4);
      return;
    } else if (paymentCanceled === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again.",
        variant: "destructive",
      });
      setCurrentStep(3); // Go back to payment page
    }
  }, [searchParams, toast, bookingData.pickupLocation, bookingData.dropoffLocation, currentStep]);

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
          <RazorpayPaymentPage
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
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="container mx-auto px-4 pt-24 pb-8">
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