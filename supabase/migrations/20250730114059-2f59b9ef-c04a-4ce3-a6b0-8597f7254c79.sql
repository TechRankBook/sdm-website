-- Enable RLS on missing tables and create policies for secure access
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_places_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for pricing_rules (read-only for authenticated users)
CREATE POLICY "pricing_rules_select_authenticated" ON pricing_rules
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create policies for service_types (read-only for authenticated users)
CREATE POLICY "service_types_select_authenticated" ON service_types
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create policies for locations (read-only for authenticated users)
CREATE POLICY "locations_select_authenticated" ON locations
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create policies for google_places_cache (service role access only)
CREATE POLICY "google_places_cache_service_role" ON google_places_cache
FOR ALL 
USING (auth.role() = 'service_role');

-- Allow authenticated users to insert locations
CREATE POLICY "locations_insert_authenticated" ON locations
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);