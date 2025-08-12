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
      // Fallback to hardcoded pricing if database tables don't exist
      const pricingFallback = {
        city_ride: {
          Sedan: { baseFare: 50, perKmRate: 12, perMinuteRate: 2, minimumFare: 80 },
          SUV: { baseFare: 70, perKmRate: 15, perMinuteRate: 2.5, minimumFare: 100 },
          Premium: { baseFare: 100, perKmRate: 20, perMinuteRate: 3, minimumFare: 150 }
        },
        airport: {
          Sedan: { baseFare: 100, perKmRate: 15, perMinuteRate: 2, minimumFare: 200 },
          SUV: { baseFare: 150, perKmRate: 18, perMinuteRate: 2.5, minimumFare: 250 },
          Premium: { baseFare: 200, perKmRate: 25, perMinuteRate: 3, minimumFare: 350 }
        },
        outstation: {
          Sedan: { baseFare: 150, perKmRate: 10, perMinuteRate: 1.5, minimumFare: 500 },
          SUV: { baseFare: 200, perKmRate: 12, perMinuteRate: 2, minimumFare: 600 },
          Premium: { baseFare: 300, perKmRate: 15, perMinuteRate: 2.5, minimumFare: 800 }
        },
        car_rental: {
          Sedan: { baseFare: 100, perKmRate: 8, perMinuteRate: 200, minimumFare: 400 }, // 200 per hour
          SUV: { baseFare: 150, perKmRate: 10, perMinuteRate: 250, minimumFare: 500 }, // 250 per hour
          Premium: { baseFare: 200, perKmRate: 12, perMinuteRate: 350, minimumFare: 700 } // 350 per hour
        }
      };

      // Try to get pricing from database first
      let baseFare = 0, perKmRate = 0, perMinuteRate = 0, minimumFare = 0;

      try {
        // Get service type ID
        const { data: serviceTypes, error: serviceError } = await supabase
          .from('service_types')
          .select('id')
          .eq('name', serviceType.toLowerCase().replace(' ', '_'))
          .single();

        if (!serviceError && serviceTypes) {
          // Get vehicle type ID
          const { data: vehicleTypes, error: vehicleTypeError } = await supabase
            .from('vehicle_types')
            .select('id')
            .eq('name', vehicleType.toLowerCase())
            .single();

          if (!vehicleTypeError && vehicleTypes) {
            // Get pricing rules
            const { data: pricingRules, error: pricingError } = await supabase
              .from('pricing_rules')
              .select('*')
              .eq('service_type_id', serviceTypes.id)
              .eq('vehicle_type_id', vehicleTypes.id)
              .eq('is_active', true)
              .order('effective_from', { ascending: false })
              .limit(1)
              .single();

            if (!pricingError && pricingRules) {
              baseFare = Number(pricingRules.base_fare) || 0;
              perKmRate = Number(pricingRules.per_km_rate) || 0;
              perMinuteRate = Number(pricingRules.per_minute_rate) || 0;
              minimumFare = Number(pricingRules.minimum_fare) || 0;
            }
          }
        }
      } catch (dbError) {
        console.log('Database pricing not available, using fallback pricing');
      }

      // Use fallback if database pricing not found
      if (!baseFare && !perKmRate && !perMinuteRate && !minimumFare) {
        const serviceKey = serviceType.toLowerCase().replace(' ', '_') as keyof typeof pricingFallback;
        const vehicleKey = vehicleType as keyof typeof pricingFallback[keyof typeof pricingFallback];
        
        if (pricingFallback[serviceKey] && pricingFallback[serviceKey][vehicleKey]) {
          const pricing = pricingFallback[serviceKey][vehicleKey];
          baseFare = pricing.baseFare;
          perKmRate = pricing.perKmRate;
          perMinuteRate = pricing.perMinuteRate;
          minimumFare = pricing.minimumFare;
        } else {
          // Default pricing if service/vehicle not found
          baseFare = 50;
          perKmRate = 12;
          perMinuteRate = 2;
          minimumFare = 80;
        }
      }

      const surgeMultiplier = 1; // Default surge multiplier

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