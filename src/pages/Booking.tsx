import { useState, useEffect } from "react";
import { EnhancedBookingForm } from "@/components/booking/EnhancedBookingForm";
import { PaymentPage } from "@/components/booking/PaymentPage";
import { ThankYouPage } from "@/components/booking/ThankYouPage";
import { ArrowBigLeft, HomeIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export interface BookingData {
  serviceType: string;
  pickupLocation: string;
  dropoffLocation?: string;
  scheduledDateTime?: string;
  passengers?: number;
  packageSelection?: string;
  carType?: string;
  selectedFare?: {
    type: string;
    price: number;
  };
}

const Booking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceType: "city_ride",
    pickupLocation: "",
    dropoffLocation: "",
    scheduledDateTime: "",
    passengers: 1,
    packageSelection: "",
    carType: "",
    selectedFare: undefined
  });
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
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

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EnhancedBookingForm
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <PaymentPage
            bookingData={bookingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return <ThankYouPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Step Content */}
        <div className="flex justify-center">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Booking;