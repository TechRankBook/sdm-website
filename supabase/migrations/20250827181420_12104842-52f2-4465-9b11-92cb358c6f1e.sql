-- Update service type from city_ride to ride_later
UPDATE service_types SET name = 'ride_later' WHERE name = 'city_ride';