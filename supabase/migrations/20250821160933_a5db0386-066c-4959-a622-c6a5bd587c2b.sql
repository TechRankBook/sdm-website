-- Add passengers column to bookings table if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passengers INTEGER DEFAULT 1;

-- Add service_type column to bookings table if it doesn't exist  
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_type TEXT;

-- Update existing bookings to have default passengers if null
UPDATE bookings SET passengers = 1 WHERE passengers IS NULL;