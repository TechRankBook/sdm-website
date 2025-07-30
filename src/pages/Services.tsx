import { Header } from "@/components/Header";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Plane, 
  RotateCcw, 
  Route, 
  Users, 
  Clock, 
  Calendar,
  Zap,
  Shield,
  MapPin,
  CreditCard
} from "lucide-react";

const Services = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const services = [
    {
      id: "city",
      name: "City Ride",
      icon: Car,
      price: "₹8/km",
      time: "3 min",
      description: "Quick rides within the city for daily commutes and short trips",
      features: ["100% Electric", "Real-time tracking", "Instant booking", "24/7 available"],
      benefits: ["Zero emissions", "Quiet ride", "Air conditioning", "Safety features"]
    },
    {
      id: "airport",
      name: "Airport Taxi",
      icon: Plane,
      price: "₹12/km",
      time: "5 min",
      description: "Direct airport transfers with flight tracking and luggage assistance",
      features: ["Flight tracking", "Meet & greet", "Luggage space", "Premium vehicles"],
      benefits: ["No waiting", "Professional drivers", "Fixed pricing", "24/7 service"]
    },
    {
      id: "rental",
      name: "Car Rental",
      icon: RotateCcw,
      price: "₹200/hr",
      time: "10 min",
      description: "Hourly car rentals for meetings, shopping, or multiple stops",
      features: ["Self-drive option", "Flexible hours", "Multiple stops", "Driver included"],
      benefits: ["Cost effective", "No parking hassle", "Fuel included", "Insurance covered"]
    },
    {
      id: "outstation",
      name: "Outstation",
      icon: Route,
      price: "₹15/km",
      time: "15 min",
      description: "Long distance travel for weekend getaways and business trips",
      features: ["Driver included", "Round trip", "Overnight stays", "Highway optimized"],
      benefits: ["Comfortable journey", "Multiple destinations", "Rest stops", "Experienced drivers"]
    },
    {
      id: "share",
      name: "Ride Sharing",
      icon: Users,
      price: "₹4/km",
      time: "8 min",
      description: "Share rides with other passengers for budget-friendly travel",
      features: ["Budget-friendly", "Route matching", "Safe co-passengers", "Environmental"],
      benefits: ["50% cost savings", "Social travel", "Reduced traffic", "Carbon neutral"]
    }
  ];

  const timingOptions = [
    {
      type: "now",
      title: "Ride Now",
      icon: Zap,
      description: "Get a ride instantly within minutes",
      features: ["Immediate pickup", "Real-time tracking", "Quick booking"]
    },
    {
      type: "later",
      title: "Schedule for Later",
      icon: Calendar,
      description: "Book your ride in advance up to 30 days",
      features: ["Pre-planned trips", "Guaranteed availability", "Advance payment"]
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-main text-foreground">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Our Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience sustainable mobility with our comprehensive range of electric ride services. 
              From quick city rides to long-distance travel, we've got you covered.
            </p>
          </div>

          {/* Timing Options */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Ride Timing Options</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {timingOptions.map((option) => (
                <Card key={option.type} className="glass p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-2xl bg-gradient-primary">
                      <option.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{option.title}</h3>
                  <p className="text-muted-foreground mb-6">{option.description}</p>
                  <div className="space-y-2">
                    {option.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="mr-2">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-center">Available Services</h2>
            {services.map((service, index) => (
              <Card key={service.id} className={`glass p-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} md:flex items-center gap-8`}>
                <div className="md:w-1/2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-primary">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold">{service.name}</h3>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="text-2xl font-bold text-primary">{service.price}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.time} ETA
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-6">{service.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Key Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {service.features.map((feature) => (
                          <Badge key={feature} variant="secondary">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Benefits
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {service.benefits.map((benefit) => (
                          <Badge key={benefit} variant="outline">{benefit}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full md:w-auto mt-6 bg-gradient-primary">
                    <MapPin className="w-4 h-4 mr-2" />
                    Book {service.name}
                  </Button>
                </div>
                
                <div className="md:w-1/2 mt-8 md:mt-0">
                  <div className="aspect-video rounded-2xl bg-gradient-surface flex items-center justify-center">
                    <service.icon className="w-24 h-24 text-primary opacity-50" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Payment Info */}
          <Card className="glass p-8 mt-16 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-4">Flexible Payment Options</h3>
            <p className="text-muted-foreground mb-6">
              Pay minimum 20% upfront to confirm your booking. Multiple payment methods accepted including 
              UPI, cards, wallets, and cash.
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="secondary">UPI</Badge>
              <Badge variant="secondary">Credit/Debit Cards</Badge>
              <Badge variant="secondary">Digital Wallets</Badge>
              <Badge variant="secondary">Cash Payment</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;