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
  CheckCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Terms = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const sections = [
    {
      title: "Terms & Conditions",
      icon: FileText,
      content: [
        `This document outlines the terms and conditions ("Terms") for 
using the services offered by SDM E-Mobility Services Private Limited 
("SDM", "we", "us", or "our"). These Terms govern your use of our 
electric vehicle (EV) rental services, including cab rentals, airport 
transfers, outstation trips, ride later service, and taxi services.`,
      ],
    },
    {
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: [
        `By using our services, booking a ride, or accessing our 
mobile application, you agree to be bound by these Terms. If you do 
not agree to all the Terms, you are not authorized to use our 
services.`,
      ],
    },
    {
      title: "Services Offered",
      icon: Car,
      content: [
        `SDM provides a platform to connect you with eco-friendly 
electric vehicle (EV) transportation options. We offer the following 
services:`,
        `**Cab Rentals:** Book an EV cab for point-to-point travel 
within the city.`,
        `**Airport Transfers:** Pre-book a comfortable and reliable EV 
for your airport arrival or departure.`,
        `**Outstation Trips:** Travel to destinations outside the city 
limits in a spacious and efficient EV.`,
        `**Ride Later Service:** Schedule rides in advance with our 
on-demand EV taxi service.`,
      ],
    },
    {
      title: "Booking and Payment",
      icon: CreditCard,
      content: [
        `Bookings can be made through our mobile application, website, 
or by calling our customer service center. You will be provided with 
fare estimates during the booking process. Fares may vary based on 
distance, duration, service type, and any applicable taxes or fees. We 
accept various payment methods, including online payment gateways, 
debit/credit cards, and cash (subject to availability).`,
      ],
    },
    {
      title: "User Eligibility",
      icon: Users,
      content: [
        `To use our services, you must be at least 18 years old and 
possess a valid government-issued ID. For airport transfers, you may 
be required to provide flight details during booking.`,
      ],
    },
    {
      title: "Rider Conduct",
      icon: Users,
      content: [
        `You are responsible for the conduct of all passengers in the 
vehicle during your ride. Smoking, littering, and consumption of 
alcohol or illegal substances are strictly prohibited within the 
vehicle. We reserve the right to terminate your ride and remove you 
from the vehicle in case of disruptive or abusive behavior.`,
      ],
    },
    {
      title: "Vehicle Availability and Condition",
      icon: Car,
      content: [
        `We strive to provide you with a clean and well-maintained EV 
for your ride. While we make every effort to ensure vehicle 
availability, we cannot guarantee a specific EV model for your 
booking. We reserve the right to substitute a similar EV in case of 
unforeseen circumstances.`,
      ],
    },
    {
      title: "Charging and Range",
      icon: AlertTriangle,
      content: [
        `Our EVs are equipped with long-range batteries. You are not 
responsible for charging the vehicle during your ride. In case of low 
battery, the driver will take the most appropriate route to reach a 
charging station to ensure uninterrupted service.`,
      ],
    },
    {
      title: "Cancellations and Refunds",
      icon: Clock,
      content: [
        `Our cancellation policy is outlined during the booking 
process and may vary depending on the service type and notice period. 
Refunds, if applicable, will be processed in accordance with our 
policy.`,
      ],
    },
    {
      title: "Liability and Indemnification",
      icon: Shield,
      content: [
        `SDM is not liable for any delays, accidents, or damages 
caused by factors beyond our control, including weather conditions, 
traffic congestion, or mechanical breakdowns. We are committed to your 
safety. However, you agree to indemnify and hold harmless SDM from any 
claims, damages, or losses arising from your use of our services.`,
      ],
    },
    {
      title: "Privacy Policy",
      icon: Shield,
      content: [
        `We respect your privacy. Please refer to our separate Privacy 
Policy for details on how we collect, use, and disclose your personal 
information.`,
      ],
    },
    {
      title: "Modifications to Terms",
      icon: FileText,
      content: [
        `We reserve the right to modify these Terms at any time. We 
will notify you of any significant changes by posting the updated 
Terms on our website or mobile application.`,
      ],
    },
    {
      title: "Governing Law and Dispute Resolution",
      icon: Shield,
      content: [
        `These Terms shall be governed by and construed in accordance 
with the laws of India. Any dispute arising out of or relating to 
these Terms shall be subject to the exclusive jurisdiction of the 
courts located in Bengaluru, Mysuru, Karnataka and across India.`,
      ],
    },
  ];

  const renderContent = (content) => {
    return content.map((item, itemIndex) => (
      <div key={itemIndex} className="flex gap-3">
        <div
          className="w-2 h-2 bg-primary rounded-full mt-2 
flex-shrink-0"
        ></div>
        {/* Render markdown-like bold text */}
        <p
          className="text-muted-foreground"
          dangerouslySetInnerHTML={{
            __html: item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
          }}
        ></p>
      </div>
    ));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-main text-foreground morphing-bg ev-particles">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1
              className="text-5xl md:text-6xl font-bold mb-6 
gradient-text"
            >
              Terms & Conditions
            </h1>
            <p
              className="text-xl text-muted-foreground max-w-3xl 
mx-auto"
            >
              Please read these terms and conditions carefully before using SDM
              E-Mobility services. Your use of our platform constitutes
              acceptance of these terms.
            </p>
            <Badge variant="secondary" className="mt-4">
              Last Updated: August 2025
            </Badge>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8 mb-16">
            {sections.map((section, index) => (
              <Card key={section.title} className="glass glass-hover p-8 card-hover-lift charging-animation" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-12 h-12 bg-gradient-primary 
rounded-xl flex items-center justify-center electric-glow"
                  >
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2
                    className="text-2xl 
font-bold"
                  >
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-4">
                  {renderContent(section.content)}
                </div>
              </Card>
            ))}
          </div>

          {/* Contact Information */}
          <Card className="glass p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions regarding these Terms, please contact
              us:
            </p>
            <div className="space-y-2">
              <p className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <strong>Email:</strong> Info@sdmemobility.com
              </p>
              <p className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <strong>Phone:</strong> +91 9844663345
              </p>
              <p className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <strong>Address:</strong> Bengaluru, Mysuru, Karnataka and
                across India
              </p>
            </div>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground mt-3">
              <a
                href="/privacy-policy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a
                href="/refund-policy"
                className="hover:text-primary transition-colors"
              >
                Refund Policy
              </a>
              <a
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Contact Us
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              © 2025 SDM E-Mobility. All rights reserved.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;
