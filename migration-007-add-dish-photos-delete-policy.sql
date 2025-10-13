-- Add DELETE RLS Policy for dish-photos Storage Bucket
-- This allows users to delete only their own dish photos (stored in {user_id}/ folders)

-- ============================================
-- STORAGE BUCKET RLS POLICY
-- ============================================

CREATE POLICY "Users can delete their own dish photos"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'dish-photos' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- ============================================
-- VERIFICATION - Show all storage policies for dish-photos
-- ============================================

SELECT 
    policyname,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND (qual LIKE '%dish-photos%' OR with_check LIKE '%dish-photos%')
ORDER BY cmd, policyname;

