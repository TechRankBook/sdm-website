-- Fix vehicle_type_id assignments for existing vehicles
UPDATE vehicles SET vehicle_type_id = (
  SELECT id FROM vehicle_types WHERE name = 'sedan'
) WHERE make IN ('Maruti', 'Toyota') AND model IN ('Swift Dzire', 'Camry');

UPDATE vehicles SET vehicle_type_id = (
  SELECT id FROM vehicle_types WHERE name = 'suv'
) WHERE make = 'Tata' AND model = 'Nexon';

UPDATE vehicles SET vehicle_type_id = (
  SELECT id FROM vehicle_types WHERE name = 'premium'
) WHERE make = 'Toyota' AND model = 'Innova crysta';

-- Insert sample pricing rules if they don't exist (for missing combinations)
INSERT INTO pricing_rules (
  service_type_id, 
  vehicle_type_id, 
  base_fare, 
  per_km_rate, 
  per_minute_rate, 
  minimum_fare, 
  surge_multiplier,
  is_active
) 
SELECT service_type_id, vehicle_type_id, base_fare, per_km_rate, per_minute_rate, minimum_fare, surge_multiplier, is_active
FROM (VALUES 
-- City Ride - Sedan
((SELECT id FROM service_types WHERE name = 'city_ride'), 
 (SELECT id FROM vehicle_types WHERE name = 'sedan'), 
 80, 15, 2, 150, 1.0, true),

-- City Ride - SUV  
((SELECT id FROM service_types WHERE name = 'city_ride'), 
 (SELECT id FROM vehicle_types WHERE name = 'suv'), 
 100, 18, 2.5, 200, 1.0, true),

-- City Ride - Premium
((SELECT id FROM service_types WHERE name = 'city_ride'), 
 (SELECT id FROM vehicle_types WHERE name = 'premium'), 
 150, 25, 3, 300, 1.0, true),

-- Airport - Sedan
((SELECT id FROM service_types WHERE name = 'airport'), 
 (SELECT id FROM vehicle_types WHERE name = 'sedan'), 
 100, 12, 1.5, 200, 1.0, true),

-- Airport - SUV
((SELECT id FROM service_types WHERE name = 'airport'), 
 (SELECT id FROM vehicle_types WHERE name = 'suv'), 
 120, 15, 2, 250, 1.0, true),

-- Airport - Premium  
((SELECT id FROM service_types WHERE name = 'airport'), 
 (SELECT id FROM vehicle_types WHERE name = 'premium'), 
 200, 20, 2.5, 400, 1.0, true),

-- Car Rental - Sedan (hourly rates)
((SELECT id FROM service_types WHERE name = 'car_rental'), 
 (SELECT id FROM vehicle_types WHERE name = 'sedan'), 
 100, 10, 150, 500, 1.0, true),

-- Car Rental - SUV (hourly rates)
((SELECT id FROM service_types WHERE name = 'car_rental'), 
 (SELECT id FROM vehicle_types WHERE name = 'suv'), 
 150, 12, 200, 700, 1.0, true),

-- Car Rental - Premium (hourly rates)  
((SELECT id FROM service_types WHERE name = 'car_rental'), 
 (SELECT id FROM vehicle_types WHERE name = 'premium'), 
 200, 15, 300, 1000, 1.0, true)
) AS new_rules(service_type_id, vehicle_type_id, base_fare, per_km_rate, per_minute_rate, minimum_fare, surge_multiplier, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM pricing_rules pr 
  WHERE pr.service_type_id = new_rules.service_type_id 
  AND pr.vehicle_type_id = new_rules.vehicle_type_id
);