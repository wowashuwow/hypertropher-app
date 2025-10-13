-- Add ALL Missing Foreign Key Constraints
-- This migration adds foreign key constraints to enable Supabase PostgREST automatic relationships
-- and ensure data integrity across the entire database

BEGIN;

-- ============================================
-- 1. DISHES TABLE - Foreign Keys
-- ============================================

-- Link dishes to users (who created them)
ALTER TABLE dishes 
ADD CONSTRAINT dishes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Link dishes to restaurants
ALTER TABLE dishes 
ADD CONSTRAINT dishes_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) 
REFERENCES restaurants(id) 
ON DELETE SET NULL;

-- ============================================
-- 2. DISH_AVAILABILITY_CHANNELS TABLE - Foreign Keys
-- ============================================

-- Link availability channels to dishes
ALTER TABLE dish_availability_channels 
ADD CONSTRAINT dish_availability_channels_dish_id_fkey 
FOREIGN KEY (dish_id) 
REFERENCES dishes(id) 
ON DELETE CASCADE;

-- ============================================
-- 3. DISH_DELIVERY_APPS TABLE - Foreign Keys
-- ============================================

-- Link delivery apps to dishes
ALTER TABLE dish_delivery_apps 
ADD CONSTRAINT dish_delivery_apps_dish_id_fkey 
FOREIGN KEY (dish_id) 
REFERENCES dishes(id) 
ON DELETE CASCADE;

-- Link delivery apps to availability channels
ALTER TABLE dish_delivery_apps 
ADD CONSTRAINT dish_delivery_apps_availability_channel_id_fkey 
FOREIGN KEY (availability_channel_id) 
REFERENCES dish_availability_channels(id) 
ON DELETE CASCADE;

-- ============================================
-- 4. WISHLIST_ITEMS TABLE - Foreign Keys
-- ============================================

-- Link wishlist items to users
ALTER TABLE wishlist_items 
ADD CONSTRAINT wishlist_items_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Link wishlist items to dishes
ALTER TABLE wishlist_items 
ADD CONSTRAINT wishlist_items_dish_id_fkey 
FOREIGN KEY (dish_id) 
REFERENCES dishes(id) 
ON DELETE CASCADE;

-- ============================================
-- 5. INVITE_CODES TABLE - Foreign Keys
-- ============================================

-- Link invite codes to the user who generated them
ALTER TABLE invite_codes 
ADD CONSTRAINT invite_codes_generated_by_user_id_fkey 
FOREIGN KEY (generated_by_user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Link invite codes to the user who used them (nullable)
ALTER TABLE invite_codes 
ADD CONSTRAINT invite_codes_used_by_user_id_fkey 
FOREIGN KEY (used_by_user_id) 
REFERENCES users(id) 
ON DELETE SET NULL;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================

-- Check all foreign keys were created successfully:
-- SELECT
--     tc.table_name,
--     tc.constraint_name, 
--     kcu.column_name, 
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_schema = 'public'
-- ORDER BY tc.table_name;

