import { Header } from "@/components/Header";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Car,
  CreditCard,
  Eye,
  Smartphone,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Navigation,
  Star,
  Plus, // Add Plus icon for the first step
} from "lucide-react";

const HowItWorks = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const mainSteps = [
    {
      step: "01",
      title: "Select a Service",
      description: "Choose from our range of electric mobility services based on your needs",
      icon: Plus, // Use Plus icon for the first step
        details: [
          "Ride Later - Schedule advance rides",
          "Airport Taxi - Direct transfers",
          "Car Rental - Hourly bookings",
        "Outstation - Long distance travel",
        "Ride Sharing - Budget-friendly option"
      ],
      tips: "Select 'Ride Now' for immediate pickup or 'Schedule for Later' for advance booking"
    },
    {
      step: "02",
      title: "Choose a Ride Type",
      description: "Pick your preferred electric vehicle and configure your ride preferences",
      icon: Car,
      details: [
        "Select vehicle type (Hatchback, Sedan, SUV)",
        "Choose seating capacity",
        "Set pickup and drop-off locations",
        "Add any special requirements",
        "Confirm ride timing"
      ],
      tips: "All our vehicles are 100% electric with GPS tracking and safety features"
    },
    {
      step: "03",
      title: "Pay (Min 20% Upfront)",
      description: "Secure your booking with flexible payment options and transparent pricing",
      icon: CreditCard,
      details: [
        "Pay minimum 20% to confirm booking",
        "Choose from UPI, Cards, Wallets, Cash",
        "Get instant booking confirmation",
        "Receive driver and vehicle details",
        "Track payment history in app"
      ],
      tips: "Remaining amount can be paid after the ride completion"
    },
    {
      step: "04",
      title: "Track and Ride",
      description: "Enjoy real-time tracking, safe journey, and comfortable electric ride experience",
      icon: Eye,
      details: [
        "Real-time driver location tracking",
        "Live ETA updates and notifications",
        "Direct communication with driver",
        "In-ride safety features and support",
        "Rate and review after completion"
      ],
      tips: "Emergency contacts and live ride sharing available for added safety"
    }
  ];

  const features = [
    {
      icon: Smartphone,
      title: "Easy Mobile App",
      description: "User-friendly interface for seamless booking experience"
    },
    {
      icon: Clock,
      title: "Quick Response",
      description: "Average pickup time of 3-8 minutes depending on service"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Background-verified drivers and real-time safety monitoring"
    },
    {
      icon: Zap,
      title: "100% Electric",
      description: "Zero emission rides with modern electric vehicles"
    },
    {
      icon: Navigation,
      title: "Smart Routing",
      description: "AI-optimized routes for faster and efficient travel"
    },
    {
      icon: Star,
      title: "Quality Service",
      description: "4.8-star average rating with professional drivers"
    }
  ];

  const paymentMethods = [
    { name: "UPI", desc: "Instant and secure" },
    { name: "Credit/Debit Cards", desc: "All major cards accepted" },
    { name: "Digital Wallets", desc: "Paytm, PhonePe, Google Pay" },
    { name: "Cash", desc: "Pay driver directly" }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-main text-foreground">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-center mb-3">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Experience sustainable mobility in 4 simple steps. From booking to destination,
              we've made electric rides effortless and efficient.
            </p>
          </div>

          {/* New How It Works Layout */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-20">
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
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose SDM E-Mobility?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="glass p-6 text-center">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <Card className="glass p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Payment Options</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paymentMethods.map((method) => (
                <div key={method.name} className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">{method.name}</h3>
                  <p className="text-sm text-muted-foreground">{method.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Minimum 20% advance payment required
              </Badge>
            </div>
          </Card>

          {/* Get Started CTA */}
          <Card className="glass p-8 text-center">
            <Zap className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="text-3xl font-bold mb-4">Ready to Experience Electric Mobility?</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied riders who have made the switch to sustainable transportation.
              Book your first electric ride today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary h-14 px-8">
                <MapPin className="w-5 h-5 mr-2" />
                Book Your First Ride
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8">
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

export default HowItWorks;
// import { Header } from "@/components/Header";
// import { useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { 
//   MapPin, 
//   Car, 
//   CreditCard, 
//   Eye, 
//   Smartphone,
//   Clock,
//   CheckCircle,
//   ArrowRight,
//   Zap,
//   Shield,
//   Navigation,
//   Star
// } from "lucide-react";

// const HowItWorks = () => {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   const toggleDarkMode = () => {
//     setIsDarkMode(!isDarkMode);
//     document.documentElement.classList.toggle('dark');
//   };

//   const mainSteps = [
//     {
//       step: "01",
//       title: "Select a Service",
//       description: "Choose from our range of electric mobility services based on your needs",
//       icon: MapPin,
//       details: [
//         "City Ride - Quick urban transport",
//         "Airport Taxi - Direct transfers",
//         "Car Rental - Hourly bookings",
//         "Outstation - Long distance travel",
//         "Ride Sharing - Budget-friendly option"
//       ],
//       tips: "Select 'Ride Now' for immediate pickup or 'Schedule for Later' for advance booking"
//     },
//     {
//       step: "02", 
//       title: "Choose a Ride Type",
//       description: "Pick your preferred electric vehicle and configure your ride preferences",
//       icon: Car,
//       details: [
//         "Select vehicle type (Hatchback, Sedan, SUV)",
//         "Choose seating capacity",
//         "Set pickup and drop-off locations",
//         "Add any special requirements",
//         "Confirm ride timing"
//       ],
//       tips: "All our vehicles are 100% electric with GPS tracking and safety features"
//     },
//     {
//       step: "03",
//       title: "Pay (Min 20% Upfront)",
//       description: "Secure your booking with flexible payment options and transparent pricing",
//       icon: CreditCard,
//       details: [
//         "Pay minimum 20% to confirm booking",
//         "Choose from UPI, Cards, Wallets, Cash",
//         "Get instant booking confirmation",
//         "Receive driver and vehicle details",
//         "Track payment history in app"
//       ],
//       tips: "Remaining amount can be paid after the ride completion"
//     },
//     {
//       step: "04",
//       title: "Track and Ride",
//       description: "Enjoy real-time tracking, safe journey, and comfortable electric ride experience",
//       icon: Eye,
//       details: [
//         "Real-time driver location tracking",
//         "Live ETA updates and notifications",
//         "Direct communication with driver",
//         "In-ride safety features and support",
//         "Rate and review after completion"
//       ],
//       tips: "Emergency contacts and live ride sharing available for added safety"
//     }
//   ];

//   const features = [
//     {
//       icon: Smartphone,
//       title: "Easy Mobile App",
//       description: "User-friendly interface for seamless booking experience"
//     },
//     {
//       icon: Clock,
//       title: "Quick Response",
//       description: "Average pickup time of 3-8 minutes depending on service"
//     },
//     {
//       icon: Shield,
//       title: "Safety First",
//       description: "Background-verified drivers and real-time safety monitoring"
//     },
//     {
//       icon: Zap,
//       title: "100% Electric",
//       description: "Zero emission rides with modern electric vehicles"
//     },
//     {
//       icon: Navigation,
//       title: "Smart Routing",
//       description: "AI-optimized routes for faster and efficient travel"
//     },
//     {
//       icon: Star,
//       title: "Quality Service",
//       description: "4.8-star average rating with professional drivers"
//     }
//   ];

//   const paymentMethods = [
//     { name: "UPI", desc: "Instant and secure" },
//     { name: "Credit/Debit Cards", desc: "All major cards accepted" },
//     { name: "Digital Wallets", desc: "Paytm, PhonePe, Google Pay" },
//     { name: "Cash", desc: "Pay driver directly" }
//   ];

//   return (
//     <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
//       <div className="min-h-screen bg-gradient-main text-foreground">
//         <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
//         <div className="container mx-auto px-4 py-20">
//           {/* Hero Section */}
//           <div className="text-center mb-16">
//             <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
//               How It Works
//             </h1>
//             <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
//               Experience sustainable mobility in 4 simple steps. From booking to destination, 
//               we've made electric rides effortless and efficient.
//             </p>
//           </div>

//           {/* Main Process Steps */}
//           <div className="space-y-12 mb-20">
//             {mainSteps.map((step, index) => (
//               <Card key={step.step} className={`glass p-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} md:flex items-center gap-8`}>
//                 <div className="md:w-1/2">
//                   <div className="flex items-center gap-4 mb-6">
//                     <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
//                       <span className="text-white font-bold text-xl">{step.step}</span>
//                     </div>
//                     <div>
//                       <h3 className="text-3xl font-bold">{step.title}</h3>
//                       <p className="text-muted-foreground">{step.description}</p>
//                     </div>
//                   </div>

//                   <div className="space-y-4 mb-6">
//                     {step.details.map((detail, idx) => (
//                       <div key={idx} className="flex items-center gap-3">
//                         <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
//                         <span className="text-muted-foreground">{detail}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="bg-gradient-surface p-4 rounded-lg mb-6">
//                     <p className="text-sm">
//                       <strong>💡 Pro Tip:</strong> {step.tips}
//                     </p>
//                   </div>

//                   {index < mainSteps.length - 1 && (
//                     <div className="flex items-center gap-2 text-muted-foreground">
//                       <span>Next Step</span>
//                       <ArrowRight className="w-4 h-4" />
//                     </div>
//                   )}
//                 </div>

//                 <div className="md:w-1/2 mt-8 md:mt-0">
//                   <div className="aspect-square rounded-2xl bg-gradient-surface flex items-center justify-center relative overflow-hidden">
//                     <step.icon className="w-24 h-24 text-primary opacity-30" />
//                     <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>

//           {/* Features Grid */}
//           <div className="mb-16">
//             <h2 className="text-3xl font-bold text-center mb-12">Why Choose SDM E-Mobility?</h2>
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {features.map((feature) => (
//                 <Card key={feature.title} className="glass p-6 text-center">
//                   <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
//                   <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
//                   <p className="text-muted-foreground">{feature.description}</p>
//                 </Card>
//               ))}
//             </div>
//           </div>

//           {/* Payment Methods */}
//           <Card className="glass p-8 mb-16">
//             <h2 className="text-3xl font-bold text-center mb-8">Payment Options</h2>
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {paymentMethods.map((method) => (
//                 <div key={method.name} className="text-center">
//                   <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
//                     <CreditCard className="w-8 h-8 text-white" />
//                   </div>
//                   <h3 className="font-bold mb-2">{method.name}</h3>
//                   <p className="text-sm text-muted-foreground">{method.desc}</p>
//                 </div>
//               ))}
//             </div>
//             <div className="text-center mt-8">
//               <Badge variant="secondary" className="text-lg px-4 py-2">
//                 Minimum 20% advance payment required
//               </Badge>
//             </div>
//           </Card>

//           {/* Booking Timeline */}
//           <Card className="glass p-8 mb-16">
//             <h2 className="text-3xl font-bold text-center mb-8">Typical Booking Timeline</h2>
//             <div className="space-y-6">
//               {[
//                 { time: "0-1 min", action: "Booking & Payment", desc: "Complete booking and pay 20% advance" },
//                 { time: "1-8 min", action: "Driver Assignment", desc: "Driver assigned based on your location and service" },
//                 { time: "3-15 min", action: "Pickup", desc: "Driver arrives at pickup location with vehicle" },
//                 { time: "Duration", action: "Journey", desc: "Comfortable electric ride to your destination" },
//                 { time: "End", action: "Payment & Rating", desc: "Complete payment and rate your experience" }
//               ].map((timeline, index) => (
//                 <div key={index} className="flex items-center gap-4">
//                   <div className="w-20 text-right">
//                     <Badge variant="outline">{timeline.time}</Badge>
//                   </div>
//                   <div className="w-4 h-4 bg-primary rounded-full"></div>
//                   <div className="flex-1">
//                     <h4 className="font-semibold">{timeline.action}</h4>
//                     <p className="text-sm text-muted-foreground">{timeline.desc}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>

//           {/* Get Started CTA */}
//           <Card className="glass p-8 text-center">
//             <Zap className="w-16 h-16 mx-auto mb-6 text-primary" />
//             <h3 className="text-3xl font-bold mb-4">Ready to Experience Electric Mobility?</h3>
//             <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
//               Join thousands of satisfied riders who have made the switch to sustainable transportation. 
//               Book your first electric ride today!
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button size="lg" className="bg-gradient-primary h-14 px-8">
//                 <MapPin className="w-5 h-5 mr-2" />
//                 Book Your First Ride
//               </Button>
//               <Button size="lg" variant="outline" className="h-14 px-8">
//                 <Smartphone className="w-5 h-5 mr-2" />
//                 Download Mobile App
//               </Button>
//             </div>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HowItWorks;


