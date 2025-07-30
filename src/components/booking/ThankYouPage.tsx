import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  Car,
  MapPin,
  Phone,
  MessageCircle,
  Home,
  Calendar,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

export const ThankYouPage = () => {
  const bookingId = "SDM" + Math.random().toString(36).substr(2, 8).toUpperCase();
  const estimatedArrival = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card className="glass p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-foreground mb-4">Booking Confirmed!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your ride has been successfully booked. Your driver will arrive shortly.
        </p>

        {/* Booking Details */}
        <Card className="glass-hover p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-foreground mb-4 text-center">Booking Details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Booking ID</span>
              <Badge className="bg-gradient-primary text-white font-mono">{bookingId}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Vehicle Type</span>
              <span className="text-foreground font-medium">Sedan</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estimated Arrival</span>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Clock className="w-4 h-4" />
                {estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge className="bg-green-500 text-white">Driver Assigned</Badge>
            </div>
          </div>
        </Card>

        {/* Driver Information (Simulated) */}
        <Card className="glass-hover p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-foreground mb-4 text-center">Your Driver</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold">RK</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Raj Kumar</h3>
              <p className="text-sm text-muted-foreground">4.8 ⭐ • 1,250+ trips</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Car className="w-4 h-4 text-primary" />
              <span className="text-foreground">White Tata Nexon EV • DL 01 AB 1234</span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Call Driver
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </Card>

        {/* Live Tracking */}
        <Card className="glass-hover p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Live Tracking</h2>
          </div>
          
          <div className="h-40 bg-muted rounded-lg flex items-center justify-center mb-4">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p>Live map will appear here</p>
              <p className="text-sm">Driver is 2.3 km away</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Tracking your driver in real-time</span>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            className="w-full h-12 bg-gradient-primary text-lg font-semibold"
            asChild
          >
            <Link to="/mobile-app">
              Download App for Better Experience
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full h-12" asChild>
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Additional Information */}
        <Card className="glass-hover p-4 mt-8">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">What's Next?</span>
          </div>
          <p className="text-xs text-muted-foreground text-left">
            • Your driver will call you before arrival<br/>
            • Track your ride in real-time<br/>
            • Pay the remaining amount after ride completion<br/>
            • Rate your experience to help us improve
          </p>
        </Card>
      </Card>
    </div>
  );
};