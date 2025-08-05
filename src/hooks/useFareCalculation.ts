import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FareCalculation {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  totalFare: number;
  estimatedTime: string;
  distance: string;
}

interface UseFareCalculationProps {
  serviceType: string;
  vehicleType: string;
  distanceKm?: number;
  durationMinutes?: number;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
}

export const useFareCalculation = ({
  serviceType,
  vehicleType,
  distanceKm = 0,
  durationMinutes = 0,
}: UseFareCalculationProps) => {
  const [fareData, setFareData] = useState<FareCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFare = async () => {
    if (!serviceType || !vehicleType) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get service type ID
      const { data: serviceTypes, error: serviceError } = await supabase
        .from('service_types')
        .select('id')
        .eq('name', serviceType.toLowerCase().replace(' ', '_'))
        .single();

      if (serviceError || !serviceTypes) {
        throw new Error('Service type not found');
      }

      // Get vehicle type ID
      const { data: vehicleTypes, error: vehicleTypeError } = await supabase
        .from('vehicle_types')
        .select('id')
        .eq('name', vehicleType.toLowerCase())
        .single();

      if (vehicleTypeError || !vehicleTypes) {
        throw new Error('Vehicle type not found');
      }

      // Get pricing rules using vehicle_type_id instead of vehicle_type string
      // Use order by effective_from DESC and limit 1 to handle multiple rules
      const { data: pricingRules, error: pricingError } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('service_type_id', serviceTypes.id)
        .eq('vehicle_type_id', vehicleTypes.id)
        .eq('is_active', true)
        .order('effective_from', { ascending: false })
        .limit(1)
        .single();

      if (pricingError || !pricingRules) {
        throw new Error('Pricing rules not found');
      }

      // Calculate fare
      const baseFare = Number(pricingRules.base_fare) || 0;
      const perKmRate = Number(pricingRules.per_km_rate) || 0;
      const perMinuteRate = Number(pricingRules.per_minute_rate) || 0;
      const minimumFare = Number(pricingRules.minimum_fare) || 0;
      const surgeMultiplier = Number(pricingRules.surge_multiplier) || 1;

      let distanceFare = 0;
      let timeFare = 0;

      if (serviceType.toLowerCase() === 'car_rental') {
        // For hourly rentals, use per_minute_rate as hourly rate
        timeFare = (durationMinutes / 60) * perMinuteRate;
        distanceFare = distanceKm * perKmRate;
      } else {
        distanceFare = distanceKm * perKmRate;
        timeFare = durationMinutes * perMinuteRate;
      }

      const subtotal = baseFare + distanceFare + timeFare;
      const totalBeforeSurge = Math.max(subtotal, minimumFare);
      const totalFare = Math.round(totalBeforeSurge * surgeMultiplier);

      const estimatedTime = durationMinutes > 0 
        ? `${Math.round(durationMinutes)} min`
        : '5-10 min';

      const distance = distanceKm > 0 
        ? `${distanceKm.toFixed(1)} km`
        : 'Calculating...';

      setFareData({
        baseFare,
        distanceFare,
        timeFare,
        totalFare,
        estimatedTime,
        distance
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate fare');
      console.error('Fare calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (serviceType && vehicleType) {
      calculateFare();
    }
  }, [serviceType, vehicleType, distanceKm, durationMinutes]);

  return { fareData, isLoading, error, refetch: calculateFare };
};