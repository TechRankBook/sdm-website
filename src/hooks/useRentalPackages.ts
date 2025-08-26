import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RentalPackage {
  id: string;
  name: string;
  duration_hours: number;
  included_kilometers: number;
  base_price: number;
  extra_hour_rate: number;
  extra_km_rate: number;
  vehicle_type: string;
  vehicle_type_id: string;
  is_active: boolean;
  cancellation_fee: number;
  no_show_fee: number;
  waiting_limit_minutes: number;
  created_at: string;
  updated_at: string;
}

interface UseRentalPackagesProps {
  vehicleType?: string;
}

export const useRentalPackages = ({ vehicleType }: UseRentalPackagesProps = {}) => {
  const [packages, setPackages] = useState<RentalPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('rental_packages')
        .select('*')
        .eq('is_active', true)
        .order('duration_hours', { ascending: true });

      if (false) {
        query = query.eq('vehicle_type', vehicleType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPackages((data || []) as RentalPackage[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rental packages');
      console.error('Rental packages fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [vehicleType]);

  return { packages, isLoading, error, refetch: fetchPackages };
};