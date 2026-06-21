# Implementation Plan for Hypertropher

**Last audited:** May 2026 (aligned with codebase on `main`)  
**Current app URL layout:** Landing at `/`, discover feed at `/app` (Stage 12 complete)  
**Theme:** Dark-only (Stage 13 complete). `:root` in `globals.css` uses dark palette; `className="dark"` on `<html>` in `layout.tsx`. Primary red unified to `#ff3333`.  
**Auth:** Email + OTP only (phone auth removed in FEATURE-022)

## Stage index (quick reference)

| Stage | Topic | Status |
|-------|--------|--------|
| 1–4.5 | Foundation, auth, dishes, session | ✅ Complete |
| 5–7 | Integrations, UI/UX, polish | ✅ Complete (minor items deferred) |
| 8 | Client-side performance / caching | ✅ Partial (caching done; server-side sort/filter deferred) |
| 9 | Restaurant-centric architecture | ✅ Complete |
| 9.1 | Middle East delivery apps (Noon, Careem, Talabat) | ✅ Complete |
| 11 | Security (React CVE patch) | ✅ Complete |
| 12 | Landing page, `/app` split, LinkedIn invites | ✅ Complete |
| 13 | App-wide dark theme (match landing) | ✅ Complete |
| 14 | Code quality, performance & security hardening | 📋 Planned (next) |

*Numbering note: An older changelog used **“Stage 10”** for the Middle East expansion—that work is **Stage 9.1** above. **Stage 10** is intentionally unused in the stage list to avoid confusion. New landing-page work is **Stage 12** (next stage after 11).*

## Feature Analysis

### Identified Features:
- **Authentication System**: Email OTP authentication with invite codes (invite-only signup)
- **User Management**: Profile creation, global city selection, 5 invite codes per new user
- **Dish Contribution**: Add dishes with optional photos, ratings, restaurant/location data
- **Dish Discovery**: Browse (including logged-out), filter by protein, sort by price/distance
- **Wishlist Management**: Save and manage favorite dishes
- **Restaurant Integration**: Google Maps Places API + cloud kitchen manual entry
- **Image Storage**: Supabase Storage with client-side compression
- **Responsive Design**: Mobile-first UI with desktop support

### Feature Categorization:
- **Must-Have Features:** Authentication, Dish CRUD, User profiles, Basic filtering
- **Should-Have Features:** Wishlist, Google Maps integration, Image uploads, distance sorting
- **Nice-to-Have Features:** Server-side sorting/filtering, Social features, Public profiles

## Recommended Tech Stack

### Frontend:
- **Framework:** Next.js 14 with App Router - Modern React framework with excellent performance and developer experience
- **Documentation:** https://nextjs.org/docs

### Backend:
- **Framework:** Supabase - Backend-as-a-Service with PostgreSQL, Auth, and Storage
- **Documentation:** https://supabase.com/docs

### Database:
- **Database:** PostgreSQL (via Supabase) - Robust relational database with excellent performance
- **Documentation:** https://supabase.com/docs/guides/database

### Additional Tools:
- **UI Library:** Shadcn UI with Tailwind CSS - Modern, accessible component library
- **Documentation:** https://ui.shadcn.com/
- **Authentication:** Supabase Auth - Email OTP (magic link fallback route retained)
- **Documentation:** https://supabase.com/docs/guides/auth
- **Storage:** Supabase Storage - File storage for dish images
- **Documentation:** https://supabase.com/docs/guides/storage
- **Maps API:** Google Maps Places API - Restaurant search and location data
- **Documentation:** https://developers.google.com/maps/documentation/places/web-service

## Implementation Stages

### Stage 1: Foundation & Setup ✅ COMPLETE
**Duration:** 2-3 days
**Dependencies:** None

#### Sub-steps:
- [x] Set up Supabase project and environment variables
- [x] Create and implement database schema
- [x] Configure Supabase Auth (originally phone; migrated to email OTP in FEATURE-022)
- [x] Set up Supabase client and server configurations
- [x] Create initial invite codes (seeded via Supabase / service role; no in-app admin UI)

### Stage 2: Core Authentication & User Management ✅ COMPLETE
**Duration:** 3-4 days
**Dependencies:** Stage 1 completion

#### Sub-steps:
- [x] Build signup API with invite code validation
- [x] Create complete profile page and API
- [x] Implement OTP verification flow
- [x] Set up user profile management
- [x] Create invite code generation system

### Stage 3: Core Dish Functionality ✅ COMPLETE
**Duration:** 2-3 days
**Dependencies:** Stage 2 completion

#### Sub-steps:
- [x] Create dishes API endpoints (POST/GET)
- [x] Build add dish form with image upload
- [x] Implement Supabase Storage integration
- [x] Create dish data models and validation

### Stage 4: Dynamic Data & Session Handling ✅ COMPLETE
**Duration:** 3-4 days
**Dependencies:** Stage 3 completion

#### Sub-steps:
- [x] Build combined login/signup page and API
- [x] Implement dynamic session handling and route protection
- [x] Connect discover feed (`app/page.tsx`, route `/`) to live data from API
- [x] Connect "My Dishes" page to live data
- [x] Connect "My Wishlist" page to live data
- [x] Display user's invite codes in account page
- [x] Auto-generate 5 invite codes per user on profile completion (`app/api/users/route.ts`)

### Stage 4.5: Security & UX Fixes ✅ COMPLETE
**Duration:** 1 day
**Dependencies:** Stage 4 completion

#### SUB-STEPS:
- [x] Fix sensitive data exposure in user profile API (BUG-002; phone field later deprecated)
- [x] Implement personalized user greetings on homepage (BUG-003)
- [x] Fix city update persistence across app (BUG-001)
- [x] Document all security fixes and bug resolutions

### Stage 5: Advanced Features & Integrations ✅ COMPLETE
**Duration:** 2-3 days
**Dependencies:** Stage 4.5 completion

#### Sub-steps:
- [x] Add restaurant name field to online dish form
- [x] Make URL field optional in online dish form
- [x] Implement multi-select delivery apps functionality
- [x] Create custom MultiSelect UI component with Shadcn UI
- [x] Update dish card to display multiple delivery app pills and buttons
- [x] Implement deep linking with web fallbacks for delivery apps
- [x] Fix multi-select styling and alignment issues (BUG-005)
- [x] Integrate Google Maps Places API for restaurant search
- [x] Implement dish update and delete functionality
- [x] Fix edit dish form field order to match add dish form
- [x] Implement RLS policies for invite_codes table
- [x] Fix invite codes display and status indicators
- [x] Implement Rethink Sans font with responsive typography
- [x] Update app title styling with mobile-optimized sizing
- [x] Normalize letter spacing across all components
- [x] Client-side filtering and sorting (protein, price, distance — BUG-023/024)
- [ ] **Deferred:** Server-side sorting and filtering (Stage 8 / V2)
- [x] Create wishlist management system

### Stage 6: Pre-Deployment UI/UX Enhancements ✅ COMPLETE
**Duration:** 2-3 days
**Dependencies:** Stage 5 completion

#### Sub-steps:
- [x] Implement auto-update city selection on account settings page ✅
  - Remove "Save Changes" button from account settings ✅
  - Make city dropdown auto-save when selection changes ✅
  - Provide immediate user feedback on city change ✅

- [x] Implement server-side city filtering for all pages ✅
  - Add city filtering to wishlist API ✅
  - Add city filtering to dishes API (Discover and My Dishes) ✅
  - Preserve existing RPC functionality for author names ✅

- [x] Update dish card contributor display format
  - Change from "<profile picture> Added by your friend <name>" format
  - Update to "Added by <name> <profile picture>" format
  - Ensure proper alignment and styling consistency

- [x] Add clipboard copy functionality for online dishes
  - Copy **restaurant name** to clipboard when "Open in &lt;app&gt;" is clicked (updated from dish name)
  - Toast feedback on copy success/failure
  - Integrate with existing deep linking functionality

- [x] Implement profile picture functionality
  - Add optional profile picture upload in signup/profile completion page
  - Add profile picture update option in account settings
  - Display profile picture in app header when available
  - Show default placeholder when no profile picture is set
  - Update user schema and Supabase storage integration

- [x] Implement global city selection with Google Maps integration
  - Replace hardcoded city list with Google Maps Places API city search
  - Allow users to select any city worldwide during signup and in account settings
  - Store city in "City, Country" format to prevent ambiguity
  - Update existing data from "Pune" to "Pune, India" format
  - Create reusable CitySearchInput component with autocomplete
  - Maintain existing API compatibility and dish filtering logic
  - Add debounced search with loading states and error handling

- [x] Implement region-based delivery app filtering
  - Show only DoorDash and UberEats for US cities
  - Show only Swiggy and Zomato for India cities
  - Update add dish form delivery app options based on selected city
  - Maintain existing multi-select functionality
  - Create delivery apps by country mapping from delivery_apps_by_country.md
  - Implement country extraction utility from "City, Country" format
  - Create useDeliveryAppsForCity hook for filtering logic
  - Update both add dish and edit dish forms with dynamic filtering
  - Handle cases where no delivery apps are available for a location

- [x] Implement delivery app pills UI with logos (`DeliveryAppPills`, `lib/delivery-apps.ts`)
  - **Note:** Add/edit dish forms later moved to **auto-apply all regional apps** (FEATURE-023); pills component retained for legacy/edit paths
  - Official WebP logos for 16 apps (FEATURE-019)

- [x] Implement enhanced rating system with improved text and emoji display
  - Update rating text values: baseline renamed to "Assured", taste premium → "Exceptional", overall premium → "Daily Fuel"
  - Implement emoji display logic: "Assured" → ✅, "Overloaded" → 🔥, "Exceptional" → 🔥, "Daily Fuel" → 🔥
  - Update UI copy to show "Overall Satisfaction" label while retaining existing satisfaction state keys
  - Display rating labels alongside emojis on dish cards for better clarity
  - Update database ENUM types to reflect new rating values
  - Migrate existing data from old rating values to new ones
  - Update all TypeScript interfaces across the application
  - Modify form components to display emoji-prefixed options while storing clean text
  - Update DishCard helper functions for new emoji display logic
  - Maintain database schema integrity with proper ENUM constraints

- [x] Implement enhanced deep linking system with restaurant name copying
  - Create comprehensive deep links configuration for all 13 delivery apps
  - Add deep links for Grubhub, Postmates, Just Eat Takeaway, Deliveroo, Grab, Foodpanda, iFood, PedidosYa, Rappi
  - Update clipboard copy functionality from dish name to restaurant name
  - Implement smart fallback system (deep link → web URL → error handling)
  - Create centralized deep link management in lib/deep-links.ts
  - Update DishCard component with enhanced click handler and user feedback
  - Maintain existing functionality while adding comprehensive app coverage

### Stage 7: Polish & Deployment ✅ MOSTLY COMPLETE
**Duration:** 2-3 days
**Dependencies:** Stage 6 completion

#### Sub-steps:
- [x] Implement OTP rate limiting to prevent abuse and control costs
- [x] **UI/UX Modernization Phase 1**: Integrate v0 design system and modernize dish cards
  - Apply v0 globals.css theme and design patterns throughout the app
  - Modernize dish card styling to match sleek v0 design (keep all existing functionality)
  - Maintain current font (Rethink Sans) but update sizing according to v0 design
  - Keep all existing ratings, price display, and functionality unchanged
  - Focus only on visual improvements and modern styling
- [x] **UI/UX Modernization Phase 2 - Part 1**: Add SVG icons to delivery app buttons
  - ✅ Verified delivery app buttons are using Shadcn UI components properly
  - ✅ Added SVG icons to delivery app buttons for better visual identification
  - ✅ Integrated existing delivery app logo system with button display
  - ✅ Added error handling for missing SVG icons with fallback to placeholder
  - ✅ Maintained all existing functionality (deep linking, clipboard, button states)
  - ✅ Enhanced button layout with proper icon alignment and text truncation
  - ✅ All 12 delivery apps now show their respective SVG logos (Swiggy, Zomato, Uber Eats, etc.)
- [x] **UI/UX Modernization Phase 2 - Part 2**: Modernize comments section
  - ✅ Modernized comments section button design to match design system
  - ✅ Implemented slide-up animation for comments as overlay tray (instead of inline expansion)
  - ✅ Created modern, sleek comment overlay interaction with proper arrow directions
  - ✅ Added consistent "Close comment" button styling matching "Show comment" button
  - ✅ Maintained all existing comment functionality while improving visual experience
  - ✅ Comment tray slides up from bottom edge of card and covers content behind it
  - ✅ Proper arrow directions: upward arrow when closed, downward arrow when open
  - ✅ Fast, consistent animations (200ms) for both opening and closing
  - ✅ Added profile pictures to comment bubbles for personal touch (using existing RPC data)
  - ✅ Implemented mobile-optimized 3D visual effects with progressive enhancement
  - ✅ Desktop: Enhanced shadows + backdrop blur for realistic depth
  - ✅ Mobile: Simplified shadows for optimal performance
  - ✅ Gradient background with transparency for modern glass-like effect
  - ✅ Profile picture fallback system with gradient initials
- [x] **Add Dish Form Performance and Validation Fixes**: Comprehensive form improvements
  - ✅ Fixed emoji removal logic causing database ENUM validation errors
  - ✅ Fixed Google Places API location parameter requirement for restaurant search
  - ✅ Added comprehensive validation for restaurant selection and rating values
  - ✅ Added performance timing and debug logging for form submission
  - ✅ Enhanced error handling and user feedback for validation failures
  - ✅ Replaced window.location with Next.js router for faster navigation
  - ✅ Added fallback location handling for Google Places API calls
  - ✅ Implemented realistic upload progress indication with file size display
  - ✅ Added file-size based progress estimation for better user experience
  - ✅ Fixed slow form submission issues with comprehensive debugging
- [x] **Edit Dish Form Restaurant Search Integration**: Fix restaurant search functionality
  - ✅ Fixed emoji removal logic in ButtonGroup components (same regex fix as add dish form)
  - ✅ Fixed RestaurantSearchInput integration and state management
  - ✅ Added comprehensive form validation for restaurant selection and ratings
  - ✅ Added performance timing and debug logging for troubleshooting
  - ✅ Enhanced error handling and user feedback
  - ✅ Updated submit button disabled state to include restaurant validation
  - ✅ Fixed restaurant name text editing functionality (backspace and typing)
  - ✅ Ensured feature parity between add dish and edit dish forms
- [x] **Navigate Button Implementation**: Functional restaurant navigation for In-Store dishes
  - ✅ `place_id` stored on `restaurants` table (Stage 9 schema; was previously on `dishes`)
  - ✅ Updated add/edit dish forms to capture place_id via Google Places API
  - ✅ Implemented handleNavigate in DishCard with Google Maps restaurant page URLs
  - ✅ Fixed data transformation in discover feed and my-dishes pages to include place_id
  - ✅ Fixed wishlist API to include place_id in select query and data transformation
  - ✅ Updated all Dish interfaces and DishCard component to handle place_id
  - ✅ Added comprehensive error handling for missing place_id data
  - ✅ Navigate button now opens Google Maps restaurant pages with reviews, photos, and business information
- [x] **UI/UX Modernization Phase 3**: Add basic page transition animations
  - [x] **Phase 3.1: Fix Page Refresh Issue with CSS-Only Transitions** ✅ COMPLETE
    - **Problem**: Custom JavaScript transition logic causing page refreshes and header/navigation disappearing
    - **Root Cause**: React element comparison conflicts with Next.js App Router navigation timing
    - **Solution**: Remove JavaScript transition logic, implement pure CSS transitions that work with Next.js
    - **Implementation Steps**:
      1. ✅ Reverted MainLayout to simple version (removed custom transition state management)
      2. ✅ Updated CSS for route-based transitions using data attributes and key prop
      3. ✅ Let Next.js handle navigation naturally while adding CSS slide animations
      4. ✅ Tested transitions across all main navigation routes (Discover → Add Dish → My Dishes → My Wishlist)
      5. ✅ Verified no more page refreshes or disappearing header/navigation
      6. ✅ Enhanced animation timing for better visibility (400ms duration, 40px slide distance)
    - **Files Modified**: `components/main-layout.tsx`, `app/globals.css`
    - **Result**: Smooth, visible slide transitions without page refreshes, consistent header/navigation
  - [ ] **Phase 3.2: Navigation Enhancement** (Deferred)
    - Add subtle scale animation (1.05x) on active nav items
    - Implement smooth color transitions for active states
    - Add press animation (0.95x scale) for mobile taps
    - Ensure 44px minimum touch targets are maintained
  - [ ] **Phase 3.3: Content-Specific Animations** (Deferred)
    - Staggered fade-in for dish cards on page load
    - Subtle hover effects for desktop users
    - Smooth transitions between form steps (if any)
    - Success state animations for form submissions

**Technical Implementation Details for Phase 3.1 (Completed):**
- **Approach**: CSS-only transitions using Next.js key prop and data attributes (no JavaScript transition logic)
- **Animation Timing**: 400ms entry (ease-out), 40px slide distance - enhanced for better visibility
- **Performance**: Mobile-first with 60fps target, works with Next.js App Router optimizations
- **Accessibility**: Reduced motion support and maintained keyboard navigation
- **CSS Strategy**: Transform-based animations triggered by route changes, hardware-accelerated
- **Implementation**: Pure CSS @keyframes with transform: translateX() and opacity transitions

**Implementation Priority & Rationale:**
1. **Phase 3.1 (Current Issue)**: Fix page refresh problem first - immediate user experience issue causing visual glitches
2. **Stage 8 Performance Optimization (Future Issue)**: Address unnecessary API calls second - performance improvement but not breaking functionality
3. **Rationale**: Current issue affects every navigation, while performance issue is more subtle but impacts overall app speed

- [x] Deploy to Vercel with environment configuration (production domain `hypertropher.com`; see `Docs/PRE_LAUNCH_CHECKLIST.md` for DNS verification items)
- [x] Add invite code verification feedback on signup (`codeValidationError` UI in `app/signup/page.tsx`)
- [x] Implement secure invite code passing (user metadata + `complete-profile` / OTP flow)
- [x] Auth flow UX improvements (ProtectedRoute, MainLayout on auth pages, BUG-025)
- [ ] Conduct comprehensive regression testing (ongoing; user verification before major releases)
- [ ] Optimize performance and fix bugs (ongoing; server-side items deferred to Stage 8)

### Stage 8: Performance Optimization (V2) — PARTIAL
**Duration:** 3-4 days
**Dependencies:** Stage 7 completion

#### Sub-steps:
- [x] **Fix Unnecessary Re-loading Issue**: Prevent unnecessary API calls and loading states on page navigation ✅ COMPLETE
  - **Problem**: Every page visit triggers fresh API calls for user data (name, city) even when data hasn't changed
  - **Root Cause**: Client-side rendered pages re-initialize on navigation, no caching or state persistence
  - **Evidence**: Terminal logs show repeated `/api/users` calls on every page visit (lines 23-294 in terminal output)
  - **Solution**: Implement user data caching and state persistence in session provider
  - **Implementation Steps**:
    1. ✅ Added event-based user data caching logic to SessionProvider (no time expiration)
    2. ✅ Removed redundant `/api/users` calls from all pages (app/page.tsx, app/my-dishes/page.tsx, app/my-wishlist/page.tsx)
    3. ✅ Updated pages to use cached SessionProvider data instead of making separate API calls
    4. ✅ Added cache invalidation when user changes city or profile picture in account settings
    5. ✅ Tested navigation between pages to verify reduced API calls
  - **Files Modified**: `lib/auth/session-provider.tsx`, `app/page.tsx`, `app/my-dishes/page.tsx`, `app/my-wishlist/page.tsx`, `app/account/page.tsx`
  - **Result**: 80-90% reduction in `/api/users` calls, faster page loads, better perceived performance
  - **Technical Details**: Event-based caching with no time expiration - cache persists until user data changes
  - **Cache Invalidation Events**: 
    - User changes city in account settings
    - User updates profile picture in account settings  
    - User signs out
    - Different user signs in
    - Force refresh requested
  - **Performance Impact**: Eliminated 80-90% of redundant `/api/users` calls, significantly faster page navigation
- [ ] Implement server-side sorting and filtering
- [ ] Add database indexing for performance
- [ ] Implement pagination for large datasets
- [ ] Optimize query performance
- [ ] Add caching strategies
- [ ] Performance testing and monitoring

### Stage 9: Restaurant-Centric Architecture ✅ COMPLETE
**Duration:** ~1 week  
**Dependencies:** Stage 5–7 foundations

#### Summary (see also Current Status journal below)
- [x] `restaurants`, `dish_availability_channels`, `dish_delivery_apps` tables; `dishes.restaurant_id`
- [x] `RestaurantInput` (Google Maps + cloud kitchen), automatic In-Store vs Online logic
- [x] APIs: `/api/restaurants`, `/api/dishes/availability-channels`, `/api/dishes/delivery-apps`
- [x] Data migration from legacy dish-level restaurant fields
- [x] Updated `DishCard`, add-dish, edit-dish for new model

### Stage 9.1: Middle East Delivery App Expansion ✅ COMPLETE
**Dependencies:** Stage 9

- [x] Noon, Careem, Talabat + 7 countries (see detailed journal in Current Status Summary)
- [x] BUG-021 city format parsing for delivery app region detection

### Stage 11: Security Updates ✅ COMPLETE
- [x] React2Shell (CVE-2025-55182): `react` / `react-dom` → 19.2.1 (see SECURITY-001 in `Docs/Bug_tracking.md`)

### Stage 12: Landing Page, `/app` URL Split, LinkedIn Invites & Optional Photo UX ✅ COMPLETE
**Status:** ✅ Complete (May 2026). User-approved copy in `components/landing-page.tsx`. Spec archive: **`Docs/landing-page-spec-final.yaml`**. QA preview while logged in: `/?preview=landing`.
**Duration:** 2-3 days
**Dependencies:** Stages 1–9.1 and 11 complete (core app functional)

#### Goals
1. **Welcome page at `/`** — Dark, high-contrast, PRD-aligned copy; visually strong (not a gray text column).
2. **App (dish discovery) at `/app`** — Move current homepage feed from `/` to `/app` without changing feed behavior.
3. **LinkedIn for invite requests** — "Request invite" opens founder LinkedIn in a new tab (manual approval; selective community).
4. **Optional photos UX** — Messaging + honest dish cards when no photo (building the trusted list matters more than images).
5. **Invite stewardship** — Note on Account page above user's 5 invite codes.
6. **Cross-nav** — Browse dishes on landing; About on logged-out app header.

#### Product decisions (locked)
| Topic | Decision |
|-------|----------|
| Primary audience | Serious gym-goers who depend on outside food for gains and want to help people like them |
| Invite flow | User messages on LinkedIn → founder manually sends invite code |
| LinkedIn URL | `https://www.linkedin.com/in/ashutoshbhosale/` |
| Exclusivity | Highly selective; not open to everyone; say this clearly on landing |
| Cities | Global framing; encourage "be first in your city" (no city list on landing) |
| Landing visual | **Dark** theme (`.dark` tokens); WCAG AA contrast — white on black, **white text on red buttons** (not black on `#ff3333`) |
| Browse CTA on landing | **Yes** — secondary link/header → `/app`; primary CTA remains request invite |
| Signup secondary CTA | "Already have an invite code?" → `/signup` |
| Footer / legal | Out of scope for v1 |
| Copy source | `PRD.md`; as-built in **`components/landing-page.tsx`** (see **`Docs/landing-page.md`**) |

#### Part A — Move dish discovery to `/app`
- [x] Move `app/page.tsx` → `app/app/page.tsx` (same feed logic; new URL only).
- [x] Create shared route constants in `lib/constants.ts`:
  - `ROUTES.landing` = `/`
  - `ROUTES.app` = `/app`
  - `ROUTES.signup` = `/signup`
  - `INVITE_LINKEDIN_URL` = `https://www.linkedin.com/in/ashutoshbhosale/`
- [x] Update all "product home" links from `/` to `/app`:
  - [x] `components/header.tsx` — logo + "Discover" (when pointing at feed)
  - [x] `components/bottom-navigation.tsx` — Discover tab
  - [x] `app/verify-otp/page.tsx` — after successful login / existing user signup
  - [x] `app/complete-profile/page.tsx` — after profile complete + already-complete redirect
  - [x] `app/add-dish/page.tsx` — after successful dish submit
  - [x] `app/auth/callback/route.ts` — default `next` param → `/app` (not `/`)
- [x] Update recovery links where "home" means the app:
  - [x] `app/not-found.tsx`
  - [x] `app/error.tsx`
- [x] Grep repo for remaining `href="/"` and `push('/')` that mean feed (not landing).

#### Part B — Welcome page at `/`
- [x] New `app/page.tsx` — marketing/welcome page (do **not** use `MainLayout` / bottom nav).
- [x] `components/landing-redirect.tsx` (session redirects).
- [x] **`components/landing-page.tsx`** (from **`Docs/landing-page-spec-final.yaml`**, user-edited hero copy):
  - [x] Dark root (`className="dark"`), hero glow, card sections (`#141414`), sticky mobile CTA bar
  - [x] Copy from spec: hero, pain grid, value columns, who + invite + 5 codes, final CTA
  - [x] Contrast: white on red buttons; body subheads `text-foreground/80` where long
  - [x] Header: Browse dishes → `/app`
  - [x] LinkedIn: `<a target="_blank">` + helper under button
  - [x] Secondary: "Already have an invite code?" → `/signup`
- [x] Per-route metadata on `/` (from spec); discover metadata on `/app` via `app/app/layout.tsx`.

#### Part B.1 — App header cross-link (Phase 2)
- [x] Logged-out `components/header.tsx`: **About** → `/` (visible mobile + desktop)

#### Part C — Logged-in visitors on `/` (redirect rules)
Show a loading state while login status is unknown. Then:
| User state | Action |
|------------|--------|
| Not logged in | Show welcome page |
| Logged in, profile incomplete | Redirect to `/complete-profile` |
| Logged in, profile complete | Redirect to `/app` |

**Implementation notes:**
- Prefer `router.replace()` (not `push`) so Back button doesn't trap users on welcome page after login.
- Post-auth flows (verify-otp, complete-profile, add-dish) should go **directly to `/app`** so users don't depend on welcome-page redirect.
- Do **not** block incomplete-profile users from `/app` unless product decision changes later (current app allows browse mid-signup).

#### Part D — LinkedIn invite CTAs (replace signup misdirects)
- [x] `components/ui/be-first-modal.tsx` — "Request Invite" → `INVITE_LINKEDIN_URL` (new tab), not `/signup`
- [x] `app/app/page.tsx` — empty-state "Request Invite Code" opens modal (unchanged trigger; fixed destination)
- [x] Remove dead `handleBeFirst` → `/signup` in feed
- [x] `app/signup/page.tsx` — helper: "Don't have a code? Request an invite on LinkedIn"
- [x] Welcome page primary button → LinkedIn (new tab)

#### Part E — Optional photos (UX only; API already allows null `image_url`)
- [x] `app/add-dish/page.tsx` — label photo as optional; short copy: skip if you don't have one; list > photos
- [x] `components/dish-card.tsx` — when no `image_url`: neutral no-photo layout (icon + dish name / protein), **not** stock meal image
- [x] Remove misleading fallback `delicious-high-protein-meal.jpg` when mapping dishes:
  - [x] `app/app/page.tsx` (after move)
  - [x] `app/my-dishes/page.tsx`
  - [x] `app/api/wishlist/route.ts` (transform)
- [x] Pass `imageUrl` explicitly; removed `DishCard` default stock meal image
- [x] Landing copy mentions photos are not required (Part B)

#### Part F — Account invite codes stewardship
- [x] `app/account/page.tsx` — callout **above** "Your Invite Codes":
  - You receive 5 codes after joining
  - Only share with regular gym-goers who eat out for gains and will contribute
  - Same selective standard as you; don't invite random people

#### Part G — Documentation (after implementation)
- [x] `Docs/landing-page.md` — as-built summary
- [x] `Docs/landing-page-spec-final.yaml` — copy/layout spec archive
- [x] Update `Docs/project_structure.md` — `/` = landing, `/app` = discover feed
- [x] Update `Docs/UI_UX_doc.md` — Discover nav href → `/app`
- [x] Update `Docs/PRE_LAUNCH_CHECKLIST.md` — landing page verified

#### Out of scope (Stage 12)
- Footer, privacy policy, contact page
- Framer Motion / heavy animation (optional later)
- Dish screenshots / proof gallery on landing
- Forcing profile completion before browsing `/app`
- Sanitizing `auth/callback` `next` open-redirect (separate hardening task)

#### Manual testing checklist
- [x] Logged out: `/` dark landing, no bottom nav (user verified May 2026)
- [x] Browse dishes / About cross-links
- [x] `/app` feed; auth redirects to `/app` or `/complete-profile`
- [x] LinkedIn invite CTAs; signup helper; optional-photo UX; account stewardship note

#### Files expected to change (implementation reference)
| Area | Files |
|------|--------|
| Routes | `app/page.tsx` (new landing), `app/app/page.tsx` (moved feed) |
| Constants | `lib/constants.ts` (new) |
| Nav | `components/header.tsx`, `components/bottom-navigation.tsx` |
| Auth redirects | `app/verify-otp/page.tsx`, `app/complete-profile/page.tsx`, `app/auth/callback/route.ts` |
| CTAs | `components/ui/be-first-modal.tsx`, `app/signup/page.tsx` |
| Photos | `components/dish-card.tsx`, `app/add-dish/page.tsx`, `app/my-dishes/page.tsx`, `app/api/wishlist/route.ts` |
| Account | `app/account/page.tsx` |
| Errors | `app/not-found.tsx`, `app/error.tsx` |
| Docs | `Docs/landing-page.md`, `Docs/project_structure.md`, `Docs/UI_UX_doc.md` |

### Stage 13: App-Wide Dark Theme (Match Landing) ✅ COMPLETE  
**Duration:** 2–3 days  
**Dependencies:** Stage 12 complete  

#### Locked product / design decisions
| Decision | Choice |
|----------|--------|
| Theme mode | **Dark only** (no light mode, no user toggle for v1) |
| Brand red | **`#ff3333`** everywhere (landing `.dark` primary; retire light `#cc0000` on `:root`) |
| Primary button label | **`text-white`** on `bg-primary` (never black `primary-foreground` on red) |
| Typography | **Rethink Sans** (already global via `app/layout.tsx`; no change) |
| App header | **Match landing:** sticky, `bg-background/90 backdrop-blur-sm`, `border-b`, `h-16`, `max-w-5xl`, logo `text-xl` extrabold uppercase |
| Landing | Keep copy/layout; remove redundant inner `className="dark"` after global dark (optional cleanup) |
| Routing / auth | **No behavior changes** (redirects, `/app`, LinkedIn CTAs unchanged) |

#### Why the app looks wrong today
- Landing wraps `className="dark"` locally → uses `.dark` tokens in `app/globals.css`.
- App routes use `:root` **light** tokens (white `#ffffff` background, `#cc0000` primary).
- Many screens use **hardcoded light Tailwind colors** (`bg-green-50`, `bg-red-50`, `bg-blue-600`, etc.) that will not flip with tokens.
- Shadcn `Button` default uses `text-primary-foreground`; in `.dark` that is **black on `#ff3333`** (WCAG fail). Landing already overrides with `text-white`.

#### Target design tokens (single palette on `:root`)
Collapse landing dark values into `:root` so the whole app is dark without per-page wrappers:

| Token | Value | Role |
|-------|--------|------|
| `background` | `#0a0a0a` | Page |
| `foreground` | `#ffffff` | Headlines, primary UI text |
| `card` | `#141414` | Cards, header, bottom nav |
| `popover` | `#1a1a1a` | Select, dialog, dropdown surfaces |
| `muted` | `#1f1f1f` | Input fills, chips, empty image areas |
| `muted-foreground` | `#a0a0a0` | Captions, helpers, placeholders (short text only) |
| `border` / `input` | `#2a2a2a` | Borders |
| `primary` | `#ff3333` | Brand red (unified) |
| `primary-foreground` | `#ffffff` | Text/icons on primary buttons |
| `ring` | `#ff3333` | Focus rings |
| `destructive` | `#ff3333` | Errors (or keep distinct if needed) |
| `secondary` / `accent` | Keep landing dark oranges/yellows | Sparingly (icons, charts; not small body text on black) |

**Text hierarchy (match landing):**
- Long secondary copy: `text-foreground/75`
- Short captions: `text-muted-foreground`
- Nav links inactive: `text-muted-foreground hover:text-foreground`

#### WCAG contrast rules (enforce in code review)
| Pairing | Rule |
|---------|------|
| `foreground` on `background` | Default body/headings |
| `foreground/75` on `background` | Paragraphs, card descriptions |
| `muted-foreground` on `background` | One-line helpers only (~5.2:1 on `#0a0a0a`) |
| `text-white` on `primary` (`#ff3333`) | All primary CTAs (~5.9:1 AA) |
| `text-primary` on `background` | Links; verify if borderline |
| Focus | Visible `ring-ring` on inputs/buttons |

#### Implementation phases

##### Part A — Global foundation
- [ ] `app/globals.css`: Move dark token set to `:root`; set `--primary: #ff3333`, `--primary-foreground: #ffffff`; align sidebar/chart/destructive to same red family.
- [ ] `app/layout.tsx`: Add `className="dark"` to `<html>` (or rely on `:root` only if `.dark` block removed); set Sonner `<Toaster theme="dark" />` (today: no theme, `richColors` only).
- [ ] `components/ui/button.tsx`: Default variant `text-white` on `bg-primary` (belt-and-suspenders).
- [ ] `components/ui/badge.tsx`, `checkbox.tsx`: Same primary-foreground fix if used on red.
- [ ] Add semantic utility classes in `globals.css` (or small `components/ui/alert-banner.tsx`):
  - `alert-success`, `alert-error`, `alert-info` using `bg-card` + tinted border (no `*-50` light washes).
- [ ] `globals.css`: Dark-tuned shadows for `.comment-tray-3d` (lighter shadows on dark bg).
- [ ] **Google Maps Places** (`globals.css`): Style `.pac-container`, `.pac-item`, `.pac-item-selected` (dark bg, light text, `border-border`) — used by `restaurant-search-input.tsx`, `city-search-input.tsx`, `use-google-places.ts`.
- [ ] Optional: `prefers-color-scheme` — not needed (dark-only).

##### Part B — App shell (match landing header)
- [ ] `components/header.tsx`: Sticky `top-0 z-50`, `bg-background/90 backdrop-blur-sm`, inner `max-w-5xl mx-auto px-6 h-16`; logo `text-xl`; Add Dish `text-white`; profile fallback avatar → on-brand (`from-primary/80 to-primary` or `bg-muted` + initials), not blue–purple gradient.
- [ ] `components/bottom-navigation.tsx`: Already `bg-card`; verify active/inactive contrast on dark.
- [ ] `components/main-layout.tsx`: `bg-background`; loading spinner uses tokens.
- [ ] `components/landing-page.tsx`: Remove redundant outer `dark` wrapper (optional, after global dark).
- [ ] `components/landing-redirect.tsx`: Simplify loading wrappers if redundant.

##### Part C — Shadcn / shared UI (`components/ui/`)
Audit each file; prefer tokens over hardcoded colors.

| File | Notes |
|------|--------|
| `button.tsx` | Part A |
| `input.tsx`, `textarea.tsx`, `label.tsx` | Placeholder/disabled on dark |
| `select.tsx`, `popover.tsx`, `dialog.tsx` | `bg-popover` surfaces |
| `card.tsx` | Default card |
| `checkbox.tsx`, `badge.tsx` | Primary contrast |
| `command.tsx` | If used in combobox patterns |
| `multi-select.tsx` | Dropdown |
| `delivery-app-pills.tsx` | Already `bg-muted` |
| `inline-city-selector.tsx` | Token-based; verify Select dropdown |
| `city-search-input.tsx` | Custom dropdown `bg-background` — OK; Maps pac CSS Part A |
| `restaurant-search-input.tsx` | Custom dropdown + Maps pac |
| `restaurant-input.tsx` | **Replace** blue/green/red-50 alert boxes with semantic alerts |
| `profile-picture-upload.tsx` | Replace `from-blue-400 to-purple-500` fallback |
| `be-first-modal.tsx` | Dialog + `bg-muted/50` blocks |
| `spinner.tsx` | Token borders |
| `avatar.tsx` | Fallback colors |

##### Part D — Core product components
| File | Hardcoded issues found (grep) |
|------|-------------------------------|
| `components/dish-card.tsx` | `bg-white/90` bookmark; `text-gray-600`; `bg-green-100`/`bg-blue-100` badges; `bg-green-600`/`bg-blue-600` action buttons; blue–purple avatar gradients |
| `app/app/page.tsx` | `bg-red-50` error banner; protein filter buttons (use fixed Button tokens) |
| `app/signup/page.tsx` | Green success circle; green/red-50 messages; green/red validation icons |
| `app/verify-otp/page.tsx` | green/red-50 messages |
| `app/complete-profile/page.tsx` | green/red-50 messages |
| `app/account/page.tsx` | `bg-green-100` invite pills; green copy feedback; AvatarFallback gradient |
| `app/edit-dish/[id]/page.tsx` | `bg-red-50` error; `text-green-600` success |
| `app/add-dish/page.tsx` | Submit spinner `border-white` on primary button (verify contrast) |

**DishCard action buttons (product decision in implementation):** Map Navigate / delivery CTAs to `bg-primary text-white` or `outline` variant — drop one-off `green-600` / `blue-600` so actions match brand.

##### Part E — Pages without MainLayout
| File | Notes |
|------|--------|
| `app/not-found.tsx` | Token-based; ensure primary Button uses white text |
| `app/error.tsx` | Same |
| `app/page.tsx` | Landing route only (no MainLayout) |
| `app/edit-dish/[id]/loading.tsx` | Uses MainLayout |

##### Part F — External / runtime UI
| Integration | File(s) | Action |
|-------------|---------|--------|
| **Sonner toasts** | `app/layout.tsx` | `theme="dark"`; test success/error toasts on dark bg |
| **Google Maps script** | `app/layout.tsx` | No theme API; CSS override for `.pac-container` (Part A) |
| **Google Maps deep links** | `dish-card.tsx` | No UI change |
| **Vercel Analytics** | `layout.tsx` | No theme impact |
| **User-uploaded images** | DishCard, profile | Unchanged; ensure borders `border-border` |
| **Emoji ratings** | `dish-card.tsx` | OK on dark (no color dependency) |

##### Part G — Documentation (after implementation)
- [ ] `Docs/UI_UX_doc.md` — Replace light-first palette; document dark-only, `#ff3333`, text roles, header spec, semantic alerts.
- [ ] `Docs/project_structure.md` — Note global dark theme on `layout.tsx`.
- [ ] `Docs/landing-page.md` — Note app shares same tokens (no longer “app stays light”).
- [ ] `Docs/PRE_LAUNCH_CHECKLIST.md` — Add “dark theme smoke test on production” if needed.

#### Out of scope (Stage 13)
- Light mode or theme toggle
- Re-designing landing copy or layout
- Changing routing, auth, or API behavior
- Redesigning DishCard information architecture (colors only unless bugs found)
- Google Maps embedded map tiles (only autocomplete dropdown + existing buttons)

#### Manual testing checklist (before marking complete)
- [ ] `/` landing unchanged visually (or intentionally aligned with app header)
- [ ] `/app` feed, filters, empty state, error banner on dark
- [ ] `/signup`, `/verify-otp`, `/complete-profile` — forms, success/error states readable
- [ ] `/add-dish`, `/edit-dish/[id]` — all steps, restaurant search dropdown (Maps pac), delivery pills
- [ ] `/account` — invite codes, profile picture upload fallback
- [ ] `/my-dishes`, `/my-wishlist` — grids and DishCards
- [ ] Modals: BeFirst, dish comment expand, dialogs
- [ ] Toasts (success/error) on dark
- [ ] Mobile bottom nav + sticky safe areas
- [ ] 404 / error pages
- [ ] Logged-in `/` still redirects to `/app`; `/?preview=landing` still works
- [ ] Primary buttons: white label on red everywhere
- [ ] No bright `*-50` alert boxes left on main flows

#### Files expected to change (reference)
| Area | Files |
|------|--------|
| Tokens / global | `app/globals.css`, `app/layout.tsx` |
| Shell | `components/header.tsx`, `components/bottom-navigation.tsx`, `components/main-layout.tsx` |
| UI primitives | `components/ui/button.tsx`, `badge.tsx`, `restaurant-input.tsx`, `profile-picture-upload.tsx`, (+ audit list Part C) |
| Product | `components/dish-card.tsx`, `app/app/page.tsx`, auth pages, `app/account/page.tsx`, `app/edit-dish/[id]/page.tsx` |
| Landing cleanup | `components/landing-page.tsx`, `components/landing-redirect.tsx` (optional) |
| Docs | `Docs/UI_UX_doc.md`, `Docs/project_structure.md`, `Docs/landing-page.md` |

#### Risk register
| Risk | Mitigation |
|------|------------|
| Maps autocomplete stays white | Dedicated `.pac-container` CSS in `globals.css` |
| Missed hardcoded color | Ripgrep `bg-green-\|bg-red-50\|bg-blue-\|text-gray-\|bg-white` before merge |
| Primary button regression | Single `button.tsx` fix + spot-check all `Button`/`asChild` links |
| Landing/app header double styles | Implement Part B spec once; compare side-by-side `/` vs `/app` |
| Contrast on orange/yellow accents | Use accent colors for decoration only, not small text on `#0a0a0a` |

### Stage 14: Code Quality, Performance & Security Hardening
**Status:** 📋 **PLANNED — begin after Stage 13 (dark theme) is complete**
**Duration:** 3–5 days
**Dependencies:** Stage 13 complete

> This stage addresses findings from the June 2026 static analysis audit. All items are actionable with no product-visible behaviour changes except the image optimisation (visible quality/speed improvement).

#### Priority 1 — Critical performance (do first)

##### 1A — Fix N+1 queries in dishes and wishlist APIs
**Files:** `app/api/dishes/route.ts:165–237`, `app/api/wishlist/route.ts:78–144`

- [ ] Replace per-dish `Promise.all` loop (user profile RPC + availability channels + delivery apps) with a single Supabase nested select:
  ```
  .select(`*, restaurants(*), dish_availability_channels(*, dish_delivery_apps(*))`)
  ```
- [ ] Batch-fetch all user profiles for returned dishes in one RPC call instead of one call per dish
- [ ] Remove the duplicate enhancement loop in `wishlist/route.ts` (same pattern as dishes route — extract into a shared `enhanceDishes()` utility)
- [ ] Measure query count before/after in Supabase dashboard logs

##### 1B — Replace `<img>` with `next/image`
**Files:** `components/dish-card.tsx:285,461,509,545,630,701`, `components/header.tsx:56`, `app/edit-dish/[id]/page.tsx:673`

- [ ] Swap all raw `<img>` tags to `<Image>` from `next/image`; set appropriate `width`/`height` or `fill` + `sizes`
- [ ] Add `priority` prop on the first dish card image in the feed (above-the-fold LCP)
- [ ] Ensure Supabase Storage domain is in `next.config.mjs` under `images.remotePatterns`

---

#### Priority 2 — High quality / architecture

##### 2A — Extract duplicated logic into shared utilities
**Files:** `app/api/dishes/route.ts`, `app/api/wishlist/route.ts`, `app/api/upload-profile-picture/route.ts`

- [ ] Create `lib/utils/storage.ts` with a single `extractImagePath(url: string, bucket: string): string` function; remove the two near-identical implementations in dishes and upload-profile-picture routes
- [ ] Create `lib/services/dish-service.ts` with `enhanceDishes(dishes)` — used by both the dishes API and wishlist API (resolves H2 + the N+1 fix from 1A)
- [ ] Create a single canonical `Dish` TypeScript interface in `lib/types/dish.ts` and update all import sites (currently defined in 5+ places)

##### 2B — Pull business logic out of components
**Files:** `app/app/page.tsx:512–570`, `app/add-dish/page.tsx:95–121`, `components/dish-card.tsx:134–198`

- [ ] Move filtering/sorting logic from `app/app/page.tsx` into `lib/utils/dish-filters.ts`
- [ ] Move image compression invocation from `app/add-dish/page.tsx` into a `useImageUpload()` hook in `lib/hooks/`
- [ ] Move deep-link and navigation helpers from `dish-card.tsx` into `lib/utils/navigation.ts`

---

#### Priority 3 — Medium security

##### 3A — Add input validation to API routes
- [ ] `app/api/users/route.ts:28` — add `maxLength: 100` check on `name`
- [ ] `app/api/feedback/route.ts:18` — add `maxLength: 2000` check on `message`; validate `type` is one of `['bug', 'feature', 'general']`
- [ ] `app/api/dishes/route.ts:61` — validate `protein_source` against the allowed ENUM values (read from a shared constant, not inline)
- [ ] `app/api/auth/signup/route.ts:21` — replace permissive email regex with `email-validator` package or a stricter RFC 5321 pattern

##### 3B — Extend rate limiting to remaining mutation endpoints
- [ ] Copy the existing rate-limit pattern from `app/api/auth/signup/route.ts` to:
  - `app/api/feedback/route.ts`
  - `app/api/dishes/report/route.ts`
  - `app/api/wishlist/route.ts` (write operations only)

##### 3C — Harden file upload MIME validation
- [ ] `app/api/upload-profile-picture/route.ts:60–68` — read the first 4 bytes of the uploaded buffer and check magic bytes (`ffd8ff` for JPEG, `89504e47` for PNG, `52494646` for WebP) in addition to the `file.type` check

---

#### Priority 4 — Medium quality / performance

##### 4A — Wrap DishCard in React.memo
- [ ] `components/dish-card.tsx` — wrap export with `React.memo`; verify bookmark toggle no longer re-renders the whole list in the feed

##### 4B — Surface silent errors
- [ ] `app/api/dishes/route.ts:36,357–361` — log image deletion failures to `console.error` and include a non-blocking warning in the API response JSON (`imageCleanupWarning`)
- [ ] `lib/auth/session-provider.tsx:58–61` — distinguish 404 (no profile yet) from 5xx (fetch error); set a separate `profileError` state for the latter

---

#### Manual testing checklist (before marking complete)
- [ ] Discover feed loads with ≤ 5 DB queries per page (verify in Supabase logs)
- [ ] Images on feed, DishCard, header load via `next/image` (confirm in Network tab — `/next/image` path)
- [ ] Bookmark a dish — only that card re-renders (React DevTools Profiler)
- [ ] Submit feedback with `message` > 2000 chars → 400 response
- [ ] Upload a `.txt` file renamed to `.jpg` → rejected by upload API
- [ ] Rate limit: >5 feedback submissions in a row → 429 response
- [ ] No TypeScript errors (`tsc --noEmit`)

#### Files expected to change
| Area | Files |
|------|--------|
| New utilities | `lib/utils/storage.ts`, `lib/utils/dish-filters.ts`, `lib/utils/navigation.ts`, `lib/types/dish.ts` |
| New hooks | `lib/hooks/use-image-upload.ts` |
| New service | `lib/services/dish-service.ts` |
| API routes | `app/api/dishes/route.ts`, `app/api/wishlist/route.ts`, `app/api/users/route.ts`, `app/api/feedback/route.ts`, `app/api/dishes/report/route.ts`, `app/api/upload-profile-picture/route.ts`, `app/api/auth/signup/route.ts` |
| Components | `components/dish-card.tsx`, `components/header.tsx`, `app/app/page.tsx`, `app/add-dish/page.tsx`, `app/edit-dish/[id]/page.tsx` |
| Config | `next.config.mjs` (image remote patterns) |

#### Stage index update
> After completing this stage, update the Stage index table at the top of this file to add:
> `| 14 | Code quality, performance & security hardening | ✅ Complete |`

---

## Current Status Summary

> **Changelog vs stages:** Older entries below are a historical journal. For authoritative stage status, use the **Stage index** and **Implementation Stages** sections above.

### ✅ Completed (Stages 1-4.5)
- **Foundation & Setup**: Supabase integration, database schema, authentication
- **Core Authentication**: Email OTP, invite codes, user management (FEATURE-022)

- **Dish Functionality**: CRUD operations, image uploads, data validation
- **Dynamic Data**: Live API connections, session handling, route protection
- **Security & UX**: Profile API hardening (BUG-002), personalized greetings, city persistence (BUG-001)

### ✅ Completed (Stage 5 - Partial)
- **Delivery Apps**: Multi-select era → auto-apply by region (FEATURE-023); deep linking + 16 apps
- **UI/UX Improvements**: Styling fixes, alignment improvements, design system consistency
- **Form Enhancements**: Restaurant name field, optional URL field
- **Data Quality**: Removed all mock data, improved error handling, database-only data source
- **Wishlist Management**: Complete wishlist API, bookmark persistence, My Dishes filtering fix, RLS policies
- **Dish Management**: Edit and delete functionality with conditional UI, ownership validation, RLS policies, form field order consistency
- **Invite Codes Security**: RLS policies implemented for invite_codes table to prevent unauthorized access
- **Invite Codes Display**: Complete invite codes functionality with status indicators, visual feedback, and proper API integration
- **Typography System**: Rethink Sans font implementation with Google Fonts integration, responsive sizing, and consistent letter spacing

### ✅ Completed (Stage 5 - Full Completion)
- **Google Maps Integration**: Complete restaurant search with Places API
- **Location Services**: Geolocation permission handling with smart fallbacks
- **Restaurant Search Component**: Advanced autocomplete with Google Maps data

### ✅ Completed (Stage 6 - Recent Progress)
- **Auto-Update City Selection**: Account settings now auto-save city changes without manual save button
- **Server-Side City Filtering**: All pages (Discover, My Dishes, My Wishlist) now filter by user's current city
- **Authentication Flow Fixes**: Resolved login/logout redirect issues and protected route handling
- **Toast Notification Enhancement**: Fixed positioning and added smooth animations for city update feedback
- **Homepage Loading Fix**: Resolved infinite loading state for non-logged-in users

### ✅ Completed (Stage 8 - Performance Optimization)
- **User Data Caching**: Implemented event-based caching in SessionProvider (no time expiration) to prevent redundant API calls
- **Page Navigation Optimization**: Removed redundant `/api/users` calls from all pages, using cached SessionProvider data
- **Cache Invalidation**: Added intelligent cache invalidation when user updates city or profile picture in account settings
- **Performance Improvement**: Achieved 80-90% reduction in unnecessary API calls, faster page loads

### ✅ Completed (Stage 8.1 - Event-Based Caching Optimization)
- **Improved Caching Strategy**: Removed unnecessary 5-minute time expiration from user data cache
- **Event-Based Cache Invalidation**: Cache now persists until user data actually changes
- **Enhanced Performance**: Maximum performance benefit with minimal risk approach
- **Smart Cache Management**: Cache clears only on meaningful events (city change, profile update, sign out)
- **User Experience**: Instant page loads with cached data until user makes changes

### ✅ Completed (Stage 8.2 - React Warning Fix)
- **Fixed Console Warning**: Resolved "uncontrolled to controlled input" warning in RestaurantSearchInput component
- **Type Safety Improvements**: Updated interface to accept optional string values with proper fallbacks
- **Input Component Stability**: Ensured input fields always receive string values, preventing React warnings
- **Code Quality**: Eliminated console warnings for cleaner development experience

### ✅ Completed (Stage 8.3 - Surgical Cache Update Functions)
- **Problem Fixed**: City and profile picture changes not propagating to other pages without browser reload
- **Added updateUserCity()**: Updates only city field in userProfile state without re-fetching entire profile
- **Added updateUserProfilePicture()**: Updates only profile picture field without re-fetching entire profile
- **Surgical Updates**: Each function updates only the changed field, preserving cached values for other fields
- **Performance**: No additional API calls, instant updates without loading states
- **User Experience**: Name remains cached when city changes, no unnecessary loading flickers
- **Files Modified**: `lib/auth/session-provider.tsx`, `app/account/page.tsx`

### 🚧 Deferred (not blocking MVP)
- **Server-side** sorting and filtering (Stage 8)
- **Stage 7** UI Phase 3.2 / 3.3 nav and card animations
- Upload retry, real upload progress, CDN/PWA (see Future Performance section — compression already shipped)

### 📋 Next Steps
1. **Stage 14** — Code quality, performance & security hardening (see stage plan above)
2. Optional V2: server-side sort/filter, recommendation system (`FEATURE-Recommendation-System.md`)
3. Pre-launch: remaining items in `Docs/PRE_LAUNCH_CHECKLIST.md`

### 🚧 Critical Bug Fixed (January 30, 2025 - Morning)
**What We Actually Fixed Today (Morning):**
- **Invite Code System Restored**: Fixed critical 404 errors preventing user signup
- **Modern Security Implementation**: Implemented Secret API key replacing legacy service role approach
- **Database Policies Fixed**: Created missing INSERT policy for users table  
- **Service Architecture**: Added new service client pattern for admin operations
- **Signup Flow Verified**: Complete end-to-end user onboarding confirmed working

**Current Status**: Critical blocking bug resolved. Application can accept new users again.

### 🎯 Major UI/UX Improvements Completed (January 30, 2025 - Afternoon)
**Authentication Flow & User Experience Enhancements:**
- **ProtectedRoute Enhancement**: Added `isRedirecting` state to prevent race conditions during authentication redirects
- **Conditional Navigation**: Updated Header and BottomNavigation components to show appropriate links based on user authentication status
- **Homepage Loading Fix**: Resolved infinite "Loading..." state for non-logged-in users by properly handling default states
- **Environment-Aware Greeting**: Different messages for authenticated vs unauthenticated users on homepage

**City Management & Filtering Improvements:**
- **Auto-Update City Selection**: Removed manual "Save Changes" button from account settings, implemented optimistic updates with toast feedback
- **Server-Side City Filtering**: Added city-based filtering to all APIs (Discover, My Dishes, My Wishlist) for consistent user experience
- **RPC Authorization Fix**: Maintained existing `get_user_name_by_id` functionality while adding security with service key authorization

**Toast Notification System Enhancement:**
- **Positioning Fix**: Changed from `bottom-center` to `top-center` to prevent overlap with mobile bottom navigation
- **Animation Enhancement**: Added smooth slide-in/out animations with `expand={true}` and optimized `gap` transitions
- **Accessibility Compliance**: Implemented `richColors={true}` and proper `duration` for WCAG compliance
- **Mobile-Friendly Offset**: Added 16px top offset for optimal mobile positioning

### ✅ Completed (Stage 9 — Restaurant-Centric Architecture)
**Major Architecture Overhaul - Restaurant-Centric Schema Implementation:**  
*(Also documented under Implementation Stages → Stage 9.)*

- **Database Schema Redesign**: Implemented new restaurant-centric architecture with 4 new tables:
  - `restaurants` table for centralized restaurant data (Google Maps + manual entries)
  - `dish_availability_channels` table for flexible availability (In-Store, Online, Both)
  - `dish_delivery_apps` table for delivery app associations
  - Updated `dishes` table with `restaurant_id` foreign key

- **Automatic Availability Logic**: Simplified user experience with intelligent defaults:
  - Google Maps restaurants automatically get "In-Store" availability
  - Manual entries (cloud kitchens) automatically get "Online" availability only
  - Delivery app selection automatically creates "Online" availability
  - No more manual availability checkboxes for users

- **Data Migration**: Successfully migrated existing data from old schema to new restaurant-centric structure:
  - Created restaurant records from existing unique restaurant_name + city combinations
  - Migrated availability channels and delivery apps to new tables
  - Preserved all existing dish data and relationships

- **API Endpoints**: Created new RESTful endpoints for restaurant management:
  - `/api/restaurants` for restaurant creation and retrieval
  - `/api/dishes/availability-channels` for availability channel management
  - `/api/dishes/delivery-apps` for delivery app associations

- **Frontend Components**: Updated all forms and components:
  - New `RestaurantInput` component with Google Maps integration and manual entry
  - Simplified add-dish and edit-dish forms with automatic availability logic
  - Updated `DishCard` component to display new availability structure
  - Removed unnecessary availability checkboxes and manual selections

- **Type Safety**: Added comprehensive TypeScript interfaces:
  - `RestaurantInput` and `Restaurant` types for restaurant data
  - Updated `Dish` interface with new restaurant-centric fields
  - Maintained backward compatibility during transition

- **Benefits Achieved**:
  - **Eliminated Data Duplication**: Same restaurant appears only once in database
  - **Simplified User Experience**: No manual availability type selection required
  - **Better Data Integrity**: Centralized restaurant data with proper relationships
  - **Flexible Availability**: Dishes can be available in multiple channels simultaneously
  - **Future-Proof Architecture**: Easily extensible for new availability channels

### ✅ Completed (Stage 11 — Security Updates)
**React2Shell (CVE-2025-55182) Remediation:**  
*(Also documented under Implementation Stages → Stage 11.)*
- **Issue**: Application was using vulnerable React 19.1.1 version with Next.js App Router (Server Components).
- **Resolution**: Updated `react` and `react-dom` to patched version `19.2.1`.
- **Constraint**: Maintained `next` at `14.2.25` for stability using `--legacy-peer-deps`.
- **Validation**: Verified build and type safety, deployed to Vercel production.
- **Documentation**: Logged as [SECURITY-001] in Bug_tracking.md.

### ✅ Completed (Stage 9.1 — Middle East Delivery App Expansion)
**Middle East Market Integration - Noon, Careem, and Talabat:**  
*(This work was previously labeled “Stage 10” in the changelog; renumbered to **Stage 9.1** so **Stage 12** can be used for the landing page.)*

- **New Delivery Apps Added**: Integrated 3 major Middle East delivery platforms:
  - **Noon Food**: UAE, Saudi Arabia, Egypt (3 countries)
  - **Careem**: UAE, Saudi Arabia, Qatar, Oman, Egypt, Pakistan, Jordan (7 countries)
  - **Talabat**: Kuwait, Bahrain, UAE, Oman, Qatar, Jordan, Egypt, Iraq (8 countries)

- **Geographic Expansion**: Added support for 7 new countries:
  - Saudi Arabia, Egypt, Kuwait, Bahrain, Oman, Jordan, Iraq
  - Updated existing countries (UAE, Qatar, Pakistan) with new delivery options

- **Technical Implementation**:
  - Official WebP logos for Noon, Careem, Talabat (`public/logos/*.webp`)
  - Updated `DELIVERY_APPS_BY_COUNTRY` mapping with all new countries and apps
  - Updated `DELIVERY_APP_LOGOS` mapping with new logo paths
  - Added deep link schemes: `noon://`, `careem://`, `talabat://`
  - Added web fallback URLs for all three apps
  - Updated `delivery_apps_by_country.md` documentation

- **Country Name Format Verification**:
  - Used full country names per Google Maps API standard (e.g., "Saudi Arabia", "United Arab Emirates")
  - Consistent with existing country name handling (from BUG-020 fix)

- **Critical Bug Fix (BUG-021)**: Google Maps API City Format Variations
  - **Issue**: Delivery apps not showing for UAE and Saudi Arabia cities
  - **Root Cause**: Google Maps returns different formats - dash separator ("Dubai - United Arab Emirates"), space only ("Riyadh Saudi Arabia"), or comma ("Doha, Qatar")
  - **Solution**: Enhanced `extractCountryFromCity()` to handle all three format variations
  - **Impact**: Enabled delivery app functionality for all Middle East countries
  - **Files Fixed**: `lib/delivery-apps.ts`

- **Total Delivery Apps**: Expanded from 13 to 16 delivery apps
- **Total Countries**: Expanded from 52 to 59 countries supported

### ✅ Completed (BUG-022 - Cloud Kitchen Edit Form Fix)
**Cloud Kitchen Manual Entry Mode Auto-Detection:**

- **Issue**: Edit form not showing manual entry mode for cloud kitchen dishes
- **Root Cause**: `RestaurantInput` component always initialized `isManualEntry` state as `false`
- **Solution**: Initialize state based on incoming value prop: `useState(value?.type === 'manual')`
- **Impact**: Users can now edit cloud kitchen dishes without extra manual steps
- **Files Fixed**: `components/ui/restaurant-input.tsx`
- **Result**: Form automatically shows manual entry mode with pre-filled restaurant name

### ✅ Completed (UX-001 - Restaurant Input UI/UX Improvements)
**Mobile Overflow Fix & Consistent Design Between Modes:**

- **Issue 1**: "Can't find restaurant?" text overflowing on mobile devices
- **Issue 2**: Inconsistent layouts between Google Maps mode and Cloud Kitchen mode
- **Issue 3**: Confusing "Manual Entry" terminology and irrelevant technical messages
- **Solutions Implemented**:
  - Fixed mobile overflow: Shortened text, added proper wrapping, responsive sizing
  - Renamed "Manual Entry" → "Cloud Kitchen Entry" with cloud icon
  - Moved mode toggle below input in both modes for consistency
  - Removed technical message box about backend setup
  - Added Search icon to "Search on Google Maps instead" link
  - **Final Updates**: Reverted to Plus icon for better UX indication, moved location prompt inside bordered container for visual consistency
- **Impact**: Better mobile UX, consistent design, clearer terminology, professional polish
- **Files Modified**: `components/ui/restaurant-input.tsx`
- **Result**: Seamless, consistent experience across both Google Maps and Cloud Kitchen modes with unified visual containers

### ✅ Completed (FEATURE-019 - Official Delivery App Logos Integration)
**Official Logo Integration with WebP Format:**

- **Issue**: Placeholder SVG logos were being used for all delivery apps
- **Solution**: Downloaded official logos for all 16 delivery apps in WebP format for optimal performance
- **Implementation**:
  - Downloaded official logos for: Swiggy, Zomato, Uber Eats, DoorDash, Grubhub, Postmates, Just Eat, Deliveroo, Grab, Foodpanda, iFood, PedidosYa, Rappi, Noon, Careem, Talabat
  - Updated `DELIVERY_APP_LOGOS` mapping in `lib/delivery-apps.ts` to use `.webp` extensions
  - Kept `placeholder.svg` as SVG for fallback scenarios
  - WebP format provides better compression and faster loading compared to SVG placeholders
- **Impact**: Professional appearance with official branding, improved performance with optimized WebP format
- **Files Modified**: `lib/delivery-apps.ts`, `public/logos/*.webp` (16 new files)
- **Result**: All delivery apps now display with their official logos, enhancing brand recognition and user experience

### ✅ Completed (FEATURE-020 - Client-Side Image Compression)
**Performance Optimization for Image Uploads and Page Loading:**

- **Problem 1**: Slow form submission due to large image uploads (5-10MB photos taking 30-60 seconds)
- **Problem 2**: Slow page loading on discovery/my-dishes/wishlist pages due to large images
- **Solution**: Implemented smart client-side image compression with quality preservation
- **Implementation**:
  - Created `lib/image-compression.ts` utility with adaptive compression settings
  - Integrated silent background compression into Add Dish and Edit Dish forms
  - Smart quality detection prevents over-compressing already optimized images
  - Compression runs during form filling, invisible to users
  - Fallback to original file if compression fails
- **Compression Settings**:
  - Files < 500KB: Skip compression (already optimized)
  - Files 500KB-1MB: Quality 0.95, maxWidth 1400px (minimal compression)
  - Files 1-3MB: Quality 0.9, maxWidth 1400px (gentle compression)
  - Files 3-8MB: Quality 0.85, maxWidth 1200px (recommended - balances quality and size)
  - Files > 8MB: Quality 0.8, maxWidth 1200px (more aggressive)
- **Results**:
  - Upload time: 30-60 seconds → 5-8 seconds (6-10x faster)
  - File size: 5-10MB → 800KB-1.2MB (85-90% reduction)
  - Page load speed: Much faster discovery/my-dishes/wishlist pages
  - Quality: 95%+ visual quality preserved
  - User experience: Seamless, no UI clutter, handles edge cases gracefully
- **Files Modified**: `lib/image-compression.ts` (new), `app/add-dish/page.tsx`, `app/edit-dish/[id]/page.tsx`
- **Impact**: Dramatically improved upload performance and page loading speeds while maintaining image quality

### ✅ Completed (BUG-025 - Signup/Login Page UI Integration)
- Integrated signup/login pages with MainLayout for seamless app experience, removed redundant branding, moved titles outside cards, optimized mobile header, and enhanced bottom navigation highlighting

### ✅ Completed (BUG-024 - Distance-Based Sorting Implementation)
- Complete overhaul of sorting system with distance range selection (5km, 10km, 25km, 50km, Whole City) and simplified sorting options (Nearest, Cheapest, Most Expensive)

### ✅ Completed (BUG-023 - Sorting UI/UX Improvements and Location Permission Handling)
- Simplified sorting interface with single clear dropdown, fixed mutual exclusivity issues, enhanced location permission handling for "Always Allow" users

### ✅ Completed (FEATURE-023 - Auto-Apply Delivery Apps & Reporting System)
- Auto-apply all available delivery apps for user's city to dishes (removed manual selection from add/edit forms)
- Delivery app reporting system: users report unavailable apps, auto-removal when 2+ unique users report (restaurant-level)
- New `restaurant_delivery_app_reports` table (see `DATABASE_SCHEMA.md`)

### ✅ Completed (FEATURE-024 - App Logo Integration)
- Added logo as favicon (`app/icon.svg`) and general asset (`public/hypertropher-logo.svg`), updated `app/layout.tsx` metadata

### ✅ Completed (FEATURE-025 - Image Deletion on Delete/Update)
- Dish images automatically deleted from storage when dishes are deleted (`app/api/dishes/route.ts`)
- Profile pictures automatically deleted from storage when updated (`app/api/upload-profile-picture/route.ts`)
- Fixed RLS policy for `profile-pictures` bucket DELETE operation (UUID prefix matching)
- Removed redundant cross icon from profile picture upload component

### ✅ Completed (FEATURE-022 - Authentication Migration to Email)
- Migrated from phone to email authentication (email+OTP)
- Added `email` column to `users` table, made `phone` nullable (see `DATABASE_SCHEMA.md`)

### ✅ Completed (FEATURE-026 - Authentication Simplification for MVP)
- Removed Google OAuth (had auth bugs - see BUG-041). Removed email+password auth. Only Email OTP authentication remains. Created OTP verification page and API. Invite code validation/invalidation remains functional.

### ✅ Completed (FEATURE-027 - Pre-Launch Security & Infrastructure)
- Added security headers to `next.config.mjs` (HSTS, XSS protection, frame options, etc.)
- Created custom error pages (`app/not-found.tsx`, `app/error.tsx`)
- Enhanced SEO metadata in `app/layout.tsx` (Open Graph, Twitter Cards)
- Implemented basic feedback system (form in Account page, API endpoint, database table)

### 🎯 MVP Status: ~99% Complete (pre–Stage 12 landing)
The core app is working in production: restaurant-centric schema, email OTP + invite codes, landing at `/` and discover feed at `/app` (Stage 12), public browse + city picker (FEATURE-021), wishlist, my dishes, add/edit/delete, 16 delivery apps with deep links, client-side compression (FEATURE-020), session caching (Stage 8), security headers and error pages (FEATURE-027).

#### Legacy checklist (superseded — kept for history)
- [x] Deploy to Vercel — done
- [x] Invite code verification feedback — done
- [x] Secure invite code passing — done
- [x] Auth UX improvements — done
- [x] Non-logged-in city selection (FEATURE-021) — done
- [ ] Comprehensive testing — ongoing
- [ ] Server-side performance items — deferred

## Future Feature Enhancements

### Google OAuth Authentication (Medium Priority)
**Status:** Planned for Future Implementation  
**Removed from MVP:** January 2025

**Overview:**
Re-implement Google OAuth authentication with proper invite code validation and authorization checks. Previous implementation had authentication/authorization bugs that allowed unauthorized access.

**Key Requirements:**
- Invite code validation must occur BEFORE OAuth initiation (server-side)
- Proper user profile check in auth callback to prevent unauthorized access
- Invite code storage and retrieval for OAuth signup flow
- Full integration with existing invite code invalidation system
- Must prevent users from accessing app without valid invite code and completed profile

**Previous Issues:**
- Users could log in with Google without invite code, creating Supabase Auth users but no app profile
- OAuth callback allowed partial access before profile completion
- Invite code validation was client-side only, allowing bypass
- Users could see full navigation without completing profile

**Implementation Notes:**
- Validate invite code server-side in `/api/auth/google` BEFORE initiating OAuth
- Store invite code in secure session/cookie during OAuth flow
- Verify user has completed profile in auth callback before allowing access
- Ensure ProtectedRoute properly enforces full profile completion

### Recommendation System (High Priority)
**Status:** Planned  
**Documentation:** See [FEATURE-Recommendation-System.md](./FEATURE-Recommendation-System.md)

**Overview:**
Separate dish validation from personal wishlist functionality by introducing a recommendation system. This allows users to explicitly recommend dishes they've tried, creating permanent community validation signals while keeping wishlists as temporary personal planning tools.

**Key Benefits:**
- Protects valuable dishes based on recommendations (not wishlists)
- Enables friend-based filtering and social proof features
- Allows dish deletion when not recommended (simplifies spam cleanup)
- Aligns with long-term vision of friend-based discovery

**Core Concept:**
- **Wishlist:** "I want to try this" (temporary, personal, can be removed)
- **Recommendation:** "I tried this and it's good" (permanent, community validation, protects dish)

**Implementation Scope:**
- New `dish_recommendations` table
- New recommendation API endpoints
- Updated dish deletion protection logic (check recommendations, not wishlists)
- New "My Recommendations" page
- Independent Save and Recommend buttons on dish cards
- Social proof display ("Recommended by 3 friends")

See full feature plan for detailed database schema, API endpoints, UI/UX flows, and implementation strategy.

### User Feedback System Enhancement (Low Priority)
**Status:** Basic MVP Implementation Complete, Enhancement Planned  
**Current Implementation:** Simple feedback form in Account page with database storage

**Overview:**
Basic feedback collection system is implemented for MVP. Future enhancement will migrate to dedicated feedback platform (e.g., Featurebase) for better organization, prioritization, and user engagement.

**Current MVP Implementation:**
- Simple feedback form accessible from Account page
- Stores feedback in Supabase `feedback` table (user_id, message, type, timestamp)
- Basic categorization support (bug, feature, general)
- Sufficient for small userbase and initial feedback collection

**Future Enhancement:**
- Migrate to Featurebase or similar dedicated feedback platform
- Enable user voting and prioritization
- Public feedback board and roadmap visibility
- Better categorization and triage workflows
- Integration with product planning process

**Migration Path:**
- Current database structure easily exports to CSV/JSON
- User IDs can be mapped to emails for Featurebase import
- Feedback type field maps to tags/categories

### ✅ Completed (Interim Fix - Allow Dish Deletion with Wishlist Items)
- Updated `wishlist_items.dish_id` foreign key to `ON DELETE CASCADE` - dish owners can now delete dishes even if wishlisted

---

## Future Performance Optimization Tasks

> **Note:** Client-side image compression is **already implemented** (FEATURE-020, `lib/image-compression.ts`). Task 7.1 compression subtasks below are **superseded** unless requirements change.

### Deferred: Form Submission & Infrastructure Performance (V2)

#### **Task 7.1: Advanced Photo Upload Optimization** — PARTIALLY SUPERSEDED
**Objective**: Further photo upload improvements beyond FEATURE-020  
**Priority**: Medium (compression done; retry/progress remain)

**Subtasks**:
- [x] **Image Compression Before Upload** — ✅ Done in FEATURE-020 (`lib/image-compression.ts`)
  - Adaptive quality by file size, max width 1200–1400px, 85–90% size reduction typical

- [ ] **Upload Retry Logic and Error Handling**
  - Implement exponential backoff retry mechanism
  - Add timeout handling for slow uploads (30s timeout)
  - Provide user-friendly error messages for different failure scenarios
  - Add ability to retry failed uploads without losing form data
  - Implement chunked upload for large files (if needed)

- [ ] **Upload Progress Enhancement**
  - Replace simulated progress with real upload progress tracking
  - Implement WebSocket or Server-Sent Events for real-time progress
  - Add file size and upload speed indicators
  - Show estimated time remaining
  - Add cancel upload functionality

#### **Task 7.2: Parallel Processing Implementation**
**Objective**: Optimize form submission by processing operations in parallel
**Priority**: Medium
**Estimated Time**: 3-4 days

**Subtasks**:
- [ ] **Background Photo Upload**
  - Start photo upload immediately after selection
  - Allow form submission while upload is in progress
  - Update dish record with image URL after upload completion
  - Implement upload queue for multiple photos
  - Add fallback handling if upload fails after dish creation

- [ ] **Optimistic UI Updates**
  - Show dish creation immediately with temporary image placeholder
  - Update UI with real image when upload completes
  - Implement rollback mechanism if upload fails
  - Add visual indicators for pending uploads

- [ ] **Form State Persistence**
  - Save form data to localStorage during submission
  - Restore form state if submission fails
  - Implement draft saving functionality
  - Add auto-save feature for long forms

#### **Task 7.3: Database Performance Optimization**
**Objective**: Optimize database operations for faster dish creation
**Priority**: Medium
**Estimated Time**: 2 days

**Subtasks**:
- [ ] **Database Index Optimization**
  - Review and optimize indexes on dishes table
  - Add composite indexes for common query patterns
  - Optimize RLS policies for faster execution
  - Add database query performance monitoring

- [ ] **API Response Optimization**
  - Implement response caching for static data
  - Add compression for API responses
  - Optimize JSON serialization
  - Implement database connection pooling

- [ ] **Batch Operations**
  - Implement batch insert for multiple dishes
  - Add bulk update operations
  - Optimize user profile fetching with batch queries

#### **Task 7.4: Network and Caching Optimization**
**Objective**: Improve network performance and reduce API calls
**Priority**: Low
**Estimated Time**: 1-2 days

**Subtasks**:
- [ ] **CDN Implementation**
  - Move static assets to CDN
  - Implement image CDN for uploaded photos
  - Add geographic distribution for faster uploads
  - Implement edge caching for API responses

- [ ] **Client-Side Caching**
  - Implement React Query for API caching
  - Add localStorage caching for user preferences
  - Cache delivery app configurations
  - Implement offline-first functionality

- [ ] **API Optimization**
  - Implement GraphQL for efficient data fetching
  - Add API request batching
  - Implement request deduplication
  - Add API rate limiting and throttling

#### **Task 7.5: User Experience Enhancements**
**Objective**: Improve perceived performance and user experience
**Priority**: Low
**Estimated Time**: 1-2 days

**Subtasks**:
- [ ] **Loading States and Skeletons**
  - Add skeleton loading for dish cards
  - Implement progressive image loading
  - Add loading states for all async operations
  - Implement smooth transitions and animations

- [ ] **Performance Monitoring**
  - Add real-time performance metrics
  - Implement user experience monitoring
  - Add error tracking and analytics
  - Create performance dashboards

- [ ] **Progressive Web App Features**
  - Add service worker for offline functionality
  - Implement push notifications
  - Add app-like navigation experience
  - Implement background sync

### **Performance Benchmarks and Targets**
- **Photo Upload**: < 3 seconds for 5MB image
- **Form Submission**: < 1 second for dish creation (excluding photo)
- **Total Submission Time**: < 5 seconds end-to-end
- **API Response Time**: < 500ms for all operations
- **Page Load Time**: < 2 seconds for all pages

### **Implementation Priority Order**
1. **Done:** Client-side image compression (FEATURE-020)
2. **Next (optional):** Upload retry logic, real upload progress
3. **Short-term:** Parallel processing, database optimization
4. **Medium-term:** CDN, advanced caching
5. **Long-term:** PWA, monitoring dashboards

## Resource Links
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google Maps Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Image Compression Best Practices](https://web.dev/fast/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [PWA Implementation Guide](https://web.dev/progressive-web-apps/)