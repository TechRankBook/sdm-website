import { Header } from "@/components/Header";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  CreditCard, 
  Car,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const Terms = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const sections = [
    {
      title: "Service Agreement",
      icon: FileText,
      content: [
        "SDM E-Mobility provides electric vehicle ride services through our mobile application and website.",
        "By using our services, you agree to these terms and conditions.",
        "We reserve the right to modify these terms with prior notice to users.",
        "Services are available 24/7 subject to vehicle availability and operational conditions."
      ]
    },
    {
      title: "Booking & Payment",
      icon: CreditCard,
      content: [
        "Minimum 20% advance payment required to confirm all bookings.",
        "Remaining payment can be made via cash, UPI, cards, or digital wallets.",
        "Cancellation charges apply based on timing: Free within 5 minutes, ₹25 within 15 minutes, ₹50 thereafter.",
        "Refunds for advance payments processed within 5-7 business days.",
        "Pricing may vary based on distance, time, demand, and service type."
      ]
    },
    {
      title: "User Responsibilities",
      icon: Users,
      content: [
        "Provide accurate pickup and drop-off locations.",
        "Be present at pickup location within 5 minutes of driver arrival.",
        "Treat drivers and vehicles with respect and courtesy.",
        "No smoking, illegal substances, or prohibited items in vehicles.",
        "Follow safety guidelines and wear seat belts during the journey.",
        "Report any issues immediately through our support channels."
      ]
    },
    {
      title: "Vehicle & Safety",
      icon: Car,
      content: [
        "All vehicles are 100% electric and regularly maintained for safety.",
        "Drivers are background-verified and trained for professional service.",
        "Real-time GPS tracking available for all rides.",
        "Emergency contact features available within the mobile application.",
        "Vehicle capacity limits must be strictly followed for safety.",
        "Child safety seats available on request for additional charges."
      ]
    },
    {
      title: "Service Limitations",
      icon: AlertTriangle,
      content: [
        "Services subject to availability and operational areas.",
        "We may suspend services during extreme weather conditions.",
        "Ride requests may be declined if driver safety is at risk.",
        "Service interruptions possible due to technical maintenance.",
        "Outstation services require advance booking and route approval.",
        "Airport services may have additional waiting charges during peak hours."
      ]
    },
    {
      title: "Privacy & Data",
      icon: Shield,
      content: [
        "We collect and process personal data as per our Privacy Policy.",
        "Location data used only for service delivery and safety purposes.",
        "Payment information securely processed through encrypted channels.",
        "Trip history maintained for service improvement and support.",
        "Personal data not shared with third parties without consent.",
        "Users can request data deletion as per applicable privacy laws."
      ]
    }
  ];

  const quickPoints = [
    { icon: CheckCircle, text: "20% minimum advance payment required" },
    { icon: CheckCircle, text: "Free cancellation within 5 minutes" },
    { icon: CheckCircle, text: "24/7 customer support available" },
    { icon: CheckCircle, text: "Real-time ride tracking included" },
    { icon: CheckCircle, text: "Background-verified drivers only" },
    { icon: CheckCircle, text: "100% electric vehicle fleet" }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-main text-foreground">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Terms & Conditions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Please read these terms and conditions carefully before using SDM E-Mobility services. 
              Your use of our platform constitutes acceptance of these terms.
            </p>
            <Badge variant="secondary" className="mt-4">
              Last Updated: January 2025
            </Badge>
          </div>

          {/* Quick Reference */}
          <Card className="glass p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              Quick Reference
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <point.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{point.text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-8 mb-16">
            {sections.map((section, index) => (
              <Card key={section.title} className="glass p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Cancellation Policy */}
          <Card className="glass p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Cancellation Policy
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-surface rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">Free</div>
                <p className="text-sm text-muted-foreground">Within 5 minutes of booking</p>
              </div>
              <div className="text-center p-4 bg-gradient-surface rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">₹25</div>
                <p className="text-sm text-muted-foreground">5-15 minutes after booking</p>
              </div>
              <div className="text-center p-4 bg-gradient-surface rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">₹50</div>
                <p className="text-sm text-muted-foreground">After 15 minutes or driver assigned</p>
              </div>
            </div>
          </Card>

          {/* Dispute Resolution */}
          <Card className="glass p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6">Dispute Resolution</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Any disputes arising from the use of SDM E-Mobility services will be resolved through:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-surface rounded-lg">
                  <h3 className="font-semibold mb-2">Step 1: Support</h3>
                  <p className="text-sm text-muted-foreground">Contact our customer support team first</p>
                </div>
                <div className="p-4 bg-gradient-surface rounded-lg">
                  <h3 className="font-semibold mb-2">Step 2: Mediation</h3>
                  <p className="text-sm text-muted-foreground">Internal dispute resolution process</p>
                </div>
                <div className="p-4 bg-gradient-surface rounded-lg">
                  <h3 className="font-semibold mb-2">Step 3: Arbitration</h3>
                  <p className="text-sm text-muted-foreground">Final resolution through arbitration</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="glass p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about these terms and conditions, please contact us:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> legal@sdm-mobility.com</p>
              <p><strong>Phone:</strong> +91 98765 43210</p>
              <p><strong>Address:</strong> SDM E-Mobility HQ, Bangalore, Karnataka, India</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;