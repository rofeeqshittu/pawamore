
-- 1) Guest order items access via security-definer function
CREATE OR REPLACE FUNCTION public.get_guest_order_items(p_guest_email text, p_order_id uuid)
RETURNS TABLE(id uuid, order_id uuid, product_id uuid, product_name text, quantity int, unit_price numeric, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.quantity, oi.unit_price, oi.created_at
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.id = p_order_id
    AND o.user_id IS NULL
    AND o.guest_email = p_guest_email;
$$;

REVOKE ALL ON FUNCTION public.get_guest_order_items(text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_guest_order_items(text, uuid) TO anon, authenticated;

-- 2) Storage: prevent bucket listing while keeping public file URLs working.
-- Public buckets serve files via the public CDN endpoint (bypasses RLS).
-- Removing broad SELECT policies on storage.objects only prevents the listObjects API.
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Public view avatars" ON storage.objects;
