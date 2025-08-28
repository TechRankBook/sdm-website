import { Header } from "@/components/Header";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  Headphones,
  Shield,
  Zap,
  HelpCircle,
} from "lucide-react";

const Contact = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general",
    message: "",
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 9844663345"],
      description: "24/7 Support Available",
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@sdmemobility.com"],
      description: "We respond within 2 hours",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: [
        "No 1, 1st Floor, Dhanyan Manor, Udayaravi Road, Kuvempu Nagar",
        "Mysore, Karnataka-570023",
      ],
      description: "Mon-Sat: 9 AM - 6 PM",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      details: ["+91 9844663345"],
      description: "Quick support via WhatsApp",
    },
  ];

  const supportCategories = [
    { value: "general", label: "General Inquiry" },
    { value: "booking", label: "Booking Issues" },
    { value: "payment", label: "Payment Problems" },
    { value: "technical", label: "Technical Support" },
    { value: "feedback", label: "Feedback & Suggestions" },
    { value: "partnership", label: "Partnership Opportunities" },
  ];

  const faqItems = [
    {
      question: "How do I book a ride?",
      answer:
        "You can book through our mobile app or website. Select your service, choose vehicle, pay 20% advance, and track your ride.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept UPI, credit/debit cards, digital wallets (Paytm, PhonePe, Google Pay), and cash payments.",
    },
    {
      question: "How much advance payment is required?",
      answer:
        "A minimum of 20% advance payment is required to confirm your booking. The remaining amount can be paid after the ride.",
    },
    {
      question: "Are all vehicles electric?",
      answer:
        "Yes, our entire fleet is 100% electric, ensuring zero emissions and a quieter, more comfortable ride experience.",
    },
    {
      question: "Can I schedule rides in advance?",
      answer:
        "Yes, you can schedule rides up to 30 days in advance using the 'Schedule for Later' option in our app.",
    },
    {
      question: "What if I need to cancel my ride?",
      answer:
        "You can cancel rides through the app. Cancellation charges may apply based on timing and our cancellation policy.",
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-main text-foreground">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <div className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Contact & Support
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Need help or have questions? We're here to assist you 24/7. Reach
              out through any of our support channels.
            </p>
          </div>

          {/* Quick Stats
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { label: "Response Time", value: "< 2 hrs", icon: Clock },
              { label: "Support Channels", value: "4+", icon: Headphones },
              { label: "Resolution Rate", value: "98%", icon: Shield },
              { label: "Satisfaction", value: "4.9★", icon: Zap },
            ].map((stat) => (
              <Card key={stat.label} className="glass p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div> */}

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info) => (
              <Card key={info.title} className="glass p-6 text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{info.title}</h3>
                {info.details.map((detail, index) => (
                  <p key={index} className="text-muted-foreground mb-1">
                    {detail}
                  </p>
                ))}
                <Badge variant="secondary" className="mt-2">
                  {info.description}
                </Badge>
              </Card>
            ))}
          </div>
          {/* Office Location Map */}
          <Card className="glass p-8 mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-8 h-8 text-primary" />
              Our Location
            </h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Visit Our Office</h3>
                <p className="text-muted-foreground mb-4">
                  No 1, 1st Floor, Dhanyan Manor, Udayaravi Road, Kuvempu Nagar
                  <br />
                  Mysore, Karnataka-570023
                </p>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Mon-Sat: 9 AM - 6 PM</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>+91 9844663345</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>info@sdmemobility.com</span>
                  </p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3898.5647!2d76.6394!3d12.2958!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf70481b3cf5e9%3A0x9c1f8c7e7f1e8b7f!2sKuvempu%20Nagar%2C%20Mysuru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
              </div>
            </div>
          </Card>

          {/* Contact Form and FAQ */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Contact Form */}
            <Card className="glass p-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Send className="w-8 h-8 text-primary" />
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <Input
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="glass-hover"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <Input
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="glass-hover"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="glass-hover"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-background/50 border border-border text-foreground"
                  >
                    {supportCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    placeholder="Describe your issue or inquiry in detail..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="glass-hover min-h-[120px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary h-12"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </Card>

            {/* FAQ Section */}
            <Card className="glass p-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <HelpCircle className="w-8 h-8 text-primary" />
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <div
                    key={index}
                    className="border-b border-glass-border pb-4"
                  >
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-surface rounded-lg">
                <p className="text-sm">
                  <strong>Need immediate help?</strong> Call our 24/7 support
                  line or chat with us on WhatsApp for instant assistance.
                </p>
              </div>
            </Card>
          </div>

          {/* Emergency Support */}
          <Card className="glass p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="text-3xl font-bold mb-4">Emergency Support</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you're experiencing an emergency during your ride or need
              immediate assistance, use our emergency contact options available
              24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="destructive" className="h-14 px-8">
                <Phone className="w-5 h-5 mr-2" />
                Emergency: 112
              </Button>
              <Button size="lg" className="bg-gradient-primary h-14 px-8">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
