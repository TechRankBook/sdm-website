import { Header } from "@/components/Header"; 
import { useState } from "react"; 
import { Card } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge"; 
import {  
  FileText,  
  Shield,  
  Users, 
  Locate, 
  Smartphone, 
  Info, 
  Mail, 
  Phone, 
  Link, 
  Lock, 
  Hourglass, 
  Handshake 
} from "lucide-react"; 
 
const PrivacyPolicy = () => { 
  const [isDarkMode, setIsDarkMode] = useState(false); 
 
  const toggleDarkMode = () => { 
    setIsDarkMode(!isDarkMode); 
    document.documentElement.classList.toggle('dark'); 
  }; 
 
  const sections = [ 
    { 
      title: "Privacy Policy", 
      icon: FileText, 
      content: [ 
        `Effective Date: 1st September 2023`, 
        `SDM E-Mobility Services Pvt. Ltd. ("SDM", "we", "us", or 
"our") respects the privacy of our users ("you" or "your"). This 
Privacy Policy describes the types of information we collect from you 
when you use our mobile application ("App") or services (collectively, 
the "Services") and how we use that information.` 
      ] 
    }, 
    { 
      title: "Information We Collect", 
      icon: Users, 
      content: [ 
        `We collect several types of information from and about users 
of our Services:`, 
        `**Personal Information:** This includes information that can 
be used to identify you, such as your name, phone number, email 
address, profile picture, and government-issued identification.`, 
        `**Location Information:** We collect your location 
information when you use the App to request a ride or track your ride 
progress. This information may include your GPS coordinates, IP 
address, and approximate location based on your device's WIFI or cell 
tower signals.`, 
        `**Device Information:** We collect information about the 
device you use to access the Services, such as the device type, 
operating system, unique device identifier, and app version.`, 
        `**Usage Information:** We collect information about how you 
use the Services, such as the type of ride you request, the pick-up 
and drop-off locations, the date and time of your ride, the distance 
traveled, and the fare amount.` 
      ] 
    }, 
    { 
      title: "How We Use Your Information", 
      icon: Info, 
      content: [ 
        `We use the information we collect for the following 
purposes:`, 
        `**To provide and improve the Services:** We use your 
information to provide you with the Services you request, such as 
booking rides, calculating fares, and tracking your ride progress. We 
also use your information to improve the Services by analyzing usage 
patterns and developing new features.`, 
        `**To send you communications:** We may use your contact 
information to send you important information about the Services, such 
as ride confirmations, receipts, and promotional offers.`, 
        `**To comply with the law:** We may use your information to 
comply with applicable laws and regulations, including responding to 
court orders, subpoenas, or law enforcement requests.` 
      ] 
    }, 
    { 
      title: "Sharing Your Information", 
      icon: Handshake, 
      content: [ 
        `We may share your information with third-party service 
providers who help us operate the Services. These service providers 
may be located in countries outside of your own. We will only share 
your information with service providers who have agreed to comply with 
our privacy standards.`, 
        `We may also share your information with third parties in the 
following circumstances:`, 
        `**To comply with the law:** We may share your information to 
comply with applicable laws and regulations, including responding to 
court orders, subpoenas, or law enforcement requests.`, 
        `**To protect our rights:** We may share your information to 
protect our rights, property, or safety, or the rights, property, or 
safety of others.`, 
        `**In a business transfer:** We may share your information in 
connection with a merger, acquisition, or other business transaction.` 
      ] 
    }, 
    { 
      title: "Your Choices", 
      icon: Link, 
      content: [ 
        `You have choices about your information:`, 
        `**Location Information:** You can turn off location services 
on your device. However, this may limit your ability to use certain 
features of the Services.`, 
        `**Promotional Communications:** You can unsubscribe from 
promotional emails by following the instructions in the email.` 
      ] 
    }, 
    { 
      title: "Data Security", 
      icon: Lock, 
      content: [ 
        `We take reasonable steps to protect your information from 
unauthorized access, disclosure, alteration, or destruction. However, 
no internet transmission or electronic storage is ever completely 
secure. We cannot guarantee the security of your information.` 
      ] 
    }, 
    { 
      title: "Children's Privacy", 
      icon: Users, 
      content: [ 
        `Our Services are not intended for children under the age of 
18. We do not knowingly collect information from children under 18. If 
you are a parent or guardian and you believe that your child has 
provided us with information, please contact us.` 
      ] 
    }, 
    { 
      title: "Changes to this Privacy Policy", 
      icon: Hourglass, 
      content: [ 
        `We may update this Privacy Policy from time to time. We will 
notify you of any changes by posting the new Privacy Policy on the App 
or by sending you an email. You are advised to review this Privacy 
Policy periodically for any changes.` 
      ] 
    }, 
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
              Privacy Policy 
            </h1> 
            <p className="text-xl text-muted-foreground max-w-3xl 
mx-auto"> 
              Your privacy is important to us. This policy explains 
how we collect, use, and protect your information. 
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
              If you have any questions about this Privacy Policy, 
please contact us: 
            </p> 
            <div className="space-y-2"> 
              <p className="flex items-center justify-center gap-2"> 
                <Mail className="w-4 h-4 text-primary" /> 
                <strong>Email:</strong> Info@sdm-emobility.com 
              </p> 
              <p className="flex items-center justify-center gap-2"> 
                <Phone className="w-4 h-4 text-primary" /> 
                <strong>Phone:</strong> +91 9900992290 
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
 
export default PrivacyPolicy; 
 