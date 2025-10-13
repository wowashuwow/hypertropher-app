-- Migration 002: Data Migration from Old Schema to New Schema (FIXED)
-- Run this AFTER running migration-001-restaurant-schema.sql

BEGIN;

-- 1. Create restaurants from existing dishes
INSERT INTO restaurants (name, city, source_type, place_id, google_maps_address, latitude, longitude, manual_address, is_cloud_kitchen)
SELECT DISTINCT 
  restaurant_name,
  city,
  CASE 
    WHEN availability = 'In-Store' AND place_id IS NOT NULL THEN 'google_maps'
    ELSE 'manual'
  END as source_type,
  place_id,
  CASE 
    WHEN availability = 'In-Store' THEN restaurant_address
    ELSE NULL
  END as google_maps_address,
  CASE 
    WHEN availability = 'In-Store' THEN latitude
    ELSE NULL
  END as latitude,
  CASE 
    WHEN availability = 'In-Store' THEN longitude
    ELSE NULL
  END as longitude,
  CASE 
    WHEN availability = 'Online' THEN restaurant_address
    ELSE NULL
  END as manual_address,
  CASE 
    WHEN availability = 'Online' THEN true
    ELSE false
  END as is_cloud_kitchen
FROM dishes
WHERE restaurant_name IS NOT NULL
  AND restaurant_name != '';

-- 2. Update dishes with restaurant_id
UPDATE dishes 
SET restaurant_id = r.id
FROM restaurants r
WHERE dishes.restaurant_name = r.name 
  AND dishes.city = r.city;

-- 3. Create availability channels for existing dishes
INSERT INTO dish_availability_channels (dish_id, channel)
SELECT 
  id,
  CASE 
    WHEN availability = 'In-Store' THEN 'In-Store'
    WHEN availability = 'Online' THEN 'Online'
  END as channel
FROM dishes
WHERE availability IS NOT NULL
  AND availability IN ('In-Store', 'Online');

-- 4. Migrate delivery apps for Online dishes (simplified approach)
-- Since we don't have any Online dishes with delivery apps currently, this will be empty
-- But we'll keep this for future data that might come in
INSERT INTO dish_delivery_apps (dish_id, availability_channel_id, delivery_app)
SELECT 
  d.id,
  dac.id,
  app_element::text
FROM dishes d
JOIN dish_availability_channels dac ON d.id = dac.dish_id
CROSS JOIN LATERAL jsonb_array_elements_text(d.delivery_apps) AS app_element
WHERE d.delivery_apps IS NOT NULL 
  AND jsonb_array_length(d.delivery_apps) > 0
  AND dac.channel = 'Online'
  AND app_element::text IS NOT NULL
  AND app_element::text != '';

-- 5. Handle dishes that have both In-Store and Online availability (if any exist)
-- This handles the case where the same dish exists twice with different availability
WITH duplicate_dishes AS (
  SELECT 
    restaurant_name,
    dish_name,
    city,
    array_agg(id) as dish_ids,
    array_agg(availability) as availabilities
  FROM dishes 
  WHERE restaurant_name IS NOT NULL
  GROUP BY restaurant_name, dish_name, city
  HAVING count(*) > 1
),
merged_dishes AS (
  SELECT 
    dd.restaurant_name,
    dd.dish_name,
    dd.city,
    dd.dish_ids[1] as primary_dish_id,
    dd.dish_ids[2:] as duplicate_dish_ids,
    dd.availabilities
  FROM duplicate_dishes dd
)
-- Add missing availability channels for merged dishes
INSERT INTO dish_availability_channels (dish_id, channel)
SELECT 
  md.primary_dish_id,
  'Online' as channel
FROM merged_dishes md
WHERE 'Online' = ANY(md.availabilities)
  AND NOT EXISTS (
    SELECT 1 FROM dish_availability_channels dac 
    WHERE dac.dish_id = md.primary_dish_id 
    AND dac.channel = 'Online'
  );

WITH duplicate_dishes AS (
  SELECT 
    restaurant_name,
    dish_name,
    city,
    array_agg(id) as dish_ids,
    array_agg(availability) as availabilities
  FROM dishes 
  WHERE restaurant_name IS NOT NULL
  GROUP BY restaurant_name, dish_name, city
  HAVING count(*) > 1
),
merged_dishes AS (
  SELECT 
    dd.restaurant_name,
    dd.dish_name,
    dd.city,
    dd.dish_ids[1] as primary_dish_id,
    dd.dish_ids[2:] as duplicate_dish_ids,
    dd.availabilities
  FROM duplicate_dishes dd
)
INSERT INTO dish_availability_channels (dish_id, channel)
SELECT 
  md.primary_dish_id,
  'In-Store' as channel
FROM merged_dishes md
WHERE 'In-Store' = ANY(md.availabilities)
  AND NOT EXISTS (
    SELECT 1 FROM dish_availability_channels dac 
    WHERE dac.dish_id = md.primary_dish_id 
    AND dac.channel = 'In-Store'
  );

COMMIT;

-- Verify the migration
SELECT 
  'Restaurants created:' as description,
  count(*) as count
FROM restaurants
UNION ALL
SELECT 
  'Dishes with restaurant_id:' as description,
  count(*) as count
FROM dishes 
WHERE restaurant_id IS NOT NULL
UNION ALL
SELECT 
  'Availability channels created:' as description,
  count(*) as count
FROM dish_availability_channels
UNION ALL
SELECT 
  'Delivery apps migrated:' as description,
  count(*) as count
FROM dish_delivery_apps;
