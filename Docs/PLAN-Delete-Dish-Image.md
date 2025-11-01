# Plan: Delete Images from Storage (Dish Images & Profile Pictures)

**Status:** Ready for Implementation  
**Priority:** High (Storage Cost Prevention)  
**Estimated Time:** 2-3 hours  
**Date:** October 2025

---

## 1. Context

### Current Situation

**Problem 1: Dish Images**
- When users delete dishes from "My Dishes" page, the dish record is removed from the database
- **Issue:** The associated dish image remains in Supabase Storage bucket (`dish-photos`)
- This causes unnecessary storage usage and costs

**Problem 2: Profile Pictures**
- When users update their profile picture on the account page, a new picture is uploaded
- **Issue:** The old profile picture remains in Supabase Storage bucket (`profile-pictures`)
- This causes unnecessary storage usage and costs

Both issues lead to:
- Storage quota filling up with orphaned images
- Increased storage costs over time
- Cluttered storage buckets

### Reference Implementation

**Dish Image Deletion (Edit Form):**
- **Existing Solution:** Photo deletion in edit-dish form (see `app/edit-dish/[id]/page.tsx`)
- When users update dish photos, old photos are deleted using:
  - `extractFilePathFromUrl()` - Parses file path from Supabase URL
  - `deleteOldPhoto()` - Deletes image from storage using `supabase.storage.remove()`
- Both functions handle legacy and new file path formats (`{user_id}/{filename}` vs `{filename}`)

**Profile Picture URL Format:**
- Profile pictures use format: `${user.id}-${Date.now()}.${fileExt}` (e.g., `user-id-1234567890.jpg`)
- URL extraction method: Uses `url.pathname.split('/').pop()` (see `app/api/upload-profile-picture/route.ts` line 112)
- Bucket: `profile-pictures` (different from `dish-photos`)

---

## 2. Solution Overview

### Approach

**Part 1: Dish Image Deletion**
- Add image deletion logic to the DELETE handler in `/app/api/dishes/route.ts` before deleting the dish record from the database.

**Part 2: Profile Picture Deletion**
- Add old profile picture deletion logic to the POST handler in `/app/api/upload-profile-picture/route.ts` before uploading the new picture.

### Why This Works
- **Reuses existing pattern:** Same approach as edit-dish form deletion
- **Server-side:** Ensures deletion happens reliably (not dependent on client)
- **Graceful handling:** Deletion should succeed even if image deletion fails (orphaned images can be cleaned up later)
- **Storage security:** Uses existing RLS policies (users can only delete their own photos/images)
- **Consistency:** Both storage operations follow the same pattern for maintainability

---

## 3. Implementation Plan

### Part 1: Dish Image Deletion on Dish Delete

#### Step 1.1: Create Helper Functions for Dish Images

**File:** `app/api/dishes/route.ts`

**Add two helper functions** (can be extracted from edit-dish page or reused):

1. **`extractDishImagePathFromUrl(url: string): string | null`**
   - Parse Supabase storage URL to extract file path for dish images
   - Handles format: `https://{project}.supabase.co/storage/v1/object/public/dish-photos/{filepath}`
   - Returns: `{user_id}/{filename}` (new) or `{filename}` (legacy) or `null` if invalid
   - **Reference:** Lines 309-320 in `app/edit-dish/[id]/page.tsx`

2. **`deleteDishImage(imageUrl: string, supabase: SupabaseClient): Promise<void>`**
   - Extract file path from URL using `extractDishImagePathFromUrl()`
   - Delete image from `dish-photos` bucket using `supabase.storage.from('dish-photos').remove([filePath])`
   - Log deletion success/failure (non-blocking - dish deletion should still succeed)
   - **Reference:** Lines 323-355 in `app/edit-dish/[id]/page.tsx`

#### Step 1.2: Update DELETE Handler

**File:** `app/api/dishes/route.ts` - DELETE handler (lines 284-336)

**Current Flow:**
1. Verify user authentication
2. Verify dish exists and belongs to user
3. Delete dish record from database
4. Return success

**New Flow:**
1. Verify user authentication
2. Verify dish exists and belongs to user
3. **NEW:** Fetch `image_url` from dish record before deletion
4. **NEW:** If `image_url` exists, call `deleteDishImage()` (non-blocking)
5. Delete dish record from database
6. Return success

**Key Points:**
- Fetch image URL before deleting dish record (need it from database)
- Use `select("image_url")` when fetching dish for ownership verification
- Call `deleteDishImage()` with `await` but handle errors gracefully
- Log deletion attempts and results
- Don't block dish deletion if image deletion fails (orphaned images are non-critical)

### Part 2: Profile Picture Deletion on Profile Picture Update

#### Step 2.1: Create Helper Functions for Profile Pictures

**File:** `app/api/upload-profile-picture/route.ts`

**Add helper functions:**

1. **`extractProfilePicturePathFromUrl(url: string): string | null`**
   - Parse Supabase storage URL to extract file path for profile pictures
   - Handles format: `https://{project}.supabase.co/storage/v1/object/public/profile-pictures/{filename}`
   - Profile picture format: `${user.id}-${timestamp}.${ext}` (e.g., `user-id-1234567890.jpg`)
   - Returns: `{filename}` or `null` if invalid
   - **Note:** Profile pictures don't use user_id folder prefix (different from dish photos)
   - **Reference:** Line 112 in `app/api/upload-profile-picture/route.ts` (DELETE handler uses `url.pathname.split('/').pop()`)

2. **`deleteProfilePicture(imageUrl: string, supabase: SupabaseClient): Promise<void>`**
   - Extract file path from URL using `extractProfilePicturePathFromUrl()`
   - Delete image from `profile-pictures` bucket using `supabase.storage.from('profile-pictures').remove([filePath])`
   - Log deletion success/failure (non-blocking - upload should still succeed)
   - Handle errors gracefully

#### Step 2.2: Update POST Handler (Upload)

**File:** `app/api/upload-profile-picture/route.ts` - POST handler (lines 5-87)

**Current Flow:**
1. Verify user authentication
2. Validate file (type, size)
3. Generate filename
4. Upload to storage
5. Get public URL
6. Update user profile with new URL
7. Return success

**New Flow:**
1. Verify user authentication
2. **NEW:** Fetch current `profile_picture_url` from user profile
3. Validate file (type, size)
4. Generate filename
5. **NEW:** If old profile picture exists, call `deleteProfilePicture()` (non-blocking)
6. Upload new picture to storage
7. Get public URL
8. Update user profile with new URL
9. Return success

**Key Points:**
- Fetch old profile picture URL before uploading new one
- Use `select("profile_picture_url")` when fetching user profile
- Call `deleteProfilePicture()` with `await` but handle errors gracefully
- Don't block upload if old picture deletion fails (orphaned images are non-critical)
- Upload should proceed even if deletion fails

### Step 3: Storage Client Setup & RLS Policy Verification

**Dish Photos:**
- File: `app/api/dishes/route.ts`
- Use server-side Supabase client (`createClient(cookieStore)`) for storage operations
- Verify SELECT and DELETE policies exist for `dish-photos` bucket
- Policies should allow users to delete files in their own `{user_id}/` folder

**Profile Pictures:**
- File: `app/api/upload-profile-picture/route.ts`
- Use server-side Supabase client (`createClient(cookies())`) for storage operations
- Verify SELECT and DELETE policies exist for `profile-pictures` bucket
- Policies should allow users to delete their own profile pictures

**See `DATABASE_SCHEMA.md` for policy details**

---

## 4. Implementation Details

### Code Structure

#### Part 1: Dish Image Deletion

**Helper Functions (app/api/dishes/route.ts):**
```typescript
// Helper to extract file path from Supabase storage URL for dish images
function extractDishImagePathFromUrl(url: string): string | null {
  if (!url) return null
  
  // Supabase URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{filepath}
  const match = url.match(/\/storage\/v1\/object\/public\/dish-photos\/(.+)$/)
  if (match && match[1]) {
    return match[1] // Returns: "user-id/filename.jpg" or "old-filename.jpg" (legacy)
  }
  
  return null
}

// Delete dish image from storage
async function deleteDishImage(imageUrl: string, supabase: SupabaseClient): Promise<void> {
  if (!imageUrl) return
  
  const filePath = extractDishImagePathFromUrl(imageUrl)
  
  if (!filePath) {
    console.warn('⚠️ Could not extract file path from URL:', imageUrl)
    return
  }
  
  console.log('🗑️ Deleting dish image:', filePath)
  
  const { data, error } = await supabase.storage
    .from('dish-photos')
    .remove([filePath])
  
  if (error) {
    console.error('❌ Failed to delete dish image:', error)
    // Don't throw - dish deletion should still succeed
  } else {
    console.log('✅ Dish image deleted successfully')
  }
}
```

**Updated DELETE Handler (app/api/dishes/route.ts):**
```typescript
export async function DELETE(request: NextRequest) {
  // ... existing auth and validation ...
  
  // Fetch dish including image_url for deletion
  const { data: existingDish, error: fetchError } = await supabase
    .from("dishes")
    .select("user_id, image_url")  // Added image_url
    .eq("id", id)
    .single()
  
  // ... existing validation ...
  
  // Delete image from storage if it exists
  if (existingDish.image_url) {
    try {
      await deleteDishImage(existingDish.image_url, supabase)
    } catch (error) {
      console.error('Error deleting dish image (non-blocking):', error)
      // Continue with dish deletion even if image deletion fails
    }
  }
  
  // Delete the dish record
  const { error } = await supabase
    .from("dishes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  
  // ... rest of handler ...
}
```

#### Part 2: Profile Picture Deletion

**Helper Functions (app/api/upload-profile-picture/route.ts):**
```typescript
// Helper to extract file path from Supabase storage URL for profile pictures
function extractProfilePicturePathFromUrl(url: string): string | null {
  if (!url) return null
  
  try {
    // Supabase URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{filename}
    // Profile picture format: {user.id}-{timestamp}.{ext}
    const urlObj = new URL(url)
    const fileName = urlObj.pathname.split('/').pop()
    
    if (fileName) {
      return fileName // Returns: "user-id-1234567890.jpg"
    }
    
    return null
  } catch (error) {
    console.warn('⚠️ Invalid URL format:', url)
    return null
  }
}

// Delete profile picture from storage
async function deleteProfilePicture(imageUrl: string, supabase: SupabaseClient): Promise<void> {
  if (!imageUrl) return
  
  const filePath = extractProfilePicturePathFromUrl(imageUrl)
  
  if (!filePath) {
    console.warn('⚠️ Could not extract file path from URL:', imageUrl)
    return
  }
  
  console.log('🗑️ Deleting old profile picture:', filePath)
  
  const { data, error } = await supabase.storage
    .from('profile-pictures')
    .remove([filePath])
  
  if (error) {
    console.error('❌ Failed to delete old profile picture:', error)
    // Don't throw - upload should still succeed
  } else {
    console.log('✅ Old profile picture deleted successfully')
  }
}
```

**Updated POST Handler (app/api/upload-profile-picture/route.ts):**
```typescript
export async function POST(request: NextRequest) {
  // ... existing auth check ...
  
  // Fetch current profile picture URL before uploading new one
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('profile_picture_url')
    .eq('id', user.id)
    .single()
  
  // ... existing file validation ...
  
  // Delete old profile picture if it exists (non-blocking)
  if (userProfile?.profile_picture_url) {
    try {
      await deleteProfilePicture(userProfile.profile_picture_url, supabase)
    } catch (error) {
      console.error('Error deleting old profile picture (non-blocking):', error)
      // Continue with upload even if deletion fails
    }
  }
  
  // ... existing upload logic ...
  // Generate filename, upload to storage, update user profile
  
  // ... rest of handler ...
}
```

---

## 5. Testing Strategy

### Part 1: Dish Image Deletion Tests

1. **Successful Deletion with Image**
   - Delete dish with image URL
   - Verify image is deleted from storage bucket
   - Verify dish record is deleted from database
   - Check console logs for deletion confirmation

2. **Deletion Without Image**
   - Delete dish with no image_url (null or empty)
   - Verify dish record is deleted
   - Verify no storage errors occur

3. **Legacy Format Images**
   - Delete dish with legacy format image (no user_id folder)
   - Verify image deletion works with old format
   - Check console logs for proper path extraction

4. **New Format Images**
   - Delete dish with new format image (`{user_id}/{filename}`)
   - Verify image deletion works
   - Verify RLS policies allow deletion

5. **Error Handling**
   - Simulate storage deletion failure (e.g., invalid URL format)
   - Verify dish record is still deleted (non-blocking)
   - Verify error is logged but doesn't block operation

6. **Ownership Verification**
   - Attempt to delete another user's dish (should fail before image deletion)
   - Verify RLS policies prevent unauthorized deletion

### Part 2: Profile Picture Deletion Tests

1. **Successful Update with Existing Picture**
   - User has existing profile picture
   - Upload new profile picture
   - Verify old picture is deleted from storage bucket
   - Verify new picture URL is saved in database
   - Check console logs for deletion confirmation

2. **Update Without Existing Picture**
   - User has no existing profile picture (first upload)
   - Upload new profile picture
   - Verify new picture is uploaded successfully
   - Verify no storage errors occur (should not try to delete non-existent file)

3. **Update with Invalid/Malformed URL**
   - User profile has invalid/malformed profile_picture_url
   - Upload new profile picture
   - Verify upload succeeds (deletion failure should not block)
   - Verify error is logged but doesn't block operation

4. **Error Handling**
   - Simulate storage deletion failure
   - Verify new picture upload still succeeds (non-blocking)
   - Verify error is logged but doesn't block operation

5. **RLS Policy Verification**
   - Verify users can only delete their own profile pictures
   - Verify RLS policies prevent unauthorized deletion

### Manual Testing Steps

**Dish Images:**
1. Create a dish with an image
2. Verify image exists in Supabase Storage dashboard (dish-photos bucket)
3. Delete the dish from "My Dishes" page
4. Check Supabase Storage dashboard - image should be removed
5. Check database - dish record should be deleted
6. Review server logs for deletion confirmation

**Profile Pictures:**
1. Upload a profile picture (if none exists)
2. Verify picture exists in Supabase Storage dashboard (profile-pictures bucket)
3. Upload a new profile picture from account page
4. Check Supabase Storage dashboard - old picture should be removed
5. Check database - user profile should have new picture URL
6. Review server logs for deletion confirmation

---

## 6. Edge Cases & Considerations

### Edge Cases

1. **Invalid/Malformed URLs**
   - Handle URLs that don't match Supabase pattern
   - Log warning and continue (don't block deletion/upload)

2. **Missing File in Storage**
   - File might already be deleted manually
   - Storage deletion will fail but shouldn't block dish deletion/upload
   - Log warning and continue

3. **Legacy vs New Format (Dish Images)**
   - `extractDishImagePathFromUrl` handles both formats (`{user_id}/{filename}` and `{filename}`)
   - RLS policies should allow deletion for both (verify)

4. **Profile Picture URL Format**
   - Profile pictures use different format than dish images (no user_id folder prefix)
   - Must use appropriate extraction method (`url.pathname.split('/').pop()`)

5. **Network Errors**
   - Storage deletion might fail due to network issues
   - Should not block dish deletion or profile picture upload
   - Could implement retry logic in future

6. **Orphaned Images**
   - Some images might fail to delete (non-critical)
   - Future task: Add cleanup script for orphaned images
   - Current priority: Prevent new orphaned images

### Security Considerations

- **RLS Policies:** 
  - Verify users can only delete their own dish images
  - Verify users can only delete their own profile pictures
- **File Path Validation:** 
  - Ensure extracted paths are valid
  - For dish images: verify paths are within user's folder (if applicable)
  - For profile pictures: verify filename matches expected format
- **Authentication:** 
  - Ensure user is authenticated before storage operations
  - Verify user ownership before attempting deletion
- **Ownership Check:** 
  - For dishes: Verify dish ownership before attempting image deletion
  - For profile pictures: User can only delete their own profile picture (implicit by user.id match)

---

## 7. Benefits

- **Cost Savings:** Prevents storage quota from filling with orphaned images (both dish photos and profile pictures)
- **Storage Efficiency:** Keeps both storage buckets clean and organized
- **Consistency:** 
  - Dish images: Matches behavior of edit-dish form (old photos deleted on update)
  - Profile pictures: Now matches the same pattern as dish images
- **User Experience:** No noticeable impact (happens server-side)
- **Maintainability:** Uses existing, tested patterns from edit-dish form
- **Complete Solution:** Addresses both identified storage leak issues

---

## 8. Future Enhancements

1. **Batch Cleanup Script:** Add script to clean up existing orphaned images (both dish-photos and profile-pictures buckets)
2. **Retry Logic:** Implement retry mechanism for failed deletions
3. **Monitoring:** Add metrics/alerts for failed image deletions
4. **Database Trigger:** Could implement PostgreSQL trigger to auto-delete images (future consideration)
5. **User Account Deletion:** Consider adding profile picture deletion when user account is deleted (if user deletion feature is added)

---

## 9. Files to Modify

1. **`app/api/dishes/route.ts`**
   - Add `extractDishImagePathFromUrl()` helper function
   - Add `deleteDishImage()` helper function
   - Update DELETE handler to fetch `image_url` and call `deleteDishImage()`

2. **`app/api/upload-profile-picture/route.ts`**
   - Add `extractProfilePicturePathFromUrl()` helper function
   - Add `deleteProfilePicture()` helper function
   - Update POST handler to fetch current `profile_picture_url` and call `deleteProfilePicture()` before upload

---

## 10. Implementation Checklist

### Part 1: Dish Image Deletion
- [ ] Add `extractDishImagePathFromUrl()` helper function to DELETE handler
- [ ] Add `deleteDishImage()` helper function to DELETE handler
- [ ] Update DELETE handler to select `image_url` when fetching dish
- [ ] Add image deletion call before dish record deletion
- [ ] Add error handling (non-blocking)
- [ ] Add logging for debugging
- [ ] Test successful deletion with image
- [ ] Test deletion without image
- [ ] Test with legacy format images
- [ ] Test with new format images
- [ ] Verify error handling (non-blocking behavior)
- [ ] Verify RLS policies allow deletion

### Part 2: Profile Picture Deletion
- [ ] Add `extractProfilePicturePathFromUrl()` helper function to POST handler
- [ ] Add `deleteProfilePicture()` helper function to POST handler
- [ ] Update POST handler to fetch current `profile_picture_url` before upload
- [ ] Add profile picture deletion call before uploading new picture
- [ ] Add error handling (non-blocking)
- [ ] Add logging for debugging
- [ ] Test successful update with existing picture
- [ ] Test update without existing picture (first upload)
- [ ] Test with invalid/malformed URL
- [ ] Verify error handling (non-blocking behavior)
- [ ] Verify RLS policies allow deletion

### Documentation
- [ ] Document in `Implementation.md`
- [ ] Document in `Bug_tracking.md`

---

## 11. Key Lessons from Reference Implementation

From `BUG-036` resolution:
1. **SELECT Policy Required:** Supabase Storage requires SELECT policy for deletion to work
2. **File Path Format:** 
   - Dish images: Must handle both `{user_id}/{filename}` (new) and `{filename}` (legacy)
   - Profile pictures: Use `{filename}` format (no user_id folder prefix)
3. **Error Handling:** Deletion failures should not block main operation
4. **URL Parsing:** 
   - Dish images: Use regex to extract file path from Supabase storage URLs
   - Profile pictures: Use `url.pathname.split('/').pop()` method (existing pattern)
5. **RLS Security:** 
   - Users can only delete files in their own folders (dish images)
   - Users can only delete their own profile pictures
6. **Bucket-Specific Logic:** Different buckets may have different file organization patterns - use appropriate extraction method for each

---

## 12. Success Criteria

### Dish Images
✅ Dish images are automatically deleted when dishes are deleted  
✅ No orphaned dish images accumulate in storage  
✅ Deletion works for both legacy and new file path formats  
✅ Errors don't block dish deletion  
✅ RLS policies are respected

### Profile Pictures
✅ Old profile pictures are automatically deleted when new ones are uploaded  
✅ No orphaned profile pictures accumulate in storage  
✅ Deletion works with existing profile picture URL format  
✅ Errors don't block profile picture upload  
✅ RLS policies are respected

### Overall
✅ Storage costs remain manageable  
✅ Both storage buckets stay clean and organized  
✅ Complete solution addresses all identified storage leak issues

---

**Ready for Implementation:** All requirements understood, reference implementations reviewed, and plan documented.

