-- Fix DELETE RLS Policy for dish-photos Storage Bucket
-- Allow users to delete photos in their folder even if owner is null (for migrated photos)

-- Drop the old policy
DROP POLICY IF EXISTS "Users can delete their own dish photos" ON storage.objects;

-- Create new policy that checks folder name instead of owner
CREATE POLICY "Users can delete their own dish photos"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'dish-photos' 
  AND (
    -- Check if user owns the folder (user_id matches folder name)
    (auth.uid())::text = (storage.foldername(name))[1]
  )
);

-- ============================================
-- VERIFICATION - Show the updated policy
-- ============================================

SELECT 
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname = 'Users can delete their own dish photos';

