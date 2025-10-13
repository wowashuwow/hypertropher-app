# Supabase Storage & RLS Policy Workflow

## Overview
This document provides a systematic approach to working with Supabase Storage and Row Level Security (RLS) policies. It's designed to prevent lengthy troubleshooting sessions by ensuring all necessary configurations are in place from the start.

## Table of Contents
1. [Storage Bucket Setup](#storage-bucket-setup)
2. [RLS Policy Requirements](#rls-policy-requirements)
3. [Photo Upload Implementation](#photo-upload-implementation)
4. [Photo Deletion Implementation](#photo-deletion-implementation)
5. [Troubleshooting Checklist](#troubleshooting-checklist)
6. [Common Pitfalls](#common-pitfalls)

---

## Storage Bucket Setup

### 1. Create Storage Bucket
```sql
-- Create bucket in Supabase Dashboard or via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('bucket-name', 'bucket-name', true);
```

### 2. Enable RLS on Storage Bucket
```sql
-- RLS must be enabled for security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### 3. Verify Bucket Exists
```sql
-- Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'bucket-name';
```

---

## RLS Policy Requirements

### Critical Rule: Storage Operations Require Multiple Policies

**🚨 IMPORTANT: Supabase Storage requires specific RLS policies for each operation:**

| Operation | Required Policies | Why Both Are Needed |
|-----------|------------------|---------------------|
| **Upload (INSERT)** | SELECT + INSERT | SELECT verifies bucket access, INSERT allows file creation |
| **Download (SELECT)** | SELECT | Allows reading file metadata and content |
| **Delete (DELETE)** | SELECT + DELETE | **SELECT verifies file exists**, DELETE removes it |
| **Update (UPDATE)** | SELECT + UPDATE | SELECT verifies file exists, UPDATE modifies it |

### Why DELETE Needs SELECT Policy

**Root Cause of Silent Deletion Failures:**
- Supabase Storage API uses SELECT to verify file existence before deletion
- Without SELECT policy, the API cannot confirm the file exists
- DELETE operation fails silently, returning success but not deleting the file
- This is **NOT documented clearly** in Supabase docs

### Complete RLS Policy Set for File Management

```sql
-- 1. SELECT Policy (REQUIRED for all operations)
CREATE POLICY "Public read access to bucket-name"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bucket-name');

-- 2. INSERT Policy (for uploads)
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'bucket-name'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. DELETE Policy (for deletions)
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'bucket-name'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. UPDATE Policy (for updates, if needed)
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'bucket-name'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
```

---

## Photo Upload Implementation

### 1. File Structure Best Practices

**✅ Recommended: User ID Prefix**
```typescript
// Structure: {user_id}/{filename}
const filePath = `${user.id}/${timestamp}-${randomString}-${filename}`
// Example: "a1b2c3d4-5678-90ab-cdef-1234567890ab/1760180575803-uhrkbd-dish.jpg"
```

**Benefits:**
- Enables user-specific RLS policies
- Prevents unauthorized deletion
- Organized file structure
- Easy cleanup per user

**❌ Avoid: Bucket Root or Shared Folders**
```typescript
// BAD: No user association
const filePath = `${filename}`

// BAD: Cannot enforce user-level security
const filePath = `shared/${filename}`
```

### 2. Upload Function Template

```typescript
const uploadPhoto = async (file: File): Promise<string> => {
  const supabase = createClient()

  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('You must be logged in to upload photos')
  }

  // 2. Generate unique filename with user ID prefix
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const fileName = `${timestamp}-${randomString}-${file.name}`
  const filePath = `${user.id}/${fileName}`

  // 3. Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('bucket-name')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // Prevent overwriting
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw new Error(`Failed to upload photo: ${uploadError.message}`)
  }

  // 4. Get public URL
  const { data: urlData } = supabase.storage
    .from('bucket-name')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}
```

---

## Photo Deletion Implementation

### 1. Extract File Path from URL

```typescript
const extractFilePathFromUrl = (url: string): string | null => {
  if (!url) return null

  // Supabase URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{filepath}
  // Extract full path including user ID folder
  const match = url.match(/\/storage\/v1\/object\/public\/bucket-name\/(.+)$/)
  
  if (match && match[1]) {
    return match[1] // Returns: "user-id/filename.jpg"
  }

  return null
}
```

### 2. Delete Function Template

```typescript
const deleteOldPhoto = async (oldImageUrl: string): Promise<void> => {
  if (!oldImageUrl) return

  const supabase = createClient()
  const filePath = extractFilePathFromUrl(oldImageUrl)

  if (!filePath) {
    console.warn('⚠️ Could not extract file path from URL:', oldImageUrl)
    return
  }

  console.log('🗑️ Deleting old photo:', filePath)

  // Optional: Verify user ownership
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    console.log('👤 Current user ID:', user.id)
    console.log('📂 File path parts:', filePath.split('/'))
  }

  const { data, error } = await supabase.storage
    .from('bucket-name')
    .remove([filePath])

  if (error) {
    console.error('❌ Failed to delete old photo:', error)
    console.error('❌ Error details:', JSON.stringify(error, null, 2))
    // Don't throw - let the update succeed even if deletion fails
  } else {
    console.log('✅ Old photo deleted successfully')
    console.log('✅ Delete response data:', data)
  }
}
```

### 3. Integration in Update Flow

```typescript
const handleSubmit = async () => {
  try {
    // 1. Delete old photo if new one is being uploaded
    if (photo && imageUrl) {
      await deleteOldPhoto(imageUrl)
    }

    // 2. Upload new photo
    let finalImageUrl = imageUrl
    if (photo) {
      finalImageUrl = await uploadPhoto(photo)
    }

    // 3. Update database with new URL
    const response = await fetch('/api/endpoint', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: finalImageUrl })
    })

    if (!response.ok) {
      throw new Error('Update failed')
    }

    toast.success('Updated successfully')
  } catch (error) {
    console.error('Error:', error)
    toast.error('Update failed')
  }
}
```

---

## Troubleshooting Checklist

### When Photos Won't Upload

- [ ] **RLS Enabled**: Check if RLS is enabled on `storage.objects`
  ```sql
  SELECT * FROM pg_tables WHERE tablename = 'objects' AND schemaname = 'storage';
  ```

- [ ] **INSERT Policy Exists**: Verify INSERT policy exists and is correct
  ```sql
  SELECT * FROM pg_policies 
  WHERE tablename = 'objects' 
  AND schemaname = 'storage' 
  AND cmd = 'INSERT';
  ```

- [ ] **User Authenticated**: Ensure `auth.uid()` is available during upload

- [ ] **Bucket Exists**: Verify bucket is created and public
  ```sql
  SELECT * FROM storage.buckets WHERE id = 'bucket-name';
  ```

- [ ] **File Path Format**: Check file path uses correct user ID prefix

### When Photos Won't Delete (MOST COMMON ISSUE)

**🚨 PRIMARY CHECK: Do you have BOTH SELECT and DELETE policies?**

- [ ] **SELECT Policy Exists**: **CRITICAL - Required for deletion to work**
  ```sql
  SELECT * FROM pg_policies 
  WHERE tablename = 'objects' 
  AND schemaname = 'storage' 
  AND cmd = 'SELECT';
  ```

- [ ] **DELETE Policy Exists**: Check DELETE policy exists and is correct
  ```sql
  SELECT * FROM pg_policies 
  WHERE tablename = 'objects' 
  AND schemaname = 'storage' 
  AND cmd = 'DELETE';
  ```

- [ ] **File Path Correct**: Verify extracted file path matches stored path
  ```typescript
  console.log('🔍 File path to delete:', filePath)
  console.log('🔍 User ID:', user.id)
  console.log('🔍 Path parts:', filePath.split('/'))
  ```

- [ ] **User Ownership**: Ensure file path starts with user's ID
  ```typescript
  // File path should be: "user-id/filename.jpg"
  const isOwner = filePath.startsWith(`${user.id}/`)
  ```

- [ ] **Console Logs**: Check for silent failures
  ```typescript
  // Success message but no actual deletion = Missing SELECT policy
  console.log('✅ Delete response data:', data) // Check if empty array []
  ```

### When Photos Upload But URLs Are Wrong

- [ ] **Public URL Format**: Verify `getPublicUrl()` returns correct format

- [ ] **Path Consistency**: Ensure same path format for upload and URL generation

- [ ] **Bucket Name**: Verify bucket name matches in upload and URL functions

---

## Common Pitfalls

### 1. Missing SELECT Policy for DELETE Operations

**❌ Symptom:**
- Delete operation returns success
- Console shows "✅ Old photo deleted successfully"
- Response data is empty array: `[]`
- File remains in storage bucket

**✅ Solution:**
```sql
-- Add SELECT policy for public read access
CREATE POLICY "Public access to bucket-name"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bucket-name');
```

### 2. Files Without User ID Prefixes

**❌ Problem:**
- Files stored in bucket root: `filename.jpg`
- Cannot implement user-specific RLS policies
- Security vulnerabilities

**✅ Solution:**
- Always use user ID prefix: `{user_id}/{filename}`
- Migrate existing files to new structure
- Update RLS policies to check user ID in path

### 3. Inconsistent File Path Formats

**❌ Problem:**
- Upload uses: `user-id/file.jpg`
- Delete uses: `file.jpg`
- Path mismatch causes deletion to fail

**✅ Solution:**
```typescript
// Consistent path extraction
const extractFilePathFromUrl = (url: string): string | null => {
  const match = url.match(/\/storage\/v1\/object\/public\/bucket-name\/(.+)$/)
  return match?.[1] || null
}

// Always returns full path: "user-id/filename.jpg"
```

### 4. Not Checking RLS Policies First

**❌ Approach:**
- Start debugging code logic
- Check file paths
- Review error messages
- Spend hours troubleshooting

**✅ Correct Approach:**
1. **First**: List all RLS policies
   ```sql
   SELECT schemaname, tablename, policyname, cmd, qual, with_check
   FROM pg_policies 
   WHERE schemaname = 'storage' AND tablename = 'objects';
   ```

2. **Second**: Verify required policies exist:
   - SELECT policy ✓
   - INSERT policy ✓ (if uploading)
   - DELETE policy ✓ (if deleting)
   - UPDATE policy ✓ (if updating)

3. **Third**: Check policy logic matches file structure

4. **Finally**: Debug code if policies are correct

### 5. Silent Failures Without Logging

**❌ Problem:**
- No console logs
- Operations fail silently
- No debugging information

**✅ Solution:**
```typescript
// Comprehensive logging
console.log('🔄 Starting operation...')
console.log('👤 User ID:', user.id)
console.log('📂 File path:', filePath)

const { data, error } = await supabase.storage.from('bucket').remove([filePath])

console.log('📊 Response data:', data)
console.log('❌ Error (if any):', error)

if (error) {
  console.error('❌ Full error details:', JSON.stringify(error, null, 2))
}
```

---

## Data Migration for Existing Files

### When to Migrate

Migrate existing files when:
- Files are in bucket root without user ID prefixes
- RLS policies require user-specific paths
- Security improvements are needed

### Migration API Template

```typescript
// app/api/migrate-storage/route.ts
import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()
    
    // 1. Get all records with file URLs
    const { data: records, error: queryError } = await supabase
      .from('table_name')
      .select('id, user_id, file_url')
      .not('file_url', 'is', null)
    
    if (queryError) throw queryError

    const results = {
      total: records.length,
      migrated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as any[]
    }

    for (const record of records) {
      const { id, user_id, file_url } = record
      
      // Extract old path
      const oldPath = extractFilePathFromUrl(file_url)
      if (!oldPath) {
        results.skipped++
        continue
      }

      // Skip if already migrated
      if (oldPath.startsWith(`${user_id}/`)) {
        results.skipped++
        continue
      }

      // New path with user ID prefix
      const filename = oldPath.replace(/^.*\//, '')
      const newPath = `${user_id}/${filename}`

      try {
        // Download old file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('bucket-name')
          .download(oldPath)

        if (downloadError) throw downloadError

        // Upload to new location
        const { error: uploadError } = await supabase.storage
          .from('bucket-name')
          .upload(newPath, fileData, { upsert: false })

        if (uploadError) throw uploadError

        // Update database
        const newUrl = file_url.replace(oldPath, newPath)
        const { error: updateError } = await supabase
          .from('table_name')
          .update({ file_url: newUrl })
          .eq('id', id)

        if (updateError) throw updateError

        // Delete old file
        await supabase.storage.from('bucket-name').remove([oldPath])

        results.migrated++
      } catch (error) {
        results.failed++
        results.errors.push({ record_id: id, error })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
```

---

## Quick Reference Commands

### Check All Storage Policies
```sql
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY cmd;
```

### Check Bucket Configuration
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets;
```

### Check RLS Status
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

### List Files in Bucket
```sql
SELECT name, bucket_id, owner, created_at
FROM storage.objects
WHERE bucket_id = 'bucket-name'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Best Practices Summary

### ✅ DO

1. **Always create both SELECT and DELETE policies** for file deletion to work
2. **Use user ID prefixes** in file paths for security: `{user_id}/{filename}`
3. **Check RLS policies first** when troubleshooting storage issues
4. **Add comprehensive logging** to track operations and failures
5. **Extract file paths correctly** from URLs, preserving user ID folders
6. **Test deletion** immediately after implementing upload functionality
7. **Document storage structure** in DATABASE_SCHEMA.md

### ❌ DON'T

1. **Don't assume DELETE policy alone is enough** - SELECT is also required
2. **Don't store files in bucket root** - always use user ID prefixes
3. **Don't trust "success" messages** - verify files are actually deleted
4. **Don't skip policy verification** when debugging storage issues
5. **Don't use different path formats** for upload and deletion
6. **Don't forget to migrate existing files** when changing storage structure
7. **Don't implement storage without checking this workflow first**

---

## Lessons Learned from BUG-036

### The Issue
- Old dish photos were not being deleted despite "success" messages
- Console showed "✅ Old photo deleted successfully" but files remained
- Response data was empty array: `[]`
- Hours of troubleshooting focused on wrong areas

### Root Cause
**Missing SELECT RLS Policy** - Supabase Storage requires both SELECT and DELETE policies for deletion to work. This is not clearly documented.

### Prevention
1. **Check policies FIRST** before debugging code
2. **Verify both SELECT and DELETE policies exist** for deletion operations
3. **Look for empty response arrays** as indicator of missing SELECT policy
4. **Test deletion immediately** after upload implementation

### Key Takeaway
> **When deletion silently fails with "success" message and empty response data, the problem is almost always a missing SELECT policy on the storage bucket.**

---

## Document Maintenance

- **Last Updated**: 2025-01-10
- **Updated By**: Development Team
- **Related Bugs**: BUG-036 (Missing DELETE RLS Policy for Dish Photos)
- **Related Files**: 
  - `lib/supabase/client.ts`
  - `lib/supabase/service.ts`
  - `DATABASE_SCHEMA.md`

---

**Remember**: Always verify RLS policies exist before spending hours debugging code. Most Supabase Storage issues are policy-related, not code-related.

