import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Car, Clock, User, Phone, CreditCard, Calendar, IndianRupee } from "lucide-react";

interface TripDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

interface BookingDetails {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  scheduled_time: string;
  start_time: string;
  end_time: string;
  vehicle_type: string;
  service_type: string;
  trip_type: string;
  passengers: number;
  advance_amount: number;
  remaining_amount: number;
  special_instructions: string;
  distance_km: number;
  waiting_time_minutes: number;
  driver: {
    full_name: string;
    phone_no: string;
    license_number: string;
    rating: number;
  } | null;
  vehicle: {
    model: string;
    license_plate: string;
    color: string;
  } | null;
  payment: {
    transaction_id: string;
    razorpay_payment_id: string;
    gateway_response: any;
  } | null;
}

export const TripDetailsModal = ({ isOpen, onClose, bookingId }: TripDetailsModalProps) => {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
    }
  }, [isOpen, bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      let driverData = null;
      let vehicleData = null;
      let paymentData = null;

      // Fetch driver details if available
      if (bookingData.driver_id) {
        const { data: driverInfo, error: driverError } = await supabase
          .from('users')
          .select('full_name, phone_no')
          .eq('id', bookingData.driver_id)
          .single();

        const { data: driverDetails, error: driverDetailsError } = await supabase
          .from('drivers')
          .select('license_number, rating')
          .eq('id', bookingData.driver_id)
          .single();

        if (!driverError && !driverDetailsError) {
          driverData = {
            ...driverInfo,
            ...driverDetails
          };
        }
      }

      // Fetch vehicle details if available
      if (bookingData.vehicle_id) {
        const { data: vehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .select('model, license_plate, color')
          .eq('id', bookingData.vehicle_id)
          .single();

        if (!vehicleError) {
          vehicleData = vehicle;
        }
      }

      // Fetch payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('transaction_id, razorpay_payment_id, gateway_response')
        .eq('booking_id', bookingId)
        .single();

      if (!paymentError) {
        paymentData = payment;
      }

      setBooking({
        ...bookingData,
        driver: driverData,
        vehicle: vehicleData,
        payment: paymentData
      });
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'started':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTripDuration = () => {
    if (!booking?.start_time || !booking?.end_time) return null;
    const duration = new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime();
    return Math.round(duration / (1000 * 60)); // minutes
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!booking) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Trip details not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Trip Details</span>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Trip Information
            </h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium capitalize">{booking.service_type?.replace('_', ' ') || 'Standard'}</p>
                </div>
                {booking.trip_type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Trip Type</p>
                    <p className="font-medium capitalize">{booking.trip_type}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Location</p>
                  <p className="font-medium">{booking.pickup_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Drop-off Location</p>
                  <p className="font-medium">{booking.dropoff_address}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Time</p>
                    <p className="text-sm font-medium">{formatDateTime(booking.created_at)}</p>
                  </div>
                </div>
                {booking.scheduled_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Scheduled Time</p>
                      <p className="text-sm font-medium">{formatDateTime(booking.scheduled_time)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Passengers</p>
                    <p className="text-sm font-medium">{booking.passengers || 1}</p>
                  </div>
                </div>
                {booking.start_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Trip Duration</p>
                      <p className="text-sm font-medium">
                        {calculateTripDuration() ? `${calculateTripDuration()} mins` : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Vehicle & Driver Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Vehicle & Driver
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Type</p>
                  <p className="font-medium">{booking.vehicle_type || 'Standard'}</p>
                </div>
              </div>
              
              {booking.vehicle && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Model</p>
                    <p className="text-sm font-medium">{booking.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">License Plate</p>
                    <p className="text-sm font-medium font-mono">{booking.vehicle.license_plate}</p>
                  </div>
                </div>
              )}

              {booking.driver && (
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Driver</p>
                      <p className="font-medium">{booking.driver.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rating: {booking.driver.rating}/5.0
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="text-sm font-medium">{booking.driver.phone_no}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Payment Details & Fare Breakdown
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Fare</p>
                  <p className="text-lg font-bold">₹{booking.fare_amount}</p>
                </div>
              </div>
              
              {(booking.advance_amount || booking.remaining_amount) && (
                <div className="grid grid-cols-2 gap-4">
                  {booking.advance_amount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Advance Paid</p>
                      <p className="text-sm font-medium text-green-600">₹{booking.advance_amount}</p>
                    </div>
                  )}
                  {booking.remaining_amount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining Amount</p>
                      <p className="text-sm font-medium text-orange-600">₹{booking.remaining_amount}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="text-sm font-medium capitalize">
                      {booking.payment_method || 'Not specified'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge variant="outline" className="text-xs">
                    {booking.payment_status}
                  </Badge>
                </div>
              </div>
              
              {booking.payment?.transaction_id && (
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {booking.payment.transaction_id}
                  </p>
                </div>
              )}

              {booking.distance_km && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="text-sm font-medium">{booking.distance_km} km</p>
                  </div>
                  {booking.waiting_time_minutes > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Waiting Time</p>
                      <p className="text-sm font-medium">{booking.waiting_time_minutes} mins</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {booking.special_instructions && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Special Instructions
                </h3>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {booking.special_instructions}
                </p>
              </div>
            </>
          )}

          <div className="text-center text-xs text-muted-foreground">
            Trip ID: {booking.id}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};