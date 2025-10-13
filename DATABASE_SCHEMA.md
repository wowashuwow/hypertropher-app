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
| `phone` | `TEXT` | Unique, Not Null | The user's phone number. |
| `name` | `TEXT` | | The user's full name. |
| `city` | `TEXT` | Not Null | The user's selected primary city. |
| `profile_picture_url` | `TEXT` | | The URL of the user's profile picture stored in Supabase Storage. |
| `profile_picture_updated_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the profile picture was last updated. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the user account was created. |

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
| `dish_id` | `UUID` | **Primary Key**, Foreign Key to `dishes.id` | The ID of the wishlisted dish. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the dish was wishlisted. |

#### Row Level Security (RLS) Policies
The `wishlist_items` table has RLS enabled with the following policies:
- **SELECT**: "Users can view their own wishlist items" (`auth.uid() = user_id`)
- **INSERT**: "Users can add to their own wishlist" (`auth.uid() = user_id`)
- **DELETE**: "Users can remove from their own wishlist" (`auth.uid() = user_id`)

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

## Administrative Operations

### Environment Configuration for Service Operations

The application requires a Secret API key for administrative operations that bypass Row Level Security (RLS). This is required for invite code validation during signup.

**Required Environment Variable:**
```bash
SUPABASE_SECRET_API_KEY=sb_secret_[secret_api_key_from_dashboard]
```

**Usage:** Service client (`lib/supabase/service.ts`) uses this key to bypass RLS for invite code validation during unauthenticated signup operations only.

**Security:** Secret API keys have browser blocking protection and should only be used in backend/server environments.