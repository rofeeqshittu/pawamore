
-- Create review_images table for photo reviews
CREATE TABLE public.review_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

-- Everyone can see images of approved reviews
CREATE POLICY "Review images viewable for approved reviews"
ON public.review_images FOR SELECT TO public
USING (EXISTS (
  SELECT 1 FROM product_reviews
  WHERE product_reviews.id = review_images.review_id
  AND product_reviews.is_approved = true
));

-- Users can insert images for their own reviews
CREATE POLICY "Users can add images to own reviews"
ON public.review_images FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM product_reviews
  WHERE product_reviews.id = review_images.review_id
  AND product_reviews.user_id = auth.uid()
));

-- Users can delete images from own reviews
CREATE POLICY "Users can delete own review images"
ON public.review_images FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM product_reviews
  WHERE product_reviews.id = review_images.review_id
  AND product_reviews.user_id = auth.uid()
));

-- Admins manage all
CREATE POLICY "Admins manage review images"
ON public.review_images FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create review-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);

-- Storage policies for review images
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'review-images');

CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'review-images');

CREATE POLICY "Users can delete own review images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'review-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Public view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Allow users to update/delete own reviews
CREATE POLICY "Users can update own reviews"
ON public.product_reviews FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON public.product_reviews FOR DELETE TO authenticated
USING (auth.uid() = user_id);
