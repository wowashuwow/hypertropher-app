# Hypertropher Database Schema

This document outlines the database schema for the Hypertropher application, built on Supabase (PostgreSQL).

## Table of Contents
- [Hypertropher Database Schema](#hypertropher-database-schema)
  - [Table of Contents](#table-of-contents)
  - [Restaurant-Centric Architecture](#restaurant-centric-architecture)
    - [Key Changes:](#key-changes)
    - [Benefits:](#benefits)
    - [1. `users` table](#1-users-table)
      - [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
    - [2. `restaurants` table](#2-restaurants-table)
    - [3. `dishes` table](#3-dishes-table)
    - [4. `dish_availability_channels` table](#4-dish_availability_channels-table)
    - [5. `dish_delivery_apps` table](#5-dish_delivery_apps-table)
      - [Row Level Security (RLS) Policies](#row-level-security-rls-policies-1)
    - [6. `invite_codes` table](#6-invite_codes-table)
      - [Row Level Security (RLS) Policies](#row-level-security-rls-policies-2)
    - [7. `wishlist_items` table](#7-wishlist_items-table)
      - [Row Level Security (RLS) Policies](#row-level-security-rls-policies-3)
    - [8. `restaurant_delivery_app_reports` table](#8-restaurant_delivery_app_reports-table)
      - [Row Level Security (RLS) Policies](#row-level-security-rls-policies-4)
  - [Storage Buckets](#storage-buckets)
    - [`dish-photos` Bucket](#dish-photos-bucket)
    - [`profile-pictures` Bucket](#profile-pictures-bucket)
  - [Custom Functions](#custom-functions)
    - [`get_user_profile_by_id(user_id_input UUID)`](#get_user_profile_by_iduser_id_input-uuid)
  - [Custom Types](#custom-types)
    - [`availability_type` ENUM](#availability_type-enum)
    - [`protein_rating_type` ENUM](#protein_rating_type-enum)
    - [`taste_rating_type` ENUM](#taste_rating_type-enum)
    - [`satisfaction_rating_type` ENUM](#satisfaction_rating_type-enum)
  - [Schema Evolution \& Migration History](#schema-evolution--migration-history)
    - [Major Architecture Changes](#major-architecture-changes)
      - [1. Restaurant-Centric Refactor (January 2025)](#1-restaurant-centric-refactor-january-2025)
      - [2. Foreign Key Constraints (January 2025)](#2-foreign-key-constraints-january-2025)
      - [3. Storage Security Enhancement (January 2025)](#3-storage-security-enhancement-january-2025)
    - [4. Delivery App Reporting System (October 2025)](#4-delivery-app-reporting-system-october-2025)
    - [5. Wishlist Items CASCADE Update (October 2025)](#5-wishlist-items-cascade-update-october-2025)
    - [Database Constraint Issues Resolved](#database-constraint-issues-resolved)
    - [Data Migration Strategy](#data-migration-strategy)
  - [Administrative Operations](#administrative-operations)
    - [Environment Configuration for Service Operations](#environment-configuration-for-service-operations)

---

## Restaurant-Centric Architecture

The database schema has been redesigned to use a restaurant-centric approach that prevents data duplication and provides a more flexible availability system. This architecture addresses the previous issue where the same dish from the same restaurant could appear multiple times with different "source types" (In-Restaurant vs Online).

### Key Changes:

1. **Centralized Restaurant Data**: The new `restaurants` table stores all restaurant information in one place, whether sourced from Google Maps or entered manually.

2. **Flexible Availability System**: Dishes can now have multiple availability channels (In-Store, Online, or both) through the `dish_availability_channels` table.

3. **Delivery App Integration**: The `dish_delivery_apps` table links dishes to specific delivery apps for online availability.

4. **Automatic Availability Logic**:
   - Google Maps restaurants automatically have "In-Store" availability
   - Manual entries (cloud kitchens) automatically have "Online" availability only
   - Delivery app selection automatically creates "Online" availability

### Benefits:

- **No Data Duplication**: Same restaurant appears only once in the database
- **Simplified User Experience**: Users don't need to manually select availability types
- **Better Data Integrity**: Centralized restaurant data with proper relationships
- **Flexible Availability**: Dishes can be available in multiple channels simultaneously

---

### 1. `users` table
Stores user profile information. Linked to Supabase Auth via the `id` field.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**, Foreign Key to `auth.users.id` | References the user in Supabase's authentication schema. |
| `email` | `TEXT` | Unique, Nullable | The user's email address (for email/Google OAuth authentication). |
| `phone` | `TEXT` | Unique, Nullable | The user's phone number (for phone authentication - deprecated). |
| `name` | `TEXT` | | The user's full name. |
| `city` | `TEXT` | Not Null | The user's selected primary city. |
| `profile_picture_url` | `TEXT` | | The URL of the user's profile picture stored in Supabase Storage. |
| `profile_picture_updated_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the profile picture was last updated. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the user account was created. |

**Authentication Methods:**
- **Email + Password**: Users can sign up and log in with email and password
- **Email Magic Link**: Passwordless authentication via email link
- **Google OAuth**: One-click sign-in with Google account
- **Phone (Deprecated)**: Legacy phone-based OTP authentication (disabled for new users)

#### Row Level Security (RLS) Policies
The `users` table has RLS enabled with the following policies:
- **SELECT**: "Allow users to read their own profile details" (`auth.uid() = id`)
- **INSERT**: "Allow users to insert their own profile" (`auth.uid() = id`)
- **UPDATE**: "Allow users to update their own profile" (`auth.uid() = id`)

### 2. `restaurants` table
Centralized restaurant data to prevent duplication and maintain consistency.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**, Default: `gen_random_uuid()` | The unique identifier for a restaurant. |
| `name` | `TEXT` | Not Null | The name of the restaurant. |
| `city` | `TEXT` | Not Null | The city where the restaurant is located. |
| `place_id` | `TEXT` | Unique, Nullable | Google Maps Place ID for restaurant navigation. |
| `google_maps_address` | `TEXT` | Nullable | Full address from Google Maps. |
| `latitude` | `NUMERIC` | Nullable | Latitude for mapping (from Google Maps). |
| `longitude` | `NUMERIC` | Nullable | Longitude for mapping (from Google Maps). |
| `manual_address` | `TEXT` | Nullable | Manually entered address (for cloud kitchens). |
| `is_cloud_kitchen` | `BOOLEAN` | Default: `false` | Whether this is a cloud kitchen (delivery only). |
| `source_type` | `TEXT` | Not Null, Check: `IN ('google_maps', 'manual')` | Whether restaurant data comes from Google Maps or manual entry. |
| `verified` | `BOOLEAN` | Default: `false` | Whether the restaurant information has been verified. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the restaurant was added. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the restaurant was last updated. |

### 3. `dishes` table
The core table containing all user-contributed dish information. **Note:** City information is now stored in the `restaurants` table to prevent data duplication.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**, Default: `gen_random_uuid()` | The unique identifier for a dish. |
| `user_id` | `UUID` | Foreign Key to `users.id`, Not Null | The ID of the user who contributed the dish. |
| `restaurant_id` | `UUID` | Foreign Key to `restaurants.id`, Nullable | The ID of the restaurant where this dish is available. |
| `dish_name` | `TEXT` | Not Null | The name of the dish (e.g., "Grilled Chicken Bowl"). |
| `image_url` | `TEXT` | Nullable | The URL of the dish photo stored in Supabase Storage. |
| `price` | `NUMERIC` | Not Null | The price of the dish. |
| `protein_source`| `TEXT` | Not Null | The primary protein source (e.g., "Chicken", "Paneer"). |
| `protein_content`| `ENUM (protein_rating_type)` | Nullable | User's rating for protein content (e.g., "Overloaded", "Pretty Good"). |
| `taste` | `ENUM (taste_rating_type)` | Nullable | User's rating for taste (e.g., "Mouthgasm", "Pretty Good"). |
| `satisfaction` | `ENUM (satisfaction_rating_type)` | Nullable | User's overall satisfaction rating (e.g., "Would Eat Everyday", "Pretty Good"). |
| `comment` | `TEXT` | Nullable | Optional user comments about the dish. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the dish was added. |

### 4. `dish_availability_channels` table
Defines where a dish is available (In-Store, Online, or both).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**, Default: `gen_random_uuid()` | The unique identifier for an availability channel. |
| `dish_id` | `UUID` | Foreign Key to `dishes.id`, ON DELETE CASCADE | The ID of the dish. |
| `channel` | `TEXT` | Not Null, Check: `IN ('In-Store', 'Online')` | The availability channel. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the availability channel was added. |

### 5. `dish_delivery_apps` table
Links dishes to specific delivery apps for online availability.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**, Default: `gen_random_uuid()` | The unique identifier for a delivery app entry. |
| `dish_id` | `UUID` | Foreign Key to `dishes.id`, ON DELETE CASCADE | The ID of the dish. |
| `availability_channel_id` | `UUID` | Foreign Key to `dish_availability_channels.id`, ON DELETE CASCADE | The ID of the Online availability channel. |
| `delivery_app` | `TEXT` | Not Null | The name of the delivery app (e.g., "Swiggy", "Zomato"). |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the delivery app was added. |

#### Row Level Security (RLS) Policies

**Restaurants table policies:**
- **SELECT**: "Allow public read access to restaurants" (`true`)
- **INSERT**: "Allow authenticated users to insert restaurants" (`auth.role() = 'authenticated'`)
- **UPDATE**: "Allow authenticated users to update restaurants" (`auth.role() = 'authenticated'`)

**Dishes table policies:**
- **SELECT**: "Allow public read access" (`true`) - for discovery functionality
- **INSERT**: "Allow authenticated users to add dishes" (`auth.role() = 'authenticated'`)
- **UPDATE**: "Users can update their own dishes" (`auth.uid() = user_id`)
- **DELETE**: "Users can delete their own dishes" (`auth.uid() = user_id`)

**Dish availability channels table policies:**
- **SELECT**: "Allow public read access to dish availability channels" (`true`)
- **INSERT**: "Allow authenticated users to insert dish availability channels" (`auth.role() = 'authenticated'`)
- **UPDATE**: "Allow dish owners to update availability channels" (via dish ownership check)
- **DELETE**: "Allow dish owners to delete availability channels" (via dish ownership check)

**Dish delivery apps table policies:**
- **SELECT**: "Allow public read access to dish delivery apps" (`true`)
- **INSERT**: "Allow authenticated users to insert dish delivery apps" (`auth.role() = 'authenticated'`)
- **UPDATE**: "Allow dish owners to update delivery apps" (via dish ownership check)
- **DELETE**: "Allow dish owners to delete delivery apps" (via dish ownership check)

### 6. `invite_codes` table
Manages the invite code system for new user registration.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `code` | `TEXT` | **Primary Key** | The unique 8-character invite code. |
| `generated_by_user_id`| `UUID` | Foreign Key to `users.id` | The user who generated this code. |
| `is_used` | `BOOLEAN` | Default: `false` | Tracks if the code has been used. |
| `used_by_user_id` | `UUID` | Foreign Key to `users.id`, Nullable | The user who signed up with this code. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the code was generated. |

#### Row Level Security (RLS) Policies
The `invite_codes` table has RLS enabled with the following policies:
- **SELECT**: "Users can view their own invite codes" (`auth.uid() = generated_by_user_id`)
- **INSERT**: "System can create invite codes for users" (`auth.uid() = generated_by_user_id`)
- **UPDATE**: "System can update invite codes" (`auth.uid() = generated_by_user_id`)

### 7. `wishlist_items` table
A junction table to manage the many-to-many relationship between users and their bookmarked (wishlisted) dishes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | **Primary Key**, Foreign Key to `users.id` | The ID of the user. |
| `dish_id` | `UUID` | **Primary Key**, Foreign Key to `dishes.id`, ON DELETE CASCADE | The ID of the wishlisted dish. When a dish is deleted, associated wishlist items are automatically removed. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the dish was wishlisted. |

#### Row Level Security (RLS) Policies
The `wishlist_items` table has RLS enabled with the following policies:
- **SELECT**: "Users can view their own wishlist items" (`auth.uid() = user_id`)
- **INSERT**: "Users can add to their own wishlist" (`auth.uid() = user_id`)
- **DELETE**: "Users can remove from their own wishlist" (`auth.uid() = user_id`)

**Foreign Key Behavior:**
- **`dish_id`**: Uses `ON DELETE CASCADE` - When a dish is deleted, all associated wishlist items are automatically removed. This allows dish owners to delete their dishes even if other users have wishlisted them.

### 8. `restaurant_delivery_app_reports` table
Tracks user reports about incorrect delivery app availability at restaurants. Used by the reporting system to automatically remove delivery apps when a threshold is met.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**, Default: `gen_random_uuid()` | The unique identifier for a report. |
| `restaurant_id` | `UUID` | Foreign Key to `restaurants.id`, ON DELETE CASCADE, Nullable | The ID of the restaurant where the delivery app is reported as unavailable. |
| `delivery_app` | `TEXT` | Not Null | The name of the delivery app reported as unavailable (e.g., "Swiggy", "Zomato"). |
| `reported_by_user_id` | `UUID` | Foreign Key to `users.id`, ON DELETE CASCADE, Nullable | The ID of the user who submitted the report. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the report was submitted. |

**Reporting System Logic:**
- When 2+ unique users report the same delivery app as unavailable for a restaurant, the app is automatically removed from all dishes at that restaurant.
- For cloud kitchens, if all delivery apps are removed, the "Online" availability channel is automatically deleted.
- Reports are stored at the restaurant level, affecting all dishes from that restaurant.

#### Row Level Security (RLS) Policies
The `restaurant_delivery_app_reports` table has RLS enabled with the following policies:
- **SELECT**: "Authenticated users can view reports" (`auth.role() = 'authenticated'`)
- **INSERT**: "Authenticated users can submit reports" (`auth.role() = 'authenticated'`)
- **UPDATE**: "Users cannot update reports" (no policy - prevents updates)
- **DELETE**: "Users cannot delete reports" (no policy - prevents deletions)

**Foreign Key Behavior:**
- **`restaurant_id`**: Uses `ON DELETE CASCADE` - When a restaurant is deleted, all associated reports are automatically removed.
- **`reported_by_user_id`**: Uses `ON DELETE CASCADE` - When a user is deleted, all reports they submitted are automatically removed.

---

## Storage Buckets

### `dish-photos` Bucket
Stores dish images uploaded by users.

**Configuration:**
- **Public Access**: Yes (for displaying dish images)
- **File Organization**: Files stored with user ID prefix for security: `{user_id}/{filename}`
- **Example**: `a1b2c3d4-5678-90ab-cdef-1234567890ab/1760180575803-uhrkbd-dish.jpg`

**RLS Policies**:
- **INSERT**: Authenticated users can upload photos (automatically prefixed with their user ID)
- **DELETE**: Users can only delete photos in their own user ID folder
- **SELECT**: Public read access for displaying images

### `profile-pictures` Bucket
Stores user profile pictures.

**Configuration:**
- **Public Access**: Yes (for displaying profile pictures)
- **RLS Policies**: 
  - Users can upload their own profile pictures
  - Users can update their own profile pictures
  - Users can delete their own profile pictures
  - Profile pictures are publicly accessible for display
- **File Organization**: Files stored with user ID prefix for security
- **Image Processing**: Automatic resizing to 400x400px with JPEG compression

---

## Custom Functions

### `get_user_profile_by_id(user_id_input UUID)`
A secure function that returns both the name and profile picture URL of a user by their ID. This function is used by the dishes API to safely fetch user profile information without exposing sensitive data.

**Parameters:**
- `user_id_input`: The UUID of the user

**Returns:** `JSON` - A JSON object containing:
  - `name`: The user's name (TEXT)
  - `profile_picture_url`: The user's profile picture URL (TEXT, can be NULL)

**Example Return:**
```json
{
  "name": "John Doe",
  "profile_picture_url": "https://supabase.co/storage/v1/object/public/profile-pictures/user-123/profile.jpg"
}
```

**Usage:** Called by the dishes API to populate both `users.name` and `users.profile_picture_url` fields in dish queries for displaying contributor information on dish cards.

**Security:** Uses `SECURITY DEFINER` to ensure controlled access to user profile data.

---

## Custom Types

### `availability_type` ENUM
Defines the possible values for dish availability.

**Values:**
- `'Online'` - Dish is available through delivery apps
- `'In-Store'` - Dish is available at physical restaurant locations

**Usage:** Used by the `dishes.availability` column to ensure data consistency.

### `protein_rating_type` ENUM
Defines the possible values for protein content ratings.

**Values:**
- `'Overloaded'` - High protein content rating
- `'Pretty Good'` - Standard protein content rating

**Note:** Database also contains `'Great'` value for backward compatibility, but it is not currently used in the UI.

**Usage:** Used by the `dishes.protein_content` column to ensure data consistency.

### `taste_rating_type` ENUM
Defines the possible values for taste ratings.

**Values:**
- `'Mouthgasm'` - Exceptional taste rating
- `'Pretty Good'` - Standard taste rating

**Note:** Database also contains `'Amazing'` and `'Great'` values for backward compatibility, but they are not currently used in the UI.

**Usage:** Used by the `dishes.taste` column to ensure data consistency.

### `satisfaction_rating_type` ENUM
Defines the possible values for overall satisfaction ratings.

**Values:**
- `'Would Eat Everyday'` - Highest satisfaction rating
- `'Pretty Good'` - Standard satisfaction rating

**Note:** Database also contains `'Great'` value for backward compatibility, but it is not currently used in the UI.

**Usage:** Used by the `dishes.satisfaction` column to ensure data consistency.

---

## Schema Evolution & Migration History

### Major Architecture Changes

#### 1. Restaurant-Centric Refactor (January 2025)

**Problem Solved:**
- Data duplication: Same dish/restaurant appearing twice (In-Restaurant vs Online)
- Inconsistent restaurant data across dishes
- Limited availability flexibility

**Solution Implemented:**
- Created centralized `restaurants` table
- Implemented `dish_availability_channels` for flexible availability (In-Store/Online/Both)
- Created `dish_delivery_apps` for online dish management
- Migrated all existing data to new structure

**Tables Created:**
```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  place_id TEXT UNIQUE,           -- Google Maps ID
  google_maps_address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  manual_address TEXT,            -- For cloud kitchens
  is_cloud_kitchen BOOLEAN,
  source_type TEXT CHECK (source_type IN ('google_maps', 'manual')),
  verified BOOLEAN DEFAULT false
);

CREATE TABLE dish_availability_channels (
  id UUID PRIMARY KEY,
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  channel TEXT CHECK (channel IN ('In-Store', 'Online')),
  UNIQUE(dish_id, channel)
);

CREATE TABLE dish_delivery_apps (
  id UUID PRIMARY KEY,
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  availability_channel_id UUID REFERENCES dish_availability_channels(id) ON DELETE CASCADE,
  delivery_app TEXT NOT NULL,
  UNIQUE(dish_id, availability_channel_id, delivery_app)
);
```

**Columns Removed from `dishes` table:**
- `restaurant_name` (moved to `restaurants.name`)
- `city` (moved to `restaurants.city`)
- `restaurant_address` (split into `google_maps_address` and `manual_address`)
- `latitude`, `longitude` (moved to `restaurants`)
- `place_id` (moved to `restaurants`)
- `availability` (replaced by `dish_availability_channels`)
- `delivery_app_url` (replaced by `dish_delivery_apps`)

**Columns Added to `dishes` table:**
- `restaurant_id UUID` - References restaurants table

#### 2. Foreign Key Constraints (January 2025)

**Problem Solved:**
- No referential integrity between tables
- Supabase PostgREST couldn't auto-join tables (PGRST108 errors)
- Data inconsistencies possible

**Foreign Keys Added (11 total):**
```sql
-- Dishes table
ALTER TABLE dishes ADD CONSTRAINT dishes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE dishes ADD CONSTRAINT dishes_restaurant_id_fkey 
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL;

-- Availability channels
ALTER TABLE dish_availability_channels ADD CONSTRAINT dish_availability_channels_dish_id_fkey 
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;

-- Delivery apps
ALTER TABLE dish_delivery_apps ADD CONSTRAINT dish_delivery_apps_dish_id_fkey 
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;

ALTER TABLE dish_delivery_apps ADD CONSTRAINT dish_delivery_apps_availability_channel_id_fkey 
  FOREIGN KEY (availability_channel_id) REFERENCES dish_availability_channels(id) ON DELETE CASCADE;

-- Wishlist
ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_dish_id_fkey 
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;

-- Invite codes
ALTER TABLE invite_codes ADD CONSTRAINT invite_codes_generated_by_user_id_fkey 
  FOREIGN KEY (generated_by_user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE invite_codes ADD CONSTRAINT invite_codes_used_by_user_id_fkey 
  FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
```

**Impact:**
- Enabled Supabase PostgREST auto-joins using explicit foreign key names
- Ensured data integrity across tables
- Fixed navigate buttons and wishlist functionality

#### 3. Storage Security Enhancement (January 2025)

**Problem Solved:**
- Users could delete any dish photo (security vulnerability)
- No file organization by user
- Silent deletion failures

**Solution Implemented:**

**File Structure Change:**
- **Before:** `{timestamp}-{random}-{filename}` (bucket root)
- **After:** `{user_id}/{timestamp}-{random}-{filename}` (user folders)

**RLS Policies Added:**
```sql
-- CRITICAL: SELECT policy required for deletion to work
CREATE POLICY "Public access to dish photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dish-photos');

-- User can only upload to their own folder
CREATE POLICY "Users can upload their own dish photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'dish-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- User can only delete their own photos
CREATE POLICY "Users can delete their own dish photos"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'dish-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
```

**Key Lesson:**
🚨 **Supabase Storage requires BOTH SELECT and DELETE policies for deletion to work.** Missing SELECT policy causes silent failures where API returns "success" but files remain in storage. See `/Docs/Supabase_Workflow.md` for complete troubleshooting workflow.

#### 4. Delivery App Reporting System (October 2025)

**Problem Solved:**
- Delivery app availability data could become stale or incorrect over time
- No mechanism for users to report incorrect app availability
- Manual removal of apps required admin intervention

**Solution Implemented:**
- Created `restaurant_delivery_app_reports` table to track user reports
- Automated removal system when 2+ unique users report an app as unavailable
- Restaurant-level removal (affects all dishes from that restaurant)
- Cloud kitchen edge case handling (removes Online channel if all apps removed)

**Table Created:**
```sql
CREATE TABLE restaurant_delivery_app_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  delivery_app TEXT NOT NULL,
  reported_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Foreign Keys Added:**
- `restaurant_id` → `restaurants.id` with `ON DELETE CASCADE`
- `reported_by_user_id` → `users.id` with `ON DELETE CASCADE`

**Impact:**
- Community-driven data accuracy improvements
- Automatic cleanup of stale delivery app associations
- Reduced admin overhead for data maintenance

#### 5. Wishlist Items CASCADE Update (October 2025)

**Problem Solved:**
- Dish owners could not delete dishes if anyone had wishlisted them
- Foreign key constraint blocked deletion without explicit handling
- Prevented legitimate use cases (spam cleanup, test dish removal)

**Solution Implemented:**
Updated `wishlist_items.dish_id` foreign key constraint to use `ON DELETE CASCADE`.

**Migration:**
```sql
-- Drop existing constraint
ALTER TABLE wishlist_items 
DROP CONSTRAINT wishlist_items_dish_id_fkey;

-- Re-add with CASCADE
ALTER TABLE wishlist_items
ADD CONSTRAINT wishlist_items_dish_id_fkey 
FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;
```

**Impact:**
- Dish owners can now delete their dishes regardless of wishlist status
- Automatic cleanup of wishlist items when dishes are deleted
- Consistent with other foreign key patterns (`dish_availability_channels`, `dish_delivery_apps`)
- Interim solution until recommendation system provides permanent validation signals

**Note:** This is an interim fix. The future recommendation system will use `dish_recommendations` to protect valuable dishes from deletion, while wishlists remain temporary personal planning tools.

### Database Constraint Issues Resolved

**Problem:** NOT NULL constraints on old columns preventing dish creation after refactor

**Constraints Removed:**
```sql
ALTER TABLE dishes ALTER COLUMN restaurant_name DROP NOT NULL;
ALTER TABLE dishes ALTER COLUMN availability DROP NOT NULL;
```

**Then columns were completely removed** in final cleanup migration.

### Data Migration Strategy

**Approach Used:**
1. Created new tables (`restaurants`, `dish_availability_channels`, `dish_delivery_apps`)
2. Added nullable `restaurant_id` to `dishes` table
3. Migrated data using PostgreSQL CTEs:
   - Created restaurant records from unique dish restaurant data
   - Linked dishes to restaurants
   - Created availability channels based on old `availability` field
   - Created delivery app records from old `delivery_apps` JSONB
4. Removed redundant columns after successful migration
5. Made `restaurant_id` NOT NULL after data migration

**Migration Verification:**
- All 10 existing dishes migrated successfully
- No data loss
- All relationships preserved
- New structure allows both in-store and online availability for same dish

---

## Administrative Operations

### Environment Configuration for Service Operations

The application requires a Secret API key for administrative operations that bypass Row Level Security (RLS). This is required for invite code validation during signup.

**Required Environment Variable:**
```bash
SUPABASE_SECRET_API_KEY=sb_secret_[secret_api_key_from_dashboard]
```

**Usage:** Service client (`lib/supabase/service.ts`) uses this key to bypass RLS for invite code validation during unauthenticated signup operations only.

**Security:** Secret API keys have browser blocking protection and should only be used in backend/server environments.