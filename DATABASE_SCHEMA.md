# Hypertropher Database Schema

This document outlines the database schema for the Hypertropher application, built on Supabase (PostgreSQL).

## Table of Contents
- [Hypertropher Database Schema](#hypertropher-database-schema)
  - [Table of Contents](#table-of-contents)
    - [1. `users` table](#1-users-table)
      - [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
    - [2. `dishes` table](#2-dishes-table)
      - [Row Level Security (RLS) Policies](#row-level-security-rls-policies-1)
    - [3. `invite_codes` table](#3-invite_codes-table)
      - [Row Level Security (RLS) Policies](#row-level-security-rls-policies-2)
    - [4. `wishlist_items` table](#4-wishlist_items-table)
      - [Row Level Security (RLS) Policies](#row-level-security-rls-policies-3)
  - [Storage Buckets](#storage-buckets)
    - [`dish-photos` Bucket](#dish-photos-bucket)
    - [`profile-pictures` Bucket](#profile-pictures-bucket)
  - [Custom Functions](#custom-functions)
    - [`get_user_profile_by_id(user_id_input UUID)`](#get_user_profile_by_iduser_id_input-uuid)
  - [Custom Types](#custom-types)
    - [`availability_type` ENUM](#availability_type-enum)
  - [Administrative Operations](#administrative-operations)
    - [Environment Configuration for Service Operations](#environment-configuration-for-service-operations)

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

### 2. `dishes` table
The core table containing all user-contributed dish information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**, Default: `gen_random_uuid()` | The unique identifier for a dish. |
| `user_id` | `UUID` | Foreign Key to `users.id` | The ID of the user who contributed the dish. |
| `dish_name` | `TEXT` | Not Null | The name of the dish (e.g., "Grilled Chicken Bowl"). |
| `restaurant_name`| `TEXT` | Not Null | The name of the restaurant. |
| `city` | `TEXT` | Not Null | The city where the dish is available. |
| `availability` | `ENUM('Online', 'In-Store')` | Not Null | Whether the dish is from a delivery app or a physical restaurant. |
| `image_url` | `TEXT` | | The URL of the dish photo stored in Supabase Storage. |
| `price` | `NUMERIC` | Not Null | The price of the dish. |
| `protein_source`| `TEXT` | Not Null | The primary protein source (e.g., "Chicken", "Paneer"). |
| `taste` | `TEXT` | | User's rating for taste (e.g., "Mouthgasm", "Pretty Good"). |
| `protein_content`| `TEXT` | | User's rating for protein content (e.g., "Overloaded", "Pretty Good"). |
| `satisfaction` | `TEXT` | | User's overall satisfaction rating (e.g., "Would Eat Everyday", "Pretty Good"). |
| `comment` | `TEXT` | Nullable | Optional user comments about the dish. |
| `restaurant_address`| `TEXT` | Nullable | Full address of the restaurant (for in-store). |
| `latitude` | `NUMERIC` | Nullable | Latitude for mapping. |
| `longitude` | `NUMERIC` | Nullable | Longitude for mapping. |
| `delivery_app_url`| `TEXT` | Nullable | The URL to the dish on the delivery app (for online). |
| `delivery_apps` | `JSONB` | Default: `'[]'::jsonb` | Array of delivery app names (e.g., ["Swiggy", "Zomato"]) for online dishes. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the dish was added. |

#### Row Level Security (RLS) Policies
The `dishes` table has RLS enabled with the following policies:
- **SELECT**: "Allow public read access" (`true`) - for discovery functionality
- **INSERT**: "Allow authenticated users to add dishes" (`auth.role() = 'authenticated'`)
- **UPDATE**: "Users can update their own dishes" (`auth.uid() = user_id`)
- **DELETE**: "Users can delete their own dishes" (`auth.uid() = user_id`)

### 3. `invite_codes` table
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

### 4. `wishlist_items` table
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
- **RLS Policies**: Users can upload their own dish images
- **File Organization**: Files stored with user ID prefix for security

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

**Usage:** Used by the `dishes.protein_content` column to ensure data consistency.

### `taste_rating_type` ENUM
Defines the possible values for taste ratings.

**Values:**
- `'Mouthgasm'` - Exceptional taste rating
- `'Pretty Good'` - Standard taste rating

**Usage:** Used by the `dishes.taste` column to ensure data consistency.

### `satisfaction_rating_type` ENUM
Defines the possible values for overall satisfaction ratings.

**Values:**
- `'Would Eat Everyday'` - Highest satisfaction rating
- `'Pretty Good'` - Standard satisfaction rating

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