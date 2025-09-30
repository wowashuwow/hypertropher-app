# Hypertropher Database Schema

This document outlines the database schema for the Hypertropher application, built on Supabase (PostgreSQL).

## Table of Contents
- [Hypertropher Database Schema](#hypertropher-database-schema)
  - [Table of Contents](#table-of-contents)
    - [1. `users` table](#1-users-table)
    - [2. `dishes` table](#2-dishes-table)
    - [3. `invite_codes` table](#3-invite_codes-table)
    - [4. `wishlist_items` table](#4-wishlist_items-table)

---

### 1. `users` table
Stores user profile information. Linked to Supabase Auth via the `id` field.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**, Foreign Key to `auth.users.id` | References the user in Supabase's authentication schema. |
| `phone` | `TEXT` | Unique, Not Null | The user's phone number. |
| `name` | `TEXT` | | The user's full name. |
| `city` | `TEXT` | Not Null | The user's selected primary city. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the user account was created. |

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
| `taste` | `TEXT` | | User's rating for taste (e.g., "Amazing", "Great"). |
| `protein_content`| `TEXT` | | User's rating for protein content (e.g., "Overloaded", "Great"). |
| `satisfaction` | `TEXT` | | User's overall satisfaction rating (e.g., "Would Eat Everyday"). |
| `comment` | `TEXT` | Nullable | Optional user comments about the dish. |
| `restaurant_address`| `TEXT` | Nullable | Full address of the restaurant (for in-store). |
| `latitude` | `NUMERIC` | Nullable | Latitude for mapping. |
| `longitude` | `NUMERIC` | Nullable | Longitude for mapping. |
| `delivery_app_url`| `TEXT` | Nullable | The URL to the dish on the delivery app (for online). |
| `delivery_apps` | `JSONB` | Default: `'[]'::jsonb` | Array of delivery app names (e.g., ["Swiggy", "Zomato"]) for online dishes. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the dish was added. |

### 3. `invite_codes` table
Manages the invite code system for new user registration.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `code` | `TEXT` | **Primary Key** | The unique 8-character invite code. |
| `generated_by_user_id`| `UUID` | Foreign Key to `users.id` | The user who generated this code. |
| `is_used` | `BOOLEAN` | Default: `false` | Tracks if the code has been used. |
| `used_by_user_id` | `UUID` | Foreign Key to `users.id`, Nullable | The user who signed up with this code. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the code was generated. |

### 4. `wishlist_items` table
A junction table to manage the many-to-many relationship between users and their bookmarked (wishlisted) dishes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | **Primary Key**, Foreign Key to `users.id` | The ID of the user. |
| `dish_id` | `UUID` | **Primary Key**, Foreign Key to `dishes.id` | The ID of the wishlisted dish. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `now()` | The timestamp when the dish was wishlisted. |

#### Row Level Security (RLS) Policies
The `wishlist_items` table has RLS enabled with the following policies:
- **SELECT**: Users can view their own wishlist items (`auth.uid() = user_id`)
- **INSERT**: Users can add items to their own wishlist (`auth.uid() = user_id`)
- **DELETE**: Users can remove items from their own wishlist (`auth.uid() = user_id`)