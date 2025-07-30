-- Insert pricing rules for different service types and vehicle types
INSERT INTO pricing_rules (
  service_type_id, 
  vehicle_type, 
  base_fare, 
  per_km_rate, 
  per_minute_rate, 
  minimum_fare, 
  surge_multiplier, 
  is_active
) VALUES 
-- City Ride pricing
((SELECT id FROM service_types WHERE name = 'city_ride'), 'Sedan', 50, 12, 2, 100, 1.0, true),
((SELECT id FROM service_types WHERE name = 'city_ride'), 'SUV', 80, 18, 3, 150, 1.0, true),
((SELECT id FROM service_types WHERE name = 'city_ride'), 'Premium', 120, 25, 5, 200, 1.0, true),

-- Airport pricing
((SELECT id FROM service_types WHERE name = 'airport'), 'Sedan', 100, 15, 3, 200, 1.0, true),
((SELECT id FROM service_types WHERE name = 'airport'), 'SUV', 150, 22, 4, 300, 1.0, true),
((SELECT id FROM service_types WHERE name = 'airport'), 'Premium', 200, 30, 6, 400, 1.0, true),

-- Outstation pricing
((SELECT id FROM service_types WHERE name = 'outstation'), 'Sedan', 200, 20, 2, 500, 1.0, true),
((SELECT id FROM service_types WHERE name = 'outstation'), 'SUV', 300, 30, 3, 800, 1.0, true),
((SELECT id FROM service_types WHERE name = 'outstation'), 'Premium', 500, 40, 5, 1200, 1.0, true),

-- Car Rental (hourly) pricing
((SELECT id FROM service_types WHERE name = 'car_rental'), 'Sedan', 0, 8, 120, 300, 1.0, true),
((SELECT id FROM service_types WHERE name = 'car_rental'), 'SUV', 0, 12, 180, 450, 1.0, true),
((SELECT id FROM service_types WHERE name = 'car_rental'), 'Premium', 0, 15, 250, 700, 1.0, true);