-- Fix ALL dishes table constraints for restaurant-centric architecture
-- This migration removes NOT NULL constraints from old columns that are no longer used

BEGIN;

-- Remove NOT NULL constraints from old columns that are now handled by the new architecture
ALTER TABLE dishes ALTER COLUMN restaurant_name DROP NOT NULL;
ALTER TABLE dishes ALTER COLUMN availability DROP NOT NULL;

-- Verify the changes
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'dishes' 
  AND column_name IN ('restaurant_name', 'availability', 'restaurant_id')
ORDER BY column_name;

COMMIT;

-- Expected results:
-- restaurant_name should now be nullable (is_nullable = 'YES')
-- availability should now be nullable (is_nullable = 'YES') 
-- restaurant_id should remain nullable (is_nullable = 'YES')
