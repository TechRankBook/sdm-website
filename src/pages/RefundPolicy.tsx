import { Header } from "@/components/Header"; 
import { useState } from "react"; 
import { Card } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge"; 
import {  
  FileText,  
  CreditCard, 
  AlertTriangle, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Plane, 
  Coins 
} from "lucide-react"; 
 
const RefundPolicy = () => { 
  const [isDarkMode, setIsDarkMode] = useState(false); 
 
  const toggleDarkMode = () => { 
    setIsDarkMode(!isDarkMode); 
    document.documentElement.classList.toggle('dark'); 
  }; 
 
  const sections = [ 
    { 
      title: "Refund and Cancellation Policy", 
      icon: FileText, 
      content: [ 
        `At SDM E-Mobility Services Pvt Ltd, we strive to provide the 
best cab rental, taxi services, outstation, and airport transfer 
experiences to our customers. This Refund and Cancellation Policy 
outlines the terms under which bookings can be canceled and refunds 
can be processed.` 
      ] 
    }, 
    { 
      title: "1. Cancellation Policy", 
      icon: AlertTriangle, 
      content: [ 
        `**1.1 Cab Rental and Taxi Services**`, 
        `**Cancellation by Customer**`, 
        `If a booking is canceled more than 24 hours before the 
scheduled pick-up time, no cancellation fee will be charged, and a 
full refund will be issued.`, 
        `If a booking is canceled between 12 and 24 hours before the 
scheduled pick-up time, a cancellation fee of 25% of the booking 
amount will be charged.`, 
        `If a booking is canceled within 12 hours of the scheduled 
pick-up time, a cancellation fee of 50% of the booking amount will be 
charged.`, 
        `No refund will be issued for cancellations made less than 2 
hours before the scheduled pick-up time or in case of a no-show.`, 
        `**Cancellation by SDM E-Mobility Services Pvt Ltd**`, 
        `In the unlikely event that we need to cancel a booking, the 
customer will receive a full refund. Additionally, we will make every 
effort to provide an alternative vehicle at no additional cost.` 
      ] 
    }, 
    { 
      title: "1.2 Outstation Services", 
      icon: Car, 
      content: [ 
        `**Cancellation by Customer**`, 
        `If a booking is canceled more than 48 hours before the 
scheduled departure time, no cancellation fee will be charged, and a 
full refund will be issued.`, 
        `If a booking is canceled between 24 and 48 hours before the 
scheduled departure time, a cancellation fee of 25% of the booking 
amount will be charged.`, 
        `If a booking is canceled within 24 hours of the scheduled 
departure time, a cancellation fee of 50% of the booking amount will 
be charged.`, 
        `No refund will be issued for cancellations made less than 4 
hours before the scheduled departure time or in case of a no-show.`, 
        `**Cancellation by SDM E-Mobility Services Pvt Ltd**`, 
        `In the unlikely event that we need to cancel a booking, the 
customer will receive a full refund. Additionally, we will make every 
effort to provide an alternative vehicle at no additional cost.` 
      ] 
    }, 
    { 
      title: "1.3 Airport Transfers", 
      icon: Plane, 
      content: [ 
        `**Cancellation by Customer**`, 
        `If a booking is canceled more than 12 hours before the 
scheduled pick-up time, no cancellation fee will be charged, and a 
full refund will be issued.`, 
        `If a booking is canceled between 6 and 12 hours before the 
scheduled pick-up time, a cancellation fee of 25% of the booking 
amount will be charged.`, 
        `If a booking is canceled within 6 hours of the scheduled 
pick-up time, a cancellation fee of 50% of the booking amount will be 
charged.`, 
        `No refund will be issued for cancellations made less than 2 
hours before the scheduled pick-up time or in case of a no-show.`, 
        `**Cancellation by SDM E-Mobility Services Pvt Ltd**`, 
        `In the unlikely event that we need to cancel a booking, the 
customer will receive a full refund. Additionally, we will make every 
effort to provide an alternative vehicle at no additional cost.` 
      ] 
    }, 
    { 
      title: "2. Refund Policy", 
      icon: CreditCard, 
      content: [ 
        `**2.1 Refund Process**`, 
        `All refunds will be processed within 7-10 business days from 
the date of cancellation.`, 
        `Refunds will be credited back to the original payment method 
used at the time of booking.`, 
        `**2.2 Non-Refundable Cases**`, 
        `No refund will be issued for cancellations made outside the 
stipulated time frames mentioned above.`, 
        `No refund will be issued in case of a no-show.`, 
        `No refund will be issued if the cancellation is due to a 
force majeure event (such as natural disasters, acts of God, strikes, 
etc.).`, 
        `**2.3 Partial Refunds**`, 
        `In cases where a partial journey has been completed before 
cancellation, a pro-rated refund may be issued based on the distance 
traveled and the time elapsed.` 
      ] 
    }, 
    { 
      title: "3. Amendments to Booking", 
      icon: Clock, 
      content: [ 
        `Any amendments to the booking (change in date, time, 
destination, etc.) will be subject to availability and may incur 
additional charges. Please contact our customer service team at least 
24 hours in advance for any amendments.` 
      ] 
    } 
  ]; 
 
  const renderContent = (content) => { 
    return content.map((item, itemIndex) => ( 
      <div key={itemIndex} className="flex gap-3"> 
        <div className="w-2 h-2 bg-primary rounded-full mt-2 
flex-shrink-0"></div> 
        {/* Render markdown-like bold text */} 
        <p className="text-muted-foreground" 
dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, 
'<strong>$1</strong>') }}></p> 
      </div> 
    )); 
  }; 
 
  return ( 
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}> 
      <div className="min-h-screen bg-gradient-main text-foreground"> 
        <Header isDarkMode={isDarkMode} 
toggleDarkMode={toggleDarkMode} /> 
         
        <div className="container mx-auto px-4 py-20"> 
          {/* Hero Section */} 
          <div className="text-center mb-16"> 
            <h1 className="text-5xl md:text-6xl font-bold mb-6 
gradient-text"> 
              Refund and Cancellation Policy 
            </h1> 
            <p className="text-xl text-muted-foreground max-w-3xl 
mx-auto"> 
              Please read this policy carefully. It outlines the terms 
for canceling bookings and receiving refunds. 
            </p> 
            <Badge variant="secondary" className="mt-4"> 
              Effective Date: 1st September 2023 
            </Badge> 
          </div> 
 
          {/* Policy Sections */} 
          <div className="space-y-8 mb-16"> 
            {sections.map((section, index) => ( 
              <Card key={section.title} className="glass p-8"> 
                <div className="flex items-center gap-4 mb-6"> 
                  <div className="w-12 h-12 bg-gradient-primary 
rounded-xl flex items-center justify-center"> 
                    <section.icon className="w-6 h-6 text-white" /> 
                  </div> 
                  <h2 className="text-2xl 
font-bold">{section.title}</h2> 
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
              For any questions or assistance regarding our Refund and 
Cancellation Policy, please contact our customer service team: 
            </p> 
            <div className="space-y-2"> 
              <p className="flex items-center justify-center gap-2"> 
                <Mail className="w-4 h-4 text-primary" /> 
                <strong>Email:</strong> support@sdme-mobility.com 
              </p> 
              <p className="flex items-center justify-center gap-2"> 
                <Phone className="w-4 h-4 text-primary" /> 
                <strong>Phone:</strong> +91- 99009 92290 
              </p> 
              <p className="flex items-center justify-center gap-2 
text-center"> 
                <MapPin className="w-4 h-4 text-primary" /> 
                <strong>Address:</strong> SDM E-Mobility Services Pvt 
Ltd, 2nd Floor, 4, 1st Cross Rd, 2nd Phase, Gokula 1st Stage, 
Mathikere, Bengaluru, Karnataka 560054 
              </p> 
            </div> 
             <div className="flex justify-center gap-6 text-sm text-muted-foreground mt-3">
              <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</a>
              <a href="/contact" className="hover:text-primary transition-colors">Contact Us</a>
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
 
export default RefundPolicy; 
 