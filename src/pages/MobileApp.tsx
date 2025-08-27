import { Header } from "@/components/Header";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Download, 
  Star, 
  MapPin, 
  CreditCard, 
  Eye,
  Shield,
  Zap,
  Users,
  Clock,
  Bell,
  Navigation
} from "lucide-react";

const MobileApp = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const features = [
    {
      icon: MapPin,
      title: "Easy Booking",
      description: "Book rides in seconds with our intuitive interface"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Multiple payment options with 20% advance booking"
    },
    {
      icon: Eye,
      title: "Real-time Tracking",
      description: "Track your ride and driver location in real-time"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Emergency contact, ride sharing, and safety features"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get updates on booking, driver arrival, and trip status"
    },
    {
      icon: Navigation,
      title: "GPS Navigation",
      description: "Precise pickup and drop-off with optimized routes"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Select Service",
      description: "Choose from Ride Later, Airport Taxi, Outstation, Car Rental, or Ride Sharing",
      icon: MapPin
    },
    {
      step: "2",
      title: "Choose Ride Type",
      description: "Pick your preferred vehicle and select 'Ride Now' or 'Schedule for Later'",
      icon: Smartphone
    },
    {
      step: "3",
      title: "Pay & Confirm",
      description: "Pay minimum 20% upfront to confirm your booking with multiple payment options",
      icon: CreditCard
    },
    {
      step: "4",
      title: "Track & Ride",
      description: "Track your driver in real-time and enjoy your comfortable electric ride",
      icon: Eye
    }
  ];

  const stats = [
    { label: "App Downloads", value: "100K+", icon: Download },
    { label: "User Rating", value: "4.8★", icon: Star },
    { label: "Daily Rides", value: "2000+", icon: Users },
    { label: "Cities", value: "25+", icon: MapPin }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-main text-foreground">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              SDM E-Mobility App
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Experience seamless electric mobility at your fingertips. Book, pay, track, and ride 
              with the most advanced electric cab booking app.
            </p>
            
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary h-14 px-8">
                <Download className="w-5 h-5 mr-2" />
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8">
                <Download className="w-5 h-5 mr-2" />
                Download for Android
              </Button>
            </div>
          </div>

          {/* App Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat) => (
              <Card key={stat.label} className="glass p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => (
                <Card key={step.step} className="glass p-6 text-center relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                  </div>
                  <div className="mt-4">
                    <step.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* App Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">App Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="glass p-6">
                  <feature.icon className="w-10 h-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Screenshots Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">App Screenshots</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((index) => (
                <Card key={index} className="glass p-4">
                  <div className="aspect-[9/16] rounded-lg bg-gradient-surface flex items-center justify-center">
                    <Smartphone className="w-16 h-16 text-primary opacity-50" />
                  </div>
                  <div className="text-center mt-4">
                    <Badge variant="secondary">
                      {index === 1 ? "Booking Interface" : index === 2 ? "Ride Tracking" : "Payment Options"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* User Reviews */}
          <Card className="glass p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">What Users Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Priya Sharma",
                  rating: 5,
                  review: "Amazing app! Super easy to book rides and the electric cars are so quiet and comfortable."
                },
                {
                  name: "Rahul Patel",
                  rating: 5,
                  review: "Love the real-time tracking feature. Never have to wonder where my ride is anymore."
                },
                {
                  name: "Anita Mehta",
                  rating: 5,
                  review: "Great for airport trips. The drivers are professional and the cars are always clean."
                }
              ].map((review, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{review.review}"</p>
                  <p className="font-semibold">{review.name}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Download CTA */}
          <Card className="glass p-8 text-center">
            <Smartphone className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have switched to sustainable electric mobility. 
              Download the app now and get your first ride discount!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary h-14 px-8">
                <Download className="w-5 h-5 mr-2" />
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8">
                <Download className="w-5 h-5 mr-2" />
                Download for Android
              </Button>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <Badge variant="secondary">First Ride 20% Off</Badge>
              <Badge variant="secondary">Free Installation</Badge>
              <Badge variant="secondary">24/7 Support</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;