import { useEffect } from "react";
import { Header } from "@/components/Header";
import { useState } from "react";
import { EnhancedBookingForm } from "@/components/booking/EnhancedBookingForm";
import { VehicleSelection } from "@/components/booking/VehicleSelection";
import { RazorpayPaymentPage } from "@/components/booking/RazorpayPaymentPage";
import { ImprovedThankYouPage } from "@/components/booking/ImprovedThankYouPage";
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
    console.log("🔍 useEffect triggered - searchParams:", searchParams.toString(), "currentStep:", currentStep);
    
    // Handle step navigation from URL
    const step = searchParams.get('step');
    const bookingId = searchParams.get('booking_id');
    const paymentSuccess = searchParams.get('payment_success');
    const paymentCanceled = searchParams.get('payment_canceled');
    
    // If user is coming to booking page with payment success, show thank you page
    if (step === '4' && bookingId) {
      console.log("📍 Setting step to 4 for payment success");
      setCurrentStep(4);
      return;
    }
    
    // If payment was successful, redirect to thank you page
    if (paymentSuccess === 'true' && bookingId) {
      console.log("📍 Setting step to 4 for payment success");
      setCurrentStep(4);
      return;
    } 
    
    // If payment was canceled, stay on payment page with message
    if (paymentCanceled === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again.",
        variant: "destructive",
      });
      console.log("📍 Setting step to 3 for payment canceled");
      setCurrentStep(3);
      return;
    }

    // Handle pre-filled data from home page
    const pickup = searchParams.get('pickup');
    const destination = searchParams.get('destination');
    const service = searchParams.get('service');

    if (pickup || destination || service) {
      console.log("📍 Pre-filling form data from URL params");
      setBookingData({
        pickupLocation: pickup || "",
        dropoffLocation: destination || "",
        serviceType: service === "city" ? "ride_later" : 
                   service === "airport" ? "airport" :
                   service === "rental" ? "car_rental" :
                   service === "outstation" ? "outstation" : bookingData.serviceType
      });
    }

    // Only reset to step 1 if we're at the beginning of a fresh booking session
    // AND there are no URL parameters indicating we should be elsewhere
    // AND we're currently on step 1 (don't reset mid-flow)
    if (!paymentSuccess && !paymentCanceled && !step && !bookingId && !pickup && !destination && !service) {
      if (currentStep === 1) {
        console.log("📍 Fresh booking session - staying on step 1");
      } else {
        console.log("📍 User is mid-booking flow - NOT resetting step. Current step:", currentStep);
      }
    }
  }, [searchParams, toast, setCurrentStep, setBookingData, bookingData.serviceType]);

  const updateBookingData = setBookingData;

  const renderStep = () => {
    console.log("🎬 Rendering step:", currentStep);
    switch (currentStep) {
      case 1:
        console.log("📝 Rendering EnhancedBookingForm (step 1)");
        return (
          <div className="w-full max-w-lg mx-auto glass charging-animation">
            <EnhancedBookingForm
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={nextStep}
            />
          </div>
        );
      case 2:
        console.log("🚗 Rendering VehicleSelection (step 2)");
        return (
          <div className="w-full max-w-lg mx-auto glass charging-animation">
            <VehicleSelection
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={nextStep}
              onBack={prevStep}
              routeData={{
                distance: (bookingData.distanceKm || 0).toString(),
                duration: (bookingData.durationMinutes || 0).toString(),
                distanceKm: bookingData.distanceKm || 0,
                durationMinutes: bookingData.durationMinutes || 0
              }}
            />
          </div>
        );
      case 3:
        console.log("💳 Rendering RazorpayPaymentPage (step 3)");
        return (
          <div className="glass charging-animation">
            <RazorpayPaymentPage
              bookingData={bookingData}
              onNext={nextStep}
              onBack={prevStep}
            />
          </div>
        );
      case 4:
        console.log("🎉 Rendering ImprovedThankYouPage (step 4)");
        return <ImprovedThankYouPage />;
      default:
        console.log("❓ Unknown step:", currentStep);
        return null;
    }
  };

  return (
    <div className="min-h-screen morphing-bg ev-particles">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header with Step Indication */}
        <div className="text-center mb-8 fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-primary bg-clip-text text-transparent">
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
          <div className="card-hover-lift">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;