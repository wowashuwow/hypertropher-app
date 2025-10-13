-- Add SELECT (read) RLS Policy for dish-photos Storage Bucket
-- This is REQUIRED for DELETE operations to work
-- Supabase Storage needs SELECT permission to verify file exists before deleting

-- ============================================
-- ADD SELECT POLICY FOR DISH-PHOTOS
-- ============================================

CREATE POLICY "Dish photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dish-photos');

-- ============================================
-- VERIFICATION - Show all policies for dish-photos
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

