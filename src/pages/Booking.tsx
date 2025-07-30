import { useState } from "react";
import { BookingForm } from "@/components/booking/BookingForm";
import { FareCalculation } from "@/components/booking/FareCalculation";
import { PaymentPage } from "@/components/booking/PaymentPage";
import { ThankYouPage } from "@/components/booking/ThankYouPage";
import { ArrowBigLeft, HomeIcon } from "lucide-react";

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
    serviceType: "city",
    pickupLocation: "",
    dropoffLocation: "",
    scheduledDateTime: "",
    passengers: 1,
    packageSelection: "",
    carType: "",
    selectedFare: undefined
  });

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
          <BookingForm
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <FareCalculation
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNext={nextStep}
            onBack={prevStep}
          />
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