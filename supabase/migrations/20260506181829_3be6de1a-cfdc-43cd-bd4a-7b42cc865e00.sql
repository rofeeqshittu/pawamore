
-- Tighten review-images bucket policies
DROP POLICY IF EXISTS "Review images publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Review images select for approved" ON storage.objects;
DROP POLICY IF EXISTS "Users update own review images" ON storage.objects;

CREATE POLICY "Review images select for approved"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'review-images'
  AND EXISTS (
    SELECT 1
    FROM public.review_images ri
    JOIN public.product_reviews pr ON pr.id = ri.review_id
    WHERE ri.image_url LIKE '%' || storage.objects.name
      AND pr.is_approved = true
  )
);

CREATE POLICY "Users update own review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
