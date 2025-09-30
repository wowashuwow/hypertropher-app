# Product Requirements Document: Hypertropher

**Version:** Final
**Status:** In Development
**Author:** Ashutosh Bhosale

---

## 1. Introduction & Vision

### 1.1. Problem Statement
For our dedicated group of gym-goers, maintaining a high-protein diet is crucial but challenging, as we rely exclusively on outside food. The current methods of discovering suitable meals involve a costly and time-consuming "trial and error" process. Key problems include:

* Wasted money and time on dishes that don't meet our dietary needs.
* Meal fatigue from eating the same few "safe" dishes repeatedly.
* Misleading descriptions online, where meals advertised as "high-protein" are often filled with carbs, leading to disappointment.
* Most critically, our individual findings are siloed. There is no efficient way to share our discoveries within our trusted circle.

### 1.2. Vision
To create a trusted, community-driven "shared protein diary" where friends can log and discover high-protein dishes from local restaurants and online delivery apps. Hypertropher will be the go-to tool for our community to save money, avoid bad meals, and consistently find great-tasting, high-protein food. This app is the first step in building the worldwide fitness brand, Hypertropher.

### 1.3. Target Audience
* **Initial (MVP):** A private, invite-only group of our friends who are dedicated gym-goers and fitness enthusiasts, primarily dependent on outside food.
* **Future:** A global community of fitness-conscious individuals.

---

## 2. Goals & Success Metrics

### 2.1. Primary Goal
Build a valuable and trusted, community-sourced database of high-protein dishes that is actively used by our friend group.

### 2.2. Key Success Metrics (MVP)
* **User Contribution:** Percentage of active users who have added at least one dish. This is our North Star metric.
* **Database Growth:** Total number of unique dishes added to the database per month.
* **Engagement:** Daily/Monthly Active Users (DAU/MAU).
* **User Satisfaction (Qualitative):** Direct feedback from the friend group on the app's usefulness.

---

## 3. User Stories

### 3.1. Onboarding & Setup
* As a **new user**, I want to sign up easily using a one-time invite code and my phone number so that I can securely create an account and join my friends' private community.
* As a **new user**, I want to be prompted to select my primary city after signing up so that the app is immediately personalized and shows me relevant dishes.

### 3.2. Dish Contribution
* As a **contributor**, I want to quickly add a dish I've discovered, whether it was in-restaurant or online, so that I can save it for myself and share the knowledge with my friends.
* As a **contributor**, I want to search for restaurants using a Google Maps-powered autocomplete so that I can log accurate location information without manual entry.
* As a **contributor**, I want to add my personal ratings, a photo, and an optional comment so that I can provide valuable context and subjective feedback to my friends.

### 3.3. Dish Discovery & Planning
* As a **discoverer**, I want to filter the main feed by protein type (e.g., "Chicken") and sort the results by price so that I can efficiently find the best meal for my current needs and budget.
* As a **user**, I want to see who added each dish so that I can place more trust in recommendations from people I know.
* As a **user**, when I see a dish has a comment, I want to click the card to expand it and read the feedback so that I can get more details before deciding to try it.
* As a **planner**, I want to save dishes to a personal "Wishlist" so that I can easily remember what I want to try next.

### 3.4. Personal Tracking
* As a **contributor**, I want to view a dedicated "My Dishes" page that shows all the meals I've personally added so that I can track my contributions and have a log of my favorite finds.

---

## 4. Detailed Functional Requirements

### 4.1. Authentication & User Management
* **FR-AUTH-01:** The system shall require a valid, unused, one-time invite code for a user to initiate the sign-up process.
* **FR-AUTH-02:** User sign-up and login shall be handled via phone number and a one-time password (OTP) sent via SMS, managed by Supabase Auth.
* **FR-AUTH-03:** Upon successful sign-up, the system shall invalidate the used invite code in the database.
* **FR-AUTH-04:** The system shall automatically generate five (5) new, unique invite codes for each newly registered user.
* **FR-AUTH-05:** Users must have an active session (be logged in) to add a dish or view their "My Dishes" and "My Wishlist" pages.

### 4.2. Pages & Navigation
* **FR-PAGE-01 (Homepage):** The default view for logged-in users. It will display a grid of dishes filtered by the user's selected city. It will include UI for filtering by protein source and sorting by price.
* **FR-PAGE-02 (Add Dish):** A form for logged-in users to contribute a new dish.
* **FR-PAGE-03 (My Wishlist):** A page displaying all dishes the user has bookmarked.
* **FR-PAGE-04 (My Dishes):** A page displaying all dishes the user has personally contributed.
* **FR-PAGE-05 (Account):** A page for the user to select their global city and log out.

### 4.3. Dish Creation & Data Capture
* **FR-ADD-01:** The "Add Dish" form must capture a `sourceType` of either "In-Restaurant" or "Online".
* **FR-ADD-02:** If "In-Restaurant", the form must use the Google Maps Places API to autocomplete restaurant names, scoped to the user's city. It must store the restaurant's name, address, and coordinates (latitude/longitude).
* **FR-ADD-03:** If "Online", the form must provide a multi-select dropdown for delivery apps (allowing multiple selections) and a restaurant name field. The URL input field is optional.
* **FR-ADD-04:** The form must require a `dishName`, a numerical `price`, and a `proteinSource` selection.
* **FR-ADD-05:** The form must allow for an optional photo upload, which will be stored in Supabase Storage.
* **FR-ADD-06:** The form must capture ratings for Taste, Protein Content, and Overall Satisfaction via button selectors.
* **FR-ADD-07:** The form must include an optional textarea for user comments.

### 4.4. DishCard Component Behavior
* **FR-CARD-01:** The card must display the dish photo, name, restaurant, city, price, availability, and contributor.
* **FR-CARD-02:** The card must display the ratings for Protein, Taste, and Satisfaction using the specified emoji system.
* **FR-CARD-03:** The card must contain a bookmark icon for adding/removing the dish from the user's "Wishlist".
* **FR-CARD-04:** The card must display conditional action buttons ("Navigate" for In-Store, multiple "Open [App Name]" buttons for Online dishes with multiple delivery apps).
* **FR-CARD-05:** If a dish has a comment, the entire card will be expandable via the Shadcn UI Accordion component to show the comment text. Clicks on internal buttons must not trigger the expansion.

---

## 5. Database Schema (Supabase - PostgreSQL)

### `users` table:
* `id`: UUID (Primary Key, from Supabase Auth)
* `phone`: Text (unique)
* `name`: Text
* `city`: Text
* `created_at`: Timestamp

### `dishes` table:
* `id`: UUID (Primary Key)
* `user_id`: UUID (Foreign Key to `users.id`)
* `dish_name`: Text
* `restaurant_name`: Text
* `city`: Text
* `availability`: Enum ("Online", "In-Store")
* `image_url`: Text (URL from Supabase Storage)
* `price`: Numeric
* `protein_source`: Text
* `taste`: Text
* `protein_content`: Text
* `satisfaction`: Text
* `comment`: Text (nullable)
* `restaurant_address`: Text (nullable)
* `latitude`: Numeric (nullable)
* `longitude`: Numeric (nullable)
* `delivery_app_url`: Text (nullable)
* `delivery_apps`: JSONB (array of delivery app names, e.g., ["Swiggy", "Zomato"])
* `created_at`: Timestamp

### `invite_codes` table:
* `code`: Text (Primary Key)
* `generated_by_user_id`: UUID (Foreign Key to `users.id`)
* `is_used`: Boolean (default: false)
* `used_by_user_id`: UUID (Foreign Key to `users.id`, nullable)
* `created_at`: Timestamp

### `wishlist_items` table: (Junction table)
* `user_id`: UUID (Primary Key, Foreign Key to `users.id`)
* `dish_id`: UUID (Primary Key, Foreign Key to `dishes.id`)
* `created_at`: Timestamp

---

## 6. Nonfunctional Requirements (NFRs)

* **NFR-01 (Performance):** The application must be fast and responsive. All pages should achieve a target interactive load time of under 2.5 seconds. API calls for fetching data should respond in under 500ms on average.
* **NFR-02 (Security):** All user authentication must be handled securely by Supabase Auth. Invite codes must be single-use and invalidated immediately. All communication must be over HTTPS.
* **NFR-03 (Scalability):** The application will be deployed on a serverless platform (Vercel) to automatically handle traffic spikes. The Supabase database is designed to scale as needed.
* **NFR-04 (Usability & Accessibility):** The application must be designed with a mobile-first approach and be fully responsive across all screen sizes. The UI must be intuitive and consistent.
* **NFR-05 (Maintainability):** The codebase must be well-structured within the Next.js App Router paradigm, with clear separation of concerns.

---

## 7. Technical Stack & Dependencies

* **Frontend:** React (Next.js) with TypeScript.
* **UI Library:** Shadcn UI, Tailwind CSS.
* **Backend & Database:** Supabase (PostgreSQL Database, Auth, Storage).
* **External APIs:** Google Maps Places API.

---

## 8. Out of Scope / Future Scope

* **V2 - High Priority:** Sharable Public User Profiles (e.g., "Protein Linktree"): A public, shareable link for each user that showcases their top-rated contributed dishes.
* **V2 - High Priority:** Highlighting Exceptional Dishes: A visual system (e.g., icon overlays on the dish image) to make dishes with the highest ratings stand out.
* **V2 - High Priority:** Server-Side Sorting & Filtering: Implement database-level sorting and filtering for better performance with large datasets. This includes:
  - Server-side price sorting (low-to-high, high-to-low)
  - Server-side protein source filtering
  - Server-side city filtering
  - Pagination support for large result sets
  - Query optimization and indexing strategies
* **V2:** Advanced Sorting: Implementing the "Sort by Distance" functionality.
* **Future:** Data Verification: A system for users to report incorrect dish entries.
* **Future:** Social Features: A "Thanks" button or other social feedback mechanisms.
* **Future:** User Feedback System: A dedicated tool for collecting user feedback.