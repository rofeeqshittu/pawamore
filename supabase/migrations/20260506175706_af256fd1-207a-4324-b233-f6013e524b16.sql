
-- 1) Hide soft-deleted products from public listings
DROP POLICY IF EXISTS "Products viewable by everyone" ON public.products;
CREATE POLICY "Products viewable by everyone"
  ON public.products FOR SELECT
  TO public
  USING (deleted_at IS NULL AND status <> 'deleted');

-- 2) Avatar uploads must be in the user's own folder
DROP POLICY IF EXISTS "Authenticated upload avatars" ON storage.objects;
CREATE POLICY "Authenticated upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 3) Lock down internal SECURITY DEFINER functions (used by triggers/RLS only)
REVOKE EXECUTE ON FUNCTION public.set_deleted_at() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_order_total() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_order_total_trigger() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_review_approval() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_order_item_price() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_order_item_price() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM public, anon, authenticated;
-- has_role stays callable by authenticated (used by RLS via auth.uid()); revoke from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
