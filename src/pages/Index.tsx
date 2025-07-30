import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BookingWidget } from "@/components/BookingWidget";
import { DriverDashboard } from "@/components/DriverDashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { 
  Zap, 
  Leaf, 
  Shield, 
  Clock, 
  Star,
  Users,
  ArrowRight,
  Phone,
  Play
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { ThankYouPage } from "@/components/booking/ThankYouPage";
import { PaymentPage } from "@/components/booking/PaymentPage";
import { FareCalculation } from "@/components/booking/FareCalculation";
import { EnhancedBookingForm } from "@/components/booking/EnhancedBookingForm";
import { BookingData } from "./Booking";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Removed driver functionality - rider-only platform

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const features = [
    {
      icon: Zap,
      title: "100% Electric Fleet",
      description: "Zero-emission rides powered by clean energy",
      color: "text-green-500"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Advanced safety features and verified drivers",
      color: "text-blue-500"
    },
    {
      icon: Clock,
      title: "Always On Time",
      description: "Reliable rides with real-time tracking",
      color: "text-orange-500"
    },
    {
      icon: Star,
      title: "Premium Experience",
      description: "5-star rated service and customer support",
      color: "text-yellow-500"
    }
  ];

  const stats = [
    { value: "2.5M+", label: "Happy Riders" },
    { value: "50K+", label: "Drivers" },
    { value: "100%", label: "Electric" },
    { value: "24/7", label: "Available" }
  ];

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
    <div className="min-h-screen">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4 fade-in">
                <Badge variant="secondary" className="mb-4">
                  <Leaf className="w-4 h-4 mr-2" />
                  Sustainable Mobility 2025
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                  Electric
                  <span className="block text-transparent bg-gradient-primary bg-clip-text">
                    Mobility
                  </span>
                  <span className="block">Reimagined</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Experience the future of urban transportation with SDM E-Mobility. 
                  Clean, smart, and sustainable rides at your fingertips.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-gradient-primary micro-bounce">
                  <Play className="w-5 h-5 mr-2" />
                  Book Your Ride
                </Button>
                <Button size="lg" variant="ghost" className="micro-bounce">
                  <Phone className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <p className="text-2xl lg:text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Interface - Rider Only */}
            <div className="fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex justify-center">
          {renderStep()}
        </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose SDM E-Mobility?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leading the electric revolution with cutting-edge technology and sustainable practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass glass-hover p-6 text-center group">
                <div className={`p-4 rounded-full bg-gradient-primary w-16 h-16 mx-auto mb-4 group-hover:animate-pulse-glow transition-all duration-300`}>
                  <feature.icon className="w-8 h-8 text-white mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-surface" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Ready to Go Electric?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join millions of riders who've already made the switch to sustainable mobility
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="bg-gradient-primary micro-bounce">
                <Zap className="w-5 h-5 mr-2" />
                Start Riding Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-glass-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">SDM E-Mobility</h3>
            <p className="text-muted-foreground mb-4">
              Powering the future of sustainable transportation
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a href="#" className="hover:text-primary transition-colors">Careers</a>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              © 2025 SDM E-Mobility. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
