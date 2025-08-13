import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Copy, MessageSquare, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

interface TripSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: {
    id: string;
    pickup_address: string;
    dropoff_address: string;
    status: string;
    created_at: string;
    driver_id?: string;
  };
  driver?: {
    full_name: string;
    phone_no: string;
  };
}

export function TripSharingModal({ isOpen, onClose, booking, driver }: TripSharingModalProps) {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [message, setMessage] = useState("");

  if (!booking) return null;

  const shareUrl = `${window.location.origin}/trip-share/${booking.id}`;
  
  const defaultMessage = `🚗 Trip Update: I'm currently on a ride
  
📍 From: ${booking.pickup_address}
📍 To: ${booking.dropoff_address}
🕒 Started: ${new Date(booking.created_at).toLocaleString()}
📱 Status: ${booking.status}
${driver ? `👨‍💼 Driver: ${driver.full_name} (${driver.phone_no})` : ''}

Track my trip: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Trip link copied to clipboard!");
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(message || defaultMessage);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSMSShare = () => {
    if (!contactPhone) {
      toast.error("Please enter a phone number");
      return;
    }
    const text = encodeURIComponent(message || defaultMessage);
    const smsUrl = `sms:${contactPhone}?body=${text}`;
    window.open(smsUrl);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Trip Update - Live Location Sharing");
    const body = encodeURIComponent(message || defaultMessage);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Trip Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trip Info */}
          <Card className="glass">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">From:</span>
                  <p className="font-medium">{booking.pickup_address}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">To:</span>
                  <p className="font-medium">{booking.dropoff_address}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-medium capitalize">{booking.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Link */}
          <div className="space-y-2">
            <Label>Trip Tracking Link</Label>
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="text-sm"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                placeholder="Enter name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number</Label>
              <Input
                id="contactPhone"
                placeholder="+91 XXXXX XXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder={defaultMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              onClick={handleWhatsAppShare}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSMSShare}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Phone className="w-5 h-5 text-blue-600" />
              <span className="text-xs">SMS</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleEmailShare}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Mail className="w-5 h-5 text-red-600" />
              <span className="text-xs">Email</span>
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}