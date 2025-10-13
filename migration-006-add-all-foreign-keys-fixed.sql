-- Add ALL Missing Foreign Key Constraints (Fixed Version)
-- This migration adds foreign key constraints using DO blocks to check existence first
-- This prevents errors if some constraints already exist

-- ============================================
-- 1. DISHES TABLE - Foreign Keys
-- ============================================

-- Link dishes to users (who created them)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dishes_user_id_fkey'
    ) THEN
        ALTER TABLE dishes 
        ADD CONSTRAINT dishes_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Link dishes to restaurants
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dishes_restaurant_id_fkey'
    ) THEN
        ALTER TABLE dishes 
        ADD CONSTRAINT dishes_restaurant_id_fkey 
        FOREIGN KEY (restaurant_id) 
        REFERENCES restaurants(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- 2. DISH_AVAILABILITY_CHANNELS TABLE - Foreign Keys
-- ============================================

-- Link availability channels to dishes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dish_availability_channels_dish_id_fkey'
    ) THEN
        ALTER TABLE dish_availability_channels 
        ADD CONSTRAINT dish_availability_channels_dish_id_fkey 
        FOREIGN KEY (dish_id) 
        REFERENCES dishes(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 3. DISH_DELIVERY_APPS TABLE - Foreign Keys
-- ============================================

-- Link delivery apps to dishes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dish_delivery_apps_dish_id_fkey'
    ) THEN
        ALTER TABLE dish_delivery_apps 
        ADD CONSTRAINT dish_delivery_apps_dish_id_fkey 
        FOREIGN KEY (dish_id) 
        REFERENCES dishes(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Link delivery apps to availability channels
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dish_delivery_apps_availability_channel_id_fkey'
    ) THEN
        ALTER TABLE dish_delivery_apps 
        ADD CONSTRAINT dish_delivery_apps_availability_channel_id_fkey 
        FOREIGN KEY (availability_channel_id) 
        REFERENCES dish_availability_channels(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 4. WISHLIST_ITEMS TABLE - Foreign Keys
-- ============================================

-- Link wishlist items to users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_items_user_id_fkey'
    ) THEN
        ALTER TABLE wishlist_items 
        ADD CONSTRAINT wishlist_items_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Link wishlist items to dishes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_items_dish_id_fkey'
    ) THEN
        ALTER TABLE wishlist_items 
        ADD CONSTRAINT wishlist_items_dish_id_fkey 
        FOREIGN KEY (dish_id) 
        REFERENCES dishes(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 5. INVITE_CODES TABLE - Foreign Keys
-- ============================================

-- Link invite codes to the user who generated them
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invite_codes_generated_by_user_id_fkey'
    ) THEN
        ALTER TABLE invite_codes 
        ADD CONSTRAINT invite_codes_generated_by_user_id_fkey 
        FOREIGN KEY (generated_by_user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Link invite codes to the user who used them (nullable)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invite_codes_used_by_user_id_fkey'
    ) THEN
        ALTER TABLE invite_codes 
        ADD CONSTRAINT invite_codes_used_by_user_id_fkey 
        FOREIGN KEY (used_by_user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- VERIFICATION - Show all foreign keys that now exist
-- ============================================

SELECT
    tc.table_name,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

