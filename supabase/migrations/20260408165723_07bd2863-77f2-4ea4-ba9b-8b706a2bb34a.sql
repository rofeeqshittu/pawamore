-- 1. Prevent users from self-approving reviews via a BEFORE UPDATE trigger
CREATE OR REPLACE FUNCTION public.guard_review_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If is_approved is being changed and the caller is not an admin, block it
  IF NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      NEW.is_approved := OLD.is_approved; -- silently revert
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guard_review_approval
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.guard_review_approval();

-- 2. Remove the overpermissive review-images INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload review images" ON storage.objects;

-- 3. Add DELETE policy for avatars bucket
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);