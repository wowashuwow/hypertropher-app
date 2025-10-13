-- Complete Database Cleanup - Remove All Redundant Columns from Dishes Table
-- This migration removes all redundant columns that are now available via JOIN with restaurants table

BEGIN;

-- Remove all redundant columns from dishes table
ALTER TABLE dishes DROP COLUMN IF EXISTS restaurant_name;
ALTER TABLE dishes DROP COLUMN IF EXISTS city;
ALTER TABLE dishes DROP COLUMN IF EXISTS restaurant_address;
ALTER TABLE dishes DROP COLUMN IF EXISTS latitude;
ALTER TABLE dishes DROP COLUMN IF EXISTS longitude;
ALTER TABLE dishes DROP COLUMN IF EXISTS place_id;
ALTER TABLE dishes DROP COLUMN IF EXISTS availability;
ALTER TABLE dishes DROP COLUMN IF EXISTS delivery_apps;
ALTER TABLE dishes DROP COLUMN IF EXISTS delivery_app_url;

COMMIT;
