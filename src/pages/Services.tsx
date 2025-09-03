import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Plane,
  Route,
  Users,
  Clock,
  Zap,
  Shield,
  MapPin,
  CreditCard,
  TimerReset,
  Plus,
  Eye,
  Navigation,
  Star,
  Smartphone,
  ArrowRight,
  BadgeIndianRupee,
  HandCoins,
  Banknote,
  CircleDollarSign,
  CarTaxiFront,
  CreditCardIcon,
  Coins,
} from "lucide-react";

const Services = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeService, setActiveService] = useState(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const services = [
    {
      id: "city",
      name: "Ride Later",
      icon: Car,
      image: "/img/cityRide.jpg", // Ensure these paths are correct
      price: "₹8/km",
      time: "₹109/km(SUV), ₹99/km(Sedan)",
      description:
        "Schedule rides in advance for daily commutes and planned trips.",
      features: [
        "100% Electric",
        "Real-time tracking",
        "Instant booking",
        "24/7 available",
      ],
      benefits: [
        "Zero emissions",
        "Quiet ride",
        "Air conditioning",
        "Safety features",
      ],
      commingSoon: false,
    },
    {
      id: "airport",
      name: "Airport Taxi",
      icon: Plane,
      image: "/img/airport.jpg",
      price: "₹12/km",
      time: "₹109/km(SUV), ₹99/km(Sedan)",
      description:
        "Direct airport transfers with flight tracking and luggage assistance.",
      features: [
        "Flight tracking",
        "Meet & greet",
        "Luggage space",
        "Premium vehicles",
      ],
      benefits: [
        "No waiting",
        "Professional drivers",
        "Fixed pricing",
        "24/7 service",
      ],
      commingSoon: false,
    },
       {
      id: "outstation",
      name: "Outstation",
      icon: Route,
      image: "/img/outstation.jpg",
      price: "SUV: ₹15/km SEDAN: ₹18/km",
      time: "₹109/km(SUV), ₹99/km(Sedan)",
      description:
        "Long distance travel for weekend getaways and business trips.",
      features: [
        "Driver included",
        "Round trip",
        "Overnight stays",
        "Highway optimized",
      ],
      benefits: [
        "Comfortable journey",
        "Multiple destinations",
        "Rest stops",
        "Experienced drivers",
      ],
      commingSoon: false,
    },
    {
      id: "rental",
      name: "Car Rental",
      icon: TimerReset,
      image: "/img/rental.jpg",
      price: "₹200/hr",
      time: "₹109/km(SUV), ₹99/km(Sedan)",
      description:
        "Hourly car rentals for meetings, shopping, or multiple stops.",
      features: [
        "Self-drive option",
        "Flexible hours",
        "Multiple stops",
        "Driver included",
      ],
      benefits: [
        "Cost effective",
        "No parking hassle",
        "Fuel included",
        "Insurance covered",
      ],
      commingSoon: true,
    },
 
    // {
    //   id: "share",
    //   name: "Ride Sharing",
    //   icon: Users,
    //   image: "/img/city_ride.jpg",
    //   price: "₹4/km",
    //   time: "8 min",
    //   description: "Share rides with other passengers for budget-friendly travel.",
    //   features: ["Budget-friendly", "Route matching", "Safe co-passengers", "Environmental"],
    //   benefits: ["50% cost savings", "Social travel", "Reduced traffic", "Carbon neutral"],
    // },
  ];
  const mainSteps = [
    {
      step: "01",
      title: "Select a Service",
      description:
        "Choose from our range of electric mobility services based on your needs",
      icon: Plus, // Use Plus icon for the first step
      details: [
        "Ride Later - Schedule advance rides",
        "Airport Taxi - Direct transfers",
        "Car Rental - Hourly bookings",
        "Outstation - Long distance travel",
        "Ride Sharing - Budget-friendly option",
      ],
      tips: "Select 'Ride Now' for immediate pickup or 'Schedule for Later' for advance booking",
    },
    {
      step: "02",
      title: "Choose a Ride Type",
      description:
        "Pick your preferred electric vehicle and configure your ride preferences",
      icon: Car,
      details: [
        "Select vehicle type (Hatchback, Sedan, SUV)",
        "Choose seating capacity",
        "Set pickup and drop-off locations",
        "Add any special requirements",
        "Confirm ride timing",
      ],
      tips: "All our vehicles are 100% electric with GPS tracking and safety features",
    },
    {
      step: "03",
      title: "Pay (Min 20% Upfront)",
      description:
        "Secure your booking with flexible payment options and transparent pricing",
      icon: CreditCard,
      details: [
        "Pay minimum 20% to confirm booking",
        "Choose from UPI, Cards, Wallets, Cash",
        "Get instant booking confirmation",
        "Receive driver and vehicle details",
        "Track payment history in app",
      ],
      tips: "Remaining amount can be paid after the ride completion",
    },
    {
      step: "04",
      title: "Track and Ride",
      description:
        "Enjoy real-time tracking, safe journey, and comfortable electric ride experience",
      icon: Eye,
      details: [
        "Real-time driver location tracking",
        "Live ETA updates and notifications",
        "Direct communication with driver",
        "In-ride safety features and support",
        "Rate and review after completion",
      ],
      tips: "Emergency contacts and live ride sharing available for added safety",
    },
  ];

  const features = [
    {
      icon: Smartphone,
      title: "Easy Mobile App",
      description: "User-friendly interface for seamless booking experience",
    },
    {
      icon: Clock,
      title: "Quick Response",
      description: "Average pickup time of 3-8 minutes depending on service",
    },
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Background-verified drivers and real-time safety monitoring",
    },
    {
      icon: Zap,
      title: "100% Electric",
      description: "Zero emission rides with modern electric vehicles",
    },
    {
      icon: Navigation,
      title: "Smart Routing",
      description: "AI-optimized routes for faster and efficient travel",
    },
    {
      icon: Star,
      title: "Quality Service",
      description: "4.8-star average rating with professional drivers",
    },
  ];

  useEffect(() => {
    setActiveService(services[0]);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-main text-foreground morphing-bg ev-particles">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Our Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience sustainable mobility with our comprehensive range of
              electric ride services. From quick city rides to long-distance
              travel, we've got you covered.
            </p>
          </div>

          {/* Dynamic Services Section */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Side: Service List */}
            <Card className="glass p-6 md:w-1/3 min-h-[500px] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Explore Our Offerings</h2>
              <ul className="space-y-4">
                {services.map((service) => (
                  <li
                    key={service.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300
                      ${
                        activeService && activeService.id === service.id
                          ? "bg-gradient-primary text-white shadow-lg"
                          : "hover:bg-accent hover:text-primary"
                      }`}
                    onMouseEnter={() => setActiveService(service)}
                  >
                    <div className="flex items-center gap-4">
                      <service.icon
                        className={`w-6 h-6 ${
                          activeService && activeService.id === service.id
                            ? "text-white"
                            : "text-primary"
                        }`}
                      />
                      <span className="text-xl font-semibold">
                        {service.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Right Side: Service Details */}
            <Card className="glass p-8 md:w-2/3 min-h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {activeService && (
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    {/* Image and Details Side-by-Side (or stacked on small screens) */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start mb-6">
                      {activeService.image && (
                        <div className="lg:w-1/2 w-full rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                          <img
                            src={activeService.image}
                            alt={activeService.name}
                            className="w-full h-48 object-cover object-center lg:h-full"
                          />
                        </div>
                      )}

                      <div className="lg:w-1/2 w-full">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-xl bg-gradient-primary">
                            <activeService.icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold">
                              {activeService.name}
                            </h3>
                            <div className="flex items-center gap-4 text-muted-foreground">
                              {activeService.commingSoon && <span className="text-2xl font-bold text-primary">
                                Coming Soon
                              </span> } 
                              {activeService.commingSoon?<></>:<div className="flex items-center gap-1">
                                {/* <HandCoins className="w-4 h-4" /> */}
                                {activeService.time}
                              </div>}
                            </div>
                          </div>
                        </div>
                        <p className="text-lg text-muted-foreground">
                          {activeService.description}
                        </p>
                        <div className="space-y-4 mb-6 mt-3">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Key Features
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {activeService.features.map((feature) => (
                                <Badge key={feature} variant="secondary">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Benefits
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {activeService.benefits.map((benefit) => (
                                <Badge key={benefit} variant="outline">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button className="w-full md:w-auto mt-3 bg-gradient-primary">
                          <CarTaxiFront className="w-4 h-4 mr-2" />
                          {activeService.commingSoon ? "Coming Soon" : "Book Now"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          <div className="text-center mb-16 mt-12">
            <h2 className="text-4xl font-bold text-center mb-3">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Experience sustainable mobility in 4 simple steps. From booking to
              destination, we've made electric rides effortless and efficient.
            </p>
          </div>

          {/* New How It Works Layout */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-20 ">
            {mainSteps.map((step, index) => (
              <div key={step.step} className="flex-1 max-w-xs text-center">
                <div className="relative flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-surface rounded-2xl flex items-center justify-center border border-accent relative z-10 shadow-lg">
                    <step.icon className="w-12 h-12 text-primary" />
                  </div>
                  {index < mainSteps.length - 1 && (
                    <div className="absolute top-1/2 left-full -translate-y-1/2 transform translate-x-1/2 hidden md:block">
                      <ArrowRight className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose SDM E-Mobility?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={feature.title} className="glass glass-hover p-6 text-center card-hover-lift charging-animation" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="p-4 rounded-full bg-gradient-primary w-16 h-16 mx-auto mb-4 electric-glow">
                    <feature.icon className="w-8 h-8 text-white mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <Card className="glass p-8 mt-16 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-4">
              Flexible Payment Options
            </h3>
            <p className="text-muted-foreground mb-6">
              Pay minimum 20% upfront to confirm your booking. Multiple payment
              methods accepted including UPI, cards, wallets, and cash.
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="secondary">UPI</Badge>
              <Badge variant="secondary">Credit/Debit Cards</Badge>
              <Badge variant="secondary">Digital Wallets</Badge>
              <Badge variant="secondary">Cash Payment</Badge>
            </div>
          </Card>

          {/* Get Started CTA */}
          <Card className="glass p-8 text-center">
            <Zap className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="text-3xl font-bold mb-4">
              Ready to Experience Electric Mobility?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied riders who have made the switch to
              sustainable transportation. Book your first electric ride today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary h-14 px-8 btn-electric energy-flow">
                <MapPin className="w-5 h-5 mr-2" />
                Book Your First Ride
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 btn-electric hover:bg-primary/5">
                <Smartphone className="w-5 h-5 mr-2" />
                Download Mobile App
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;
