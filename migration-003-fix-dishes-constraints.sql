-- Fix dishes table constraints for restaurant-centric architecture
-- This migration removes the NOT NULL constraint from restaurant_name
-- since we're now using restaurant_id instead

BEGIN;

-- Remove the NOT NULL constraint from restaurant_name
ALTER TABLE dishes ALTER COLUMN restaurant_name DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'dishes' AND column_name = 'restaurant_name';

COMMIT;

-- Expected result: restaurant_name should now be nullable (is_nullable = 'YES')
