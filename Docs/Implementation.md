# Implementation Plan for Hypertropher

## Feature Analysis

### Identified Features:
- **Authentication System**: Phone-based OTP authentication with invite codes
- **User Management**: Profile creation, city selection, invite code generation
- **Dish Contribution**: Add dishes with photos, ratings, and location data
- **Dish Discovery**: Browse, filter, and sort dishes by protein type and price
- **Wishlist Management**: Save and manage favorite dishes
- **Restaurant Integration**: Google Maps Places API for restaurant search
- **Image Storage**: Supabase Storage for dish photos
- **Responsive Design**: Mobile-first UI with desktop support

### Feature Categorization:
- **Must-Have Features:** Authentication, Dish CRUD, User profiles, Basic filtering
- **Should-Have Features:** Wishlist, Google Maps integration, Image uploads
- **Nice-to-Have Features:** Advanced sorting, Social features, Public profiles

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
- **Authentication:** Supabase Auth - Secure phone-based authentication
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
- [x] Configure Supabase Auth with phone provider
- [x] Set up Supabase client and server configurations
- [x] Create admin user and initial invite codes

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
- [x] Connect homepage to live data from API
- [x] Connect "My Dishes" page to live data
- [x] Connect "My Wishlist" page to live data
- [x] Display user's invite codes in account page
- [x] Implement admin invite code generation

### Stage 4.5: Security & UX Fixes ✅ COMPLETE
**Duration:** 1 day
**Dependencies:** Stage 4 completion

#### SUB-STEPS:
- [x] Fix phone number exposure in user profile API (BUG-002)
- [x] Implement personalized user greetings on homepage (BUG-003)
- [x] Fix city update persistence across app (BUG-001)
- [x] Document all security fixes and bug resolutions

### Stage 5: Advanced Features & Integrations
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
- [ ] Add advanced filtering and sorting options
- [ ] **Deferred:** Server-side sorting and filtering (moved to V2 for performance optimization)
- [x] Create wishlist management system

### Stage 6: Pre-Deployment UI/UX Enhancements
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
  - Copy dish name to clipboard when "Open in <app>" button is clicked
  - Show "Copied dish name to clipboard" feedback message
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

- [x] Implement delivery app pills UI with SVG logos
  - Replace MultiSelect component with DeliveryAppPills component
  - Create wrapping flex layout matching protein source pills pattern
  - Add SVG logos for all delivery apps (Swiggy, Zomato, Uber Eats, DoorDash, Grubhub, Postmates, Just Eat, Deliveroo, Grab, Foodpanda, iFood, PedidosYa, Rappi)
  - Implement multi-select functionality with visual feedback
  - Add logo mapping system in lib/delivery-apps.ts
  - Update both add-dish and edit-dish pages with new component
  - Maintain existing form validation and state management
  - Handle empty states gracefully with appropriate messaging

- [x] Implement enhanced rating system with improved text and emoji display
  - Update rating text values: "Great" → "Pretty Good", "Amazing" → "Mouthgasm"
  - Implement new emoji display logic: "Pretty Good" → 👍, "Overloaded" → 💪💪💪, "Mouthgasm" → 🤤🤤🤤, "Would Eat Everyday" → 🤩🤩🤩
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

### Stage 7: Polish & Deployment
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
  - ✅ Added place_id column to dishes table for Google Maps restaurant navigation
  - ✅ Updated add/edit dish forms to capture and store place_id from Google Places API
  - ✅ Implemented handleNavigate function in DishCard with Google Maps restaurant page URLs
  - ✅ Fixed data transformation in homepage and my-dishes pages to include place_id
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

- [ ] Deploy to Vercel with environment configuration
- [ ] Add invite code verification feedback
- [ ] Implement secure invite code passing
- [ ] Add UX improvements to auth flow
- [ ] Conduct comprehensive testing
- [ ] Optimize performance and fix bugs

### Stage 8: Performance Optimization (V2)
**Duration:** 3-4 days
**Dependencies:** Stage 7 completion

#### Sub-steps:
- [ ] **Fix Unnecessary Re-loading Issue**: Prevent unnecessary API calls and loading states on page navigation
  - **Problem**: Every page visit triggers fresh API calls for user data (name, city) even when data hasn't changed
  - **Root Cause**: Client-side rendered pages re-initialize on navigation, no caching or state persistence
  - **Evidence**: Terminal logs show repeated `/api/users` calls on every page visit (lines 23-294 in terminal output)
  - **Solution**: Implement user data caching and state persistence in session provider
  - **Implementation Steps**:
    1. Add user data caching logic to SessionProvider with timestamp-based expiration
    2. Implement React Query or SWR for API response caching
    3. Add loading state optimization to prevent unnecessary spinners for cached data
    4. Test navigation between pages to verify reduced API calls
    5. Verify faster page loads and better user experience
  - **Files to Modify**: `lib/auth/session-provider.tsx`, potentially add React Query/SWR
  - **Expected Result**: No unnecessary API calls, faster page loads, better perceived performance
- [ ] Implement server-side sorting and filtering
- [ ] Add database indexing for performance
- [ ] Implement pagination for large datasets
- [ ] Optimize query performance
- [ ] Add caching strategies
- [ ] Performance testing and monitoring

## Current Status Summary

### ✅ Completed (Stages 1-4.5)
- **Foundation & Setup**: Supabase integration, database schema, authentication
- **Core Authentication**: Phone-based OTP, invite codes, user management

- **Dish Functionality**: CRUD operations, image uploads, data validation
- **Dynamic Data**: Live API connections, session handling, route protection
- **Security & UX**: Phone number protection, personalized greetings, bug fixes

### ✅ Completed (Stage 5 - Partial)
- **Multi-Select Delivery Apps**: Custom MultiSelect component, multiple app selection, deep linking
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

### 🚧 In Progress (Stage 5 - Remaining)
- **Advanced Features**: Advanced filtering and sorting (deferred to V2)

### 📋 Next Steps
- Complete UI/UX pre-deployment enhancements (Stage 6)
- Deploy to Vercel
- Conduct comprehensive testing
- Performance optimization and bug fixes

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

### 🎯 MVP Status: ~95% Complete - Critical System Restored
The core functionality is working and secure. Google Maps Places API integration provides intelligent restaurant search with location-aware results. Multi-select delivery apps feature is complete with proper styling and deep linking. All mock data has been removed, ensuring consistent database-only data source. Wishlist and My Dishes functionality is fully operational with proper database persistence and RLS policies. Dish edit and delete functionality is implemented with conditional UI and ownership validation. Invite codes system is now fully functional with automatic generation, status indicators, and secure access controls. **Critical issue resolved**: User signup flow restored with modern Secret API key security.

#### Sub-steps:
- [ ] Deploy to Vercel with environment configuration
- [ ] Add invite code verification feedback
- [ ] Implement secure invite code passing
- [ ] Add UX improvements to auth flow
- [ ] Conduct comprehensive testing
- [ ] Optimize performance and fix bugs
- [ ] **Future Enhancement**: Add city selection for non-logged-in users
  - Allow non-logged-in users to select a city if at least one dish exists for that city
  - This will help convey the real value of the app by showing users dishes in their specific city
  - Brainstorm implementation approach (dropdown, location detection, etc.)

## Future Performance Optimization Tasks

### Stage 7: Form Submission Performance Optimization

#### **Task 7.1: Advanced Photo Upload Optimization**
**Objective**: Implement comprehensive photo upload performance improvements
**Priority**: High
**Estimated Time**: 2-3 days

**Subtasks**:
- [ ] **Image Compression Before Upload**
  - Implement client-side image compression using Canvas API
  - Add quality settings (80%, 90%, 95%) for different use cases
  - Resize large images to optimal dimensions (max 1920x1080)
  - Reduce file size by 60-80% while maintaining quality
  - Add file size validation and warnings for oversized images

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
1. **Immediate (Quick Wins)**: Image compression, upload retry logic
2. **Short-term (1-2 weeks)**: Parallel processing, database optimization
3. **Medium-term (1-2 months)**: CDN implementation, advanced caching
4. **Long-term (3+ months)**: PWA features, advanced monitoring

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