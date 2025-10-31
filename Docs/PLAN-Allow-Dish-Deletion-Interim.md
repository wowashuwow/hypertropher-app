# Plan: Allow Dish Deletion with Wishlist Items (Interim Solution)

**Status:** Ready for Implementation  
**Priority:** Medium  
**Estimated Time:** 1-2 hours  
**Date:** October 30, 2025

---

## 1. Context

### Current Situation
- Users cannot delete dishes if anyone has wishlisted them
- Foreign key constraint `wishlist_items.dish_id` references `dishes.id` without `ON DELETE CASCADE`
- This blocks legitimate dish deletions (spam cleanup, test dishes)

### Desired Behavior
- Dish owners should be able to delete their dishes regardless of wishlist status
- When a dish is deleted, wishlist items should be automatically removed
- Simple, clean implementation until recommendation system is built

---

## 2. Solution: Add CASCADE to Foreign Key

### Approach
Update the foreign key constraint on `wishlist_items` table to cascade deletions.

### Why This Works
- **Simple:** One SQL statement
- **Clean:** Database handles cleanup automatically
- **Consistent:** Matches pattern used for other tables (`dish_availability_channels`, `dish_delivery_apps`)
- **Temporary:** Works until recommendation system replaces it

---

## 3. Implementation Plan

### Step 1: Database Migration

**File:** Create new migration in Supabase SQL Editor

**SQL:**
```sql
-- Drop existing foreign key constraint (without CASCADE)
ALTER TABLE wishlist_items 
DROP CONSTRAINT IF EXISTS wishlist_items_dish_id_fkey;

-- Re-add with CASCADE
ALTER TABLE wishlist_items
ADD CONSTRAINT wishlist_items_dish_id_fkey 
FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;
```

**What This Does:**
- When a dish is deleted from `dishes` table
- All associated records in `wishlist_items` are automatically deleted
- No orphaned wishlist items remain

### Step 2: No Code Changes Needed

The existing DELETE endpoint in `/app/api/dishes/route.ts` will work automatically:
- User requests deletion
- Database deletes dish
- CASCADE automatically removes wishlist items
- Success!

**Current Code (No changes needed):**
```typescript
// In DELETE handler - this stays the same
const { error } = await supabase
  .from("dishes")
  .delete()
  .eq("id", id)
  .eq("user_id", user.id); // Owner check

if (error) {
  console.error("Error deleting dish:", error);
  return NextResponse.json({ 
    error: "Failed to delete dish." 
  }, { status: 500 });
}

return NextResponse.json({ 
  message: "Dish deleted successfully." 
});
```

### Step 3: Update Documentation

**File:** `DATABASE_SCHEMA.md`

Update wishlist_items table documentation:

**Current:**
```markdown
| `dish_id` | `UUID` | Primary Key, Foreign Key to `dishes.id` | The ID of the dish. |
```

**Updated:**
```markdown
| `dish_id` | `UUID` | Primary Key, Foreign Key to `dishes.id`, ON DELETE CASCADE | The ID of the dish. Automatically removed when dish is deleted. |
```

---

## 4. Testing Plan

### Test Case 1: Delete Unwishlisted Dish
```
Setup:
- User A creates dish
- No one wishlists it

Action:
- User A deletes dish

Expected:
✅ Dish deleted successfully
```

### Test Case 2: Delete Wishlisted Dish (Self)
```
Setup:
- User A creates dish
- User A wishlists their own dish

Action:
- User A deletes dish

Expected:
✅ Dish deleted successfully
✅ Wishlist item automatically removed
```

### Test Case 3: Delete Wishlisted Dish (Others)
```
Setup:
- User A creates dish
- User B and User C wishlist it

Action:
- User A deletes dish

Expected:
✅ Dish deleted successfully
✅ All wishlist items (User B and C) automatically removed
✅ No errors or orphaned records
```

### Test Case 4: Non-Owner Cannot Delete
```
Setup:
- User A creates dish
- User B wishlists it

Action:
- User B tries to delete dish

Expected:
❌ 403 Forbidden
❌ Error: "You can only delete your own dishes."
```

### Test Case 5: Wishlist Page After Deletion
```
Setup:
- User B has dish in wishlist
- Creator deletes dish

Action:
- User B visits "My Wishlist" page

Expected:
✅ Dish no longer appears
✅ No errors
✅ Clean UI (no broken references)
```

---

## 5. User Experience Considerations

### Current UX (Before Fix)
```
User: *Clicks delete on test dish*
System: "Failed to delete dish"
User: "Why? It's my dish!"
User: *Confused, frustrated*
```

### Updated UX (After Fix)
```
User: *Clicks delete on test dish*
System: "Dish deleted successfully"
User: ✅ Happy!

(Even if someone wishlisted it)
```

### Edge Case: Someone's Wishlist
```
User B has dish in wishlist
Creator deletes dish
User B's wishlist: Dish silently removed
User B: Doesn't see error, just no longer there

This is acceptable because:
- Wishlists are temporary planning tools
- If dish is deleted, it's no longer available anyway
- No error > confusing broken reference
```

---

## 6. Migration Rollout

### Pre-Deployment Checklist
- [ ] Backup database (Supabase automatic backups enabled)
- [ ] Test SQL in Supabase SQL Editor
- [ ] Verify no errors returned
- [ ] Check constraint is properly added

### Deployment Steps
1. Run SQL migration in Supabase SQL Editor
2. Verify constraint updated: 
   ```sql
   SELECT conname, pg_get_constraintdef(oid) 
   FROM pg_constraint 
   WHERE conrelid = 'wishlist_items'::regclass 
   AND contype = 'f';
   ```
3. Test dish deletion in production
4. Update documentation
5. Monitor for issues

### Rollback Plan
If issues occur:
```sql
-- Revert to original constraint (without CASCADE)
ALTER TABLE wishlist_items 
DROP CONSTRAINT wishlist_items_dish_id_fkey;

ALTER TABLE wishlist_items
ADD CONSTRAINT wishlist_items_dish_id_fkey 
FOREIGN KEY (dish_id) REFERENCES dishes(id);
```

---

## 7. Why This is the Right Interim Solution

### ✅ Pros
1. **Simple:** One SQL statement, no code changes
2. **Fast:** Implements in minutes
3. **Clean:** Database handles cascade automatically
4. **Consistent:** Matches existing pattern for other tables
5. **Reversible:** Easy to rollback if needed
6. **Zero downtime:** No service interruption

### ⚠️ Considerations
1. **Temporary:** Will be replaced by recommendation system
2. **Silent removal:** Users don't get notified when wishlisted dishes are deleted
3. **No protection:** Any dish can be deleted by creator

### Why It's Acceptable
- **Spam cleanup:** Users need to clean up test dishes
- **Creator control:** Maintains creator autonomy (for now)
- **Wishlist nature:** Wishlists are temporary planning tools
- **Future solution:** Recommendation system will provide proper protection

---

## 8. Future Migration Path

### When Recommendation System is Implemented

**Step 1:** Create `dish_recommendations` table  
**Step 2:** Update deletion logic to check recommendations instead  
**Step 3:** Keep wishlist CASCADE (still needed for cleanup)  

**Result:**
- Wishlists remain temporary (CASCADE stays)
- Recommendations provide protection (new logic)
- Both systems work together harmoniously

**No Breaking Changes:**
- Wishlist CASCADE continues to work
- Just add new protection layer on top

---

## 9. Alternative Approaches (Rejected)

### Alternative 1: Remove Wishlist Items in Code
```typescript
// Manually delete wishlist items first
await supabase.from("wishlist_items").delete().eq("dish_id", id);
await supabase.from("dishes").delete().eq("id", id);
```

**Why Rejected:**
- More complex (2 queries)
- More error-prone (what if first succeeds, second fails?)
- Database CASCADE is more reliable

### Alternative 2: Soft Delete
```sql
ALTER TABLE dishes ADD COLUMN deleted_at TIMESTAMP;
UPDATE dishes SET deleted_at = NOW() WHERE id = ?;
```

**Why Rejected:**
- More complex to implement
- Requires filtering everywhere (`WHERE deleted_at IS NULL`)
- Overkill for current needs
- Can add later if needed

### Alternative 3: Prevent Deletion (Current State)
**Why Rejected:**
- Blocks legitimate use cases
- Poor UX for creators
- Doesn't align with current product stage (early MVP with test data)

---

## 10. Success Criteria

### Implementation is Successful When:
- ✅ Users can delete their own dishes regardless of wishlist status
- ✅ Wishlist items are automatically cleaned up (no orphans)
- ✅ No errors in production logs
- ✅ User feedback is positive
- ✅ Documentation is updated

### Monitoring After Deploy:
- Check Supabase logs for foreign key errors (should be none)
- Monitor user feedback/support requests
- Verify wishlist pages load without errors
- Check for any orphaned records (should be zero)

---

## 11. Communication Plan

### Internal Team
- Document this change in Implementation.md
- Note it's interim solution until recommendation system
- Explain trade-offs and future path

### Users (If Needed)
No user communication needed because:
- Improves UX (removes frustration)
- Silent change from user perspective
- Expected behavior (creators can delete their content)

---

## 12. Risk Assessment

### Risk Level: **LOW**

### Risks & Mitigations:

**Risk 1: Data Loss**
- **Impact:** Users lose wishlisted dishes when creator deletes
- **Likelihood:** Medium
- **Mitigation:** Wishlist is for planning, not permanence
- **Future Fix:** Recommendation system will provide protection

**Risk 2: User Confusion**
- **Impact:** User B's wishlisted dish disappears unexpectedly
- **Likelihood:** Low (few users, early stage)
- **Mitigation:** Acceptable for MVP, will improve with recommendations

**Risk 3: Database Errors**
- **Impact:** Migration fails or causes issues
- **Likelihood:** Very Low (CASCADE is standard SQL feature)
- **Mitigation:** Test in SQL editor first, rollback plan ready

**Risk 4: Orphaned References**
- **Impact:** Broken wishlist references
- **Likelihood:** Zero (CASCADE prevents this)
- **Mitigation:** Database guarantees cleanup

---

## 13. Implementation Checklist

### Pre-Implementation
- [ ] Review this plan
- [ ] Confirm approach with team
- [ ] Check current database state
- [ ] Prepare rollback SQL

### Implementation
- [ ] Run CASCADE migration SQL
- [ ] Verify constraint updated successfully
- [ ] Test dish deletion in development
- [ ] Check wishlist cleanup works

### Post-Implementation
- [ ] Update DATABASE_SCHEMA.md
- [ ] Update Implementation.md (reference this plan)
- [ ] Test in production
- [ ] Monitor logs for 24 hours
- [ ] Mark as complete

### Documentation
- [ ] Document CASCADE behavior
- [ ] Note interim solution status
- [ ] Link to recommendation system plan
- [ ] Update any affected API docs

---

## 14. SQL Reference

### Check Current Constraint
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'wishlist_items'::regclass 
AND contype = 'f'
AND conname LIKE '%dish_id%';
```

### Apply Migration
```sql
ALTER TABLE wishlist_items 
DROP CONSTRAINT IF EXISTS wishlist_items_dish_id_fkey;

ALTER TABLE wishlist_items
ADD CONSTRAINT wishlist_items_dish_id_fkey 
FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;
```

### Verify CASCADE Applied
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'wishlist_items'::regclass 
AND contype = 'f'
AND conname = 'wishlist_items_dish_id_fkey';

-- Should show: ON DELETE CASCADE
```

### Test Cascade (Safe Test Query)
```sql
-- This is a dry-run query to see what would be deleted
SELECT 
  d.id as dish_id,
  d.dish_name,
  COUNT(w.user_id) as wishlist_count
FROM dishes d
LEFT JOIN wishlist_items w ON d.id = w.dish_id
GROUP BY d.id, d.dish_name
HAVING COUNT(w.user_id) > 0
ORDER BY COUNT(w.user_id) DESC;

-- Shows dishes with wishlists (for testing cleanup)
```

---

## 15. Timeline

**Total Time:** 1-2 hours

- Planning: ✅ Complete
- SQL Migration: 5 minutes
- Testing: 30 minutes
- Documentation: 15-30 minutes
- Monitoring: 24 hours post-deploy

**Recommended Schedule:**
- Deploy during low-traffic period
- Monitor for 24 hours
- Mark complete after verification

---

**End of Plan**

---

**Summary:**
Simple, clean solution to allow dish deletion by adding CASCADE to foreign key. Works immediately, requires minimal effort, and doesn't break when recommendation system is added later. Low risk, high value interim fix.

