-- Add new fields to support round trip bookings
ALTER TABLE public.bookings 
ADD COLUMN is_round_trip BOOLEAN DEFAULT false,
ADD COLUMN return_scheduled_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN trip_type TEXT,
ADD COLUMN vehicle_type TEXT,
ADD COLUMN special_instructions TEXT;

-- Update service_type_id to link with actual service types
UPDATE public.bookings 
SET service_type_id = (
  CASE 
    WHEN ride_type::text = 'city_ride' THEN (SELECT id FROM service_types WHERE name = 'city_ride')
    WHEN ride_type::text = 'airport' THEN (SELECT id FROM service_types WHERE name = 'airport')
    WHEN ride_type::text = 'outstation' THEN (SELECT id FROM service_types WHERE name = 'outstation')
    WHEN ride_type::text = 'car_rental' THEN (SELECT id FROM service_types WHERE name = 'car_rental')
    ELSE NULL
  END
)
WHERE service_type_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON public.bookings(service_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);