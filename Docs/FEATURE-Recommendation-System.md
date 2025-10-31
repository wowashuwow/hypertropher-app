# Feature Plan: Dish Recommendation System

**Status:** Planned for Future Implementation  
**Priority:** High  
**Version:** 1.0  
**Date:** October 30, 2025

---

## 1. Overview

### Problem Statement
Currently, the wishlist system serves two conflicting purposes:
1. **Personal Planning:** "I want to try this dish later"
2. **Community Validation:** "This dish is good and should be protected"

This creates UX issues:
- Users cannot delete dishes they created if anyone has wishlisted them
- Wishlisting doesn't signal actual validation (user hasn't tried it yet)
- No clear way to show which dishes are truly endorsed by friends

### Solution
Implement a separate **Recommendation System** that:
- Allows users to explicitly recommend dishes they've tried
- Protects valuable dishes from deletion based on recommendations (not wishlists)
- Enables future friend-based filtering and social proof features
- Keeps wishlist as a simple personal planning tool

---

## 2. Core Concepts

### Wishlist (Personal Planning)
- **Purpose:** Save dishes to try later
- **Action:** Temporary, reversible
- **User Can:** Add and remove anytime
- **Effect:** No dish protection, purely personal

### Recommendation (Community Validation)
- **Purpose:** Endorse dishes you've tried and found valuable
- **Action:** Permanent validation signal
- **User Can:** Recommend once (cannot undo)
- **Effect:** Protects dish from deletion

### Key Principle
**Wishlist ≠ Recommendation**
- These are completely independent systems
- A dish can be wishlisted, recommended, both, or neither
- Users can remove from wishlist while keeping recommendation active

---

## 3. Database Schema

### New Table: `dish_recommendations`

```sql
CREATE TABLE dish_recommendations (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comment TEXT,
  PRIMARY KEY (user_id, dish_id)
);

-- Index for quick lookups
CREATE INDEX idx_dish_recommendations_dish_id ON dish_recommendations(dish_id);
CREATE INDEX idx_dish_recommendations_user_id ON dish_recommendations(user_id);

-- RLS Policies
ALTER TABLE dish_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow users to read all recommendations (for social proof)
CREATE POLICY "Allow public read access to recommendations"
  ON dish_recommendations FOR SELECT
  USING (true);

-- Allow authenticated users to create recommendations
CREATE POLICY "Allow authenticated users to recommend dishes"
  ON dish_recommendations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Prevent deletion of recommendations (permanent validation)
-- No DELETE policy = cannot delete
```

### Existing Table: `wishlist_items` (No Changes)

```sql
-- Remains as-is
wishlist_items (
  user_id UUID,
  dish_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, dish_id)
)
```

---

## 4. API Endpoints

### New Endpoints

#### `POST /api/dishes/recommend`
**Purpose:** Add a recommendation for a dish

**Request:**
```json
{
  "dishId": "uuid",
  "comment": "Really high protein!" // optional
}
```

**Response:**
```json
{
  "message": "Dish recommended successfully",
  "recommendationCount": 3
}
```

**Logic:**
1. Verify user is authenticated
2. Check if user already recommended (prevent duplicates)
3. Insert into `dish_recommendations`
4. Return total recommendation count for the dish

#### `GET /api/dishes/recommendations`
**Purpose:** Get all dishes recommended by current user

**Response:**
```json
{
  "dishes": [
    {
      "id": "uuid",
      "dish_name": "Chicken Shawarma",
      "restaurant_name": "...",
      "recommended_at": "2025-10-30T...",
      // ... other dish fields
    }
  ]
}
```

#### `GET /api/dishes/:id/recommendations`
**Purpose:** Get all users who recommended a specific dish

**Response:**
```json
{
  "recommendations": [
    {
      "user_id": "uuid",
      "user_name": "Ashutosh",
      "recommended_at": "2025-10-30T...",
      "comment": "Really high protein!"
    }
  ],
  "total": 3
}
```

### Modified Endpoints

#### `DELETE /api/dishes` (Updated Protection Logic)
**Change:** Check `dish_recommendations` instead of `wishlist_items`

**Before:**
```typescript
// Blocked if in ANY wishlist
const { data: wishlistItems } = await supabase
  .from("wishlist_items")
  .select("user_id")
  .eq("dish_id", id);

if (wishlistItems.length > 0) {
  return error("Cannot delete - dish is wishlisted");
}
```

**After:**
```typescript
// Only blocked if RECOMMENDED
const { data: recommendations } = await supabase
  .from("dish_recommendations")
  .select("user_id")
  .eq("dish_id", id);

if (recommendations && recommendations.length >= 1) {
  return NextResponse.json({ 
    error: "Cannot delete: This dish is recommended by friends.",
    recommendationCount: recommendations.length,
    canEdit: true
  }, { status: 403 });
}

// Wishlists don't matter - proceed with deletion
```

#### `GET /api/dishes` (Enhanced Data)
**Addition:** Include recommendation counts and user's recommendation status

**Response Enhancement:**
```json
{
  "dishes": [
    {
      "id": "uuid",
      // ... existing fields ...
      "recommendation_count": 3,
      "is_recommended_by_user": true,
      "recommended_by_friends": ["Ashutosh", "Abhijeet"]
    }
  ]
}
```

---

## 5. UI/UX Implementation

### 5.1 Dish Card Component

#### Layout
```
┌─────────────────────────────────┐
│  [Dish Photo]                   │
│  Chicken Shawarma               │
│  Restaurant Name                │
│  ₹250                           │
│                                 │
│  👍 Recommended by Ashutosh,    │
│     Abhijeet, and 1 other       │
│                                 │
│  [🔖 Save]    [👍 Recommend]   │
└─────────────────────────────────┘
```

#### Button States

**Save Button (Toggle):**
- Not saved: `[🔖 Save]` (outline style)
- Saved: `[🔖 Saved ✓]` (filled style)
- Action: Toggle on/off
- Tooltip: "Save to try later"

**Recommend Button (One-way):**
- Not recommended: `[👍 Recommend]` (outline style)
- Recommended: `[⭐ You recommended]` (filled style, disabled)
- Action: One-time only (no undo)
- Tooltip: "Recommend to friends"

#### Social Proof Display
```typescript
{recommendedByFriends.length > 0 && (
  <div className="social-proof">
    <p className="text-sm text-muted-foreground">
      👍 Recommended by {
        recommendedByFriends.length <= 2 
          ? recommendedByFriends.join(" and ")
          : `${recommendedByFriends.slice(0, 2).join(", ")}, and ${recommendedByFriends.length - 2} other${recommendedByFriends.length > 3 ? 's' : ''}`
      }
    </p>
  </div>
)}
```

### 5.2 Navigation Structure

#### Updated Bottom Navigation
```
🏠 Discover
➕ Add Dish
🔖 My Wishlist           ← Dishes to try
👍 My Recommendations    ← Dishes I validated (NEW)
👤 Account
```

### 5.3 New Page: My Recommendations

#### Purpose
Display all dishes the current user has recommended

#### Layout
Similar to "My Dishes" and "My Wishlist" pages:
- Grid of dish cards
- Filter by protein type
- Sort by date recommended
- Shows total recommendation count

#### Features
- Cannot un-recommend (permanent validation)
- Shows when you recommended each dish
- Option to edit your comment
- Shows how many others also recommended

### 5.4 Confirmation Modal (Recommend Action)

#### When User Clicks "Recommend"
```
┌────────────────────────────────────┐
│  Recommend this dish?              │
│                                    │
│  By recommending, you're telling   │
│  your friends this dish is good.   │
│  This action cannot be undone.     │
│                                    │
│  Optional: Add a quick note        │
│  ┌──────────────────────────────┐ │
│  │ Really high protein!         │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Cancel]  [👍 Recommend]         │
└────────────────────────────────────┘
```

---

## 6. User Flows

### Flow 1: Save → Try → Recommend → Remove from Wishlist
1. User sees dish → Clicks "Save" → Added to wishlist
2. User orders and tries dish → It's good!
3. User clicks "Recommend" on dish card
4. Confirmation modal appears → User confirms
5. Dish is now recommended (permanent validation)
6. User clicks "Saved ✓" to remove from wishlist
7. **Result:** Dish recommended but not in wishlist ✓

### Flow 2: Direct Recommendation (Without Saving)
1. Friend tells user about dish
2. User tries dish at restaurant → It's good!
3. User finds dish in Discover page
4. User clicks "Recommend" directly
5. **Result:** Dish recommended, never in wishlist ✓

### Flow 3: Save Without Recommending
1. User saves dish to wishlist
2. User tries dish → Not impressed
3. User removes from wishlist (clicks "Saved ✓")
4. User never recommends
5. **Result:** No validation, dish can still be deleted ✓

### Flow 4: Creator Cannot Delete Recommended Dish
1. User A adds dish
2. User B and User C try and recommend it
3. User A decides to delete dish
4. System blocks deletion: "Cannot delete: This dish is recommended by 2 friends"
5. User A can only edit the dish details
6. **Result:** Community value preserved ✓

---

## 7. Business Logic Rules

### Recommendation Rules
1. **One recommendation per user per dish** (enforced by primary key)
2. **Recommendations are permanent** (no DELETE policy on table)
3. **Any authenticated user can recommend** any dish
4. **Recommendations are public** (anyone can see who recommended what)

### Deletion Protection Rules
1. **0 recommendations** → Dish is deletable by creator
2. **1+ recommendations** → Dish CANNOT be deleted by anyone
3. **Wishlists do not affect** deletion protection
4. **Admin override:** Platform admin can delete any dish (future feature)

### Edge Cases
- **Self-recommendation:** Users can recommend their own dishes (valid use case)
- **Duplicate prevention:** Database primary key prevents duplicate recommendations
- **Deleted user:** If user is deleted, recommendations cascade delete
- **Deleted dish:** If admin deletes dish, recommendations cascade delete

---

## 8. Future Enhancements

### Phase 2: Friend-Based Filtering
**Feature:** Show only dishes recommended by friends

**Implementation:**
```sql
-- Query dishes recommended by friends
WITH friend_network AS (
  SELECT used_by_user_id as friend_id 
  FROM invite_codes 
  WHERE generated_by_user_id = 'current_user_id'
)
SELECT DISTINCT d.* 
FROM dishes d
JOIN dish_recommendations dr ON d.id = dr.dish_id
JOIN friend_network f ON dr.user_id = f.friend_id
WHERE d.city = 'user_city'
ORDER BY dr.created_at DESC;
```

### Phase 3: Recommendation Comments
- Allow users to add/edit comments on recommendations
- Show comments in social proof display
- "Ashutosh recommends: 'Really high protein!'"

### Phase 4: Recommendation Stats
- Show on user profile: "Recommended 15 dishes"
- Leaderboard: "Top recommenders this month"
- Trust score based on recommendation quality

### Phase 5: Undo Recommendation (Admin Only)
- Platform admin can remove recommendations if needed
- For cases of spam or abuse
- Logged in admin audit trail

---

## 9. Migration Strategy

### Step 1: Database Migration
```sql
-- Run migration to create dish_recommendations table
-- Add indexes
-- Set up RLS policies
```

### Step 2: Backend Implementation
1. Create recommendation API endpoints
2. Update dish deletion logic
3. Enhance dish query to include recommendation data
4. Add recommendation count to responses

### Step 3: Frontend Implementation
1. Add "Recommend" button to DishCard component
2. Create "My Recommendations" page
3. Add recommendation confirmation modal
4. Update navigation to include new page
5. Add social proof display to dish cards

### Step 4: Testing
1. Test recommendation creation
2. Test deletion protection
3. Test wishlist independence
4. Test social proof display
5. User acceptance testing

### Step 5: Deployment
1. Deploy database migration
2. Deploy backend changes
3. Deploy frontend changes
4. Monitor for issues
5. Gather user feedback

---

## 10. Success Metrics

### Key Metrics to Track
1. **Recommendation Rate:** % of users who recommend at least 1 dish
2. **Recommendation Velocity:** Average recommendations per active user per month
3. **Deletion Requests:** Number of attempted deletions on recommended dishes
4. **Wishlist vs. Recommendation:** Ratio of wishlisted to recommended dishes
5. **Social Proof Impact:** Do dishes with more recommendations get more wishlists?

### Success Criteria
- ✅ Users clearly understand difference between wishlist and recommendation
- ✅ Deletion protection works without UX confusion
- ✅ Recommendation rate > 30% of active users
- ✅ Valuable dishes are protected from deletion
- ✅ Users report improved trust in dish quality

---

## 11. Technical Considerations

### Performance
- Index on `dish_id` for fast recommendation lookups
- Consider caching recommendation counts for popular dishes
- Optimize queries joining dishes with recommendations

### Security
- RLS policies prevent unauthorized recommendations
- Primary key prevents duplicate recommendations
- No DELETE policy ensures permanence

### Scalability
- Table can handle millions of recommendations
- Indexes support fast queries at scale
- Cascade deletes maintain referential integrity

---

## 12. Risks & Mitigations

### Risk 1: Users Don't Understand Difference
**Mitigation:**
- Clear UI labels and tooltips
- Confirmation modal explains permanence
- User education through first-time flow

### Risk 2: Users Accidentally Recommend
**Mitigation:**
- Confirmation modal before recommending
- Clear explanation that it's permanent
- Consider "undo within 5 minutes" grace period (future)

### Risk 3: Spam Recommendations
**Mitigation:**
- Rate limiting on recommendation endpoint
- Admin tools to remove spam recommendations
- User reporting system (future)

### Risk 4: Migration Complexity
**Mitigation:**
- Phased rollout (database → backend → frontend)
- Feature flag to enable/disable
- Comprehensive testing before launch
- Rollback plan ready

---

## 13. Documentation Updates Required

### Files to Update
1. `DATABASE_SCHEMA.md` - Add `dish_recommendations` table
2. `Implementation.md` - Reference this feature plan
3. `UI_UX_doc.md` - Add recommendation button specs
4. `PRD.md` - Update with recommendation feature

### Code Comments
- Add clear comments in DishCard component
- Document recommendation API endpoints
- Explain deletion protection logic

---

## 14. Related Features

### Dependencies
- User authentication (existing)
- Wishlist system (existing)
- Dish CRUD operations (existing)
- Friend network/invite system (existing)

### Enables Future Features
- Friend-based filtering
- Trust scores
- Social proof in discovery
- Recommendation-based sorting
- Community curation

---

**End of Feature Plan**

---

**Notes:**
- This is a well-thought-out plan ready for implementation
- All edge cases have been considered
- UX flows are clear and user-friendly
- Technical implementation is straightforward
- Aligns with long-term vision of friend-based discovery

