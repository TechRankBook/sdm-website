import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FareCalculation {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  totalFare: number;
  estimatedTime: string;
  distance: string;
  packageDetails?: {
    name: string;
    duration_hours: number;
    included_kilometers: number;
    base_price: number;
  };
}

interface UseFareCalculationProps {
  serviceType: string;
  vehicleType: string;
  distanceKm?: number;
  durationMinutes?: number;
  packageId?: string; // For car rentals
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
  packageId,
}: UseFareCalculationProps) => {
  const [fareData, setFareData] = useState<FareCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFare = async () => {
    if (!serviceType || !vehicleType) return;

    setIsLoading(true);
    setError(null);

    try {
      // Special handling for car rentals with packages
      if (serviceType.toLowerCase() === 'car_rental' && packageId) {
        const { data: rentalPackage, error: packageError } = await supabase
          .from('rental_packages')
          .select('*')
          .eq('id', packageId)
          .eq('is_active', true)
          .single();

        if (!packageError && rentalPackage) {
          const totalFare = Math.round(Number(rentalPackage.base_price));
          
          setFareData({
            baseFare: totalFare,
            distanceFare: 0,
            timeFare: 0,
            totalFare,
            estimatedTime: `${rentalPackage.duration_hours}h package`,
            distance: `${rentalPackage.included_kilometers}km included`,
            packageDetails: {
              name: rentalPackage.name,
              duration_hours: rentalPackage.duration_hours,
              included_kilometers: rentalPackage.included_kilometers,
              base_price: rentalPackage.base_price
            }
          });
          return;
        }
      }

      // Standard fare calculation for non-rental services or when no package selected
      let baseFare = 0, perKmRate = 0, perMinuteRate = 0, minimumFare = 0;

      try {
        // Get service type ID with mapping for backend integration
        const serviceTypeMapping: Record<string, string> = {
          'city_ride': 'city_ride',
          'airport': 'airport_transfer', 
          'outstation': 'outstation',
          'car_rental': 'car_rental'
        };
        
        const mappedServiceType = serviceTypeMapping[serviceType.toLowerCase().replace(' ', '_')] || serviceType.toLowerCase().replace(' ', '_');
        
        const { data: serviceTypes, error: serviceError } = await supabase
          .from('service_types')
          .select('id')
          .eq('name', mappedServiceType)
          .maybeSingle();
        
        if (serviceError) {
          console.warn('Service type fetch error:', serviceError);
        }

        if (!serviceError && serviceTypes) {
          // Get vehicle type ID with mapping
          const vehicleTypeMapping: Record<string, string> = {
            'sedan': 'sedan',
            'suv': 'suv', 
            'premium': 'premium',
            'mini': 'mini',
            'luxury': 'luxury'
          };
          
          const mappedVehicleType = vehicleTypeMapping[vehicleType.toLowerCase()] || vehicleType.toLowerCase();
          
          const { data: vehicleTypes, error: vehicleTypeError } = await supabase
            .from('vehicle_types')
            .select('id')
            .eq('name', mappedVehicleType)
            .maybeSingle();

          if (!vehicleTypeError && vehicleTypes) {
            // Get pricing rules with better error handling
            const { data: pricingRules, error: pricingError } = await supabase
              .from('pricing_rules')
              .select('*')
              .eq('service_type_id', serviceTypes.id)
              .eq('vehicle_type_id', vehicleTypes.id)
              .eq('is_active', true)
              .order('effective_from', { ascending: false })
              .limit(1)
              .maybeSingle();

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

      // Fallback pricing if database doesn't have the data
      if (!baseFare && !perKmRate && !perMinuteRate && !minimumFare) {
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
          }
        };

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
      const distanceFare = distanceKm * perKmRate;
      const timeFare = durationMinutes * perMinuteRate;

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
  }, [serviceType, vehicleType, distanceKm, durationMinutes, packageId]);

  return { fareData, isLoading, error, refetch: calculateFare };
};